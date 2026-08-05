import "server-only";
import { connectDB, Appointment, Doctor, LabRequest, PharmacyDrug, Prescription, Patient, Bill, Payment } from "@/models";
import type { IPatient, IDoctor, IUser } from "@/models";

function todayDate(): Date {
  return new Date(new Date().toISOString().slice(0, 10));
}

type DoctorWithUser = IDoctor & { userId: IUser };

export interface AdminStats {
  totalPatients: number;
  totalDoctors: number;
  todayAppointments: number;
  pendingLabRequests: number;
  lowStockCount: number;
  unpaidBillsCount: number;
  outstandingAmount: number;
  recentAppointments: {
    id: string;
    appointment_number: string;
    appointment_date: Date;
    appointment_time: string;
    status: string;
    patient_first_name: string;
    patient_last_name: string;
    doctor_name: string;
  }[];
  statusBreakdown: { status: string; total: number }[];
  monthlyRevenue: { month: string; total: number }[];
}

export async function getAdminStats(): Promise<AdminStats> {
  await connectDB();

  const [totalPatients, totalDoctors, todayAppointments, pendingLabRequests, lowStockCount] = await Promise.all([
    Patient.countDocuments(),
    Doctor.countDocuments({ status: "active" }),
    Appointment.countDocuments({ appointmentDate: todayDate() }),
    LabRequest.countDocuments({ status: { $in: ["requested", "processing"] } }),
    PharmacyDrug.countDocuments({ $expr: { $lte: ["$quantityInStock", "$reorderLevel"] } }),
  ]);

  const [billStats] = await Bill.aggregate<{ unpaidCount: number; outstanding: number }>([
    { $match: { status: { $in: ["unpaid", "partial"] } } },
    {
      $lookup: {
        from: "payments",
        localField: "_id",
        foreignField: "billId",
        as: "payments",
      },
    },
    {
      $addFields: {
        paid: { $sum: "$payments.amount" },
      },
    },
    {
      $group: {
        _id: null,
        unpaidCount: { $sum: 1 },
        outstanding: { $sum: { $subtract: ["$total", "$paid"] } },
      },
    },
  ]);

  const recentAppointmentDocs = await Appointment.find()
    .populate<{ patientId: IPatient }>("patientId")
    .populate<{ doctorId: DoctorWithUser }>({ path: "doctorId", populate: { path: "userId" } })
    .sort({ createdAt: -1 })
    .limit(8);

  const recentAppointments = recentAppointmentDocs.map((a) => ({
    id: a.id,
    appointment_number: a.appointmentNumber,
    appointment_date: a.appointmentDate,
    appointment_time: a.appointmentTime,
    status: a.status,
    patient_first_name: a.patientId?.firstName ?? "",
    patient_last_name: a.patientId?.lastName ?? "",
    doctor_name: a.doctorId?.userId?.name ?? "",
  }));

  const statusBreakdownAgg = await Appointment.aggregate<{ _id: string; total: number }>([
    { $group: { _id: "$status", total: { $sum: 1 } } },
  ]);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const monthlyRevenueAgg = await Payment.aggregate<{ _id: string; total: number }>([
    { $match: { paymentDate: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$paymentDate" } },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const monthLabel = (ym: string) => {
    const [year, month] = ym.split("-").map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return {
    totalPatients,
    totalDoctors,
    todayAppointments,
    pendingLabRequests,
    lowStockCount,
    unpaidBillsCount: billStats?.unpaidCount ?? 0,
    outstandingAmount: billStats?.outstanding ?? 0,
    recentAppointments,
    statusBreakdown: statusBreakdownAgg.map((s) => ({ status: s._id, total: s.total })),
    monthlyRevenue: monthlyRevenueAgg.map((m) => ({ month: monthLabel(m._id), total: m.total })),
  };
}

export interface DoctorStats {
  noDoctorProfile?: boolean;
  todayAppointments: number;
  myPatients: number;
  pendingLabRequests: number;
  todayList: {
    id: string;
    appointment_number: string;
    appointment_time: string;
    status: string;
    type: string | null;
    patient_first_name: string;
    patient_last_name: string;
    patient_number: string;
  }[];
}

export async function getDoctorStats(userId: string): Promise<DoctorStats> {
  await connectDB();

  const doctor = await Doctor.findOne({ userId });
  if (!doctor) return { noDoctorProfile: true, todayAppointments: 0, myPatients: 0, pendingLabRequests: 0, todayList: [] };

  const today = todayDate();

  const [todayAppointments, myPatientsAgg, pendingLabRequests, todayListDocs] = await Promise.all([
    Appointment.countDocuments({ doctorId: doctor.id, appointmentDate: today }),
    Appointment.aggregate<{ _id: null; count: number }>([
      { $match: { doctorId: doctor._id } },
      { $group: { _id: "$patientId" } },
      { $count: "count" },
    ]),
    LabRequest.countDocuments({ doctorId: doctor.id, status: { $in: ["requested", "processing"] } }),
    Appointment.find({ doctorId: doctor.id, appointmentDate: today })
      .populate<{ patientId: IPatient }>("patientId")
      .sort({ appointmentTime: 1 }),
  ]);

  return {
    todayAppointments,
    myPatients: (myPatientsAgg[0] as unknown as { count: number } | undefined)?.count ?? 0,
    pendingLabRequests,
    todayList: todayListDocs.map((a) => ({
      id: a.id,
      appointment_number: a.appointmentNumber,
      appointment_time: a.appointmentTime,
      status: a.status,
      type: a.type,
      patient_first_name: a.patientId?.firstName ?? "",
      patient_last_name: a.patientId?.lastName ?? "",
      patient_number: a.patientId?.patientNumber ?? "",
    })),
  };
}

export interface PharmacistStats {
  pendingPrescriptions: number;
  lowStockList: { id: string; drug_name: string; quantity_in_stock: number; reorder_level: number }[];
  pendingPrescriptionList: {
    id: string;
    patient_first_name: string;
    patient_last_name: string;
    doctor_name: string;
    created_at: Date;
  }[];
}

export async function getPharmacistStats(): Promise<PharmacistStats> {
  await connectDB();

  const [pendingPrescriptions, lowStockRows, pendingPrescriptionDocs] = await Promise.all([
    Prescription.countDocuments({ status: "pending" }),
    PharmacyDrug.find({ $expr: { $lte: ["$quantityInStock", "$reorderLevel"] } })
      .sort({ quantityInStock: 1 })
      .limit(8),
    Prescription.find({ status: "pending" })
      .populate<{ patientId: IPatient }>("patientId")
      .populate<{ doctorId: DoctorWithUser }>({ path: "doctorId", populate: { path: "userId" } })
      .sort({ createdAt: 1 })
      .limit(8),
  ]);

  return {
    pendingPrescriptions,
    lowStockList: lowStockRows.map((d) => ({
      id: d.id,
      drug_name: d.drugName,
      quantity_in_stock: d.quantityInStock,
      reorder_level: d.reorderLevel,
    })),
    pendingPrescriptionList: pendingPrescriptionDocs.map((p) => ({
      id: p.id,
      patient_first_name: p.patientId?.firstName ?? "",
      patient_last_name: p.patientId?.lastName ?? "",
      doctor_name: p.doctorId?.userId?.name ?? "—",
      created_at: p.createdAt,
    })),
  };
}

export interface LabTechStats {
  pendingLabRequests: number;
  pendingList: { id: string; request_number: string; status: string; created_at: Date; patient_first_name: string; patient_last_name: string }[];
}

export async function getLabTechStats(): Promise<LabTechStats> {
  await connectDB();

  const [pendingLabRequests, pendingListDocs] = await Promise.all([
    LabRequest.countDocuments({ status: { $in: ["requested", "processing"] } }),
    LabRequest.find({ status: { $in: ["requested", "processing"] } })
      .populate<{ patientId: IPatient }>("patientId")
      .sort({ createdAt: 1 })
      .limit(8),
  ]);

  return {
    pendingLabRequests,
    pendingList: pendingListDocs.map((r) => ({
      id: r.id,
      request_number: r.requestNumber,
      status: r.status,
      created_at: r.createdAt,
      patient_first_name: r.patientId?.firstName ?? "",
      patient_last_name: r.patientId?.lastName ?? "",
    })),
  };
}

export interface ReceptionStats {
  todayAppointments: number;
  totalPatients: number;
  unpaidBillsCount: number;
  todayList: {
    id: string;
    appointment_number: string;
    appointment_time: string;
    status: string;
    patient_first_name: string;
    patient_last_name: string;
    doctor_name: string;
  }[];
}

export async function getReceptionStats(): Promise<ReceptionStats> {
  await connectDB();

  const today = todayDate();

  const [todayAppointments, totalPatients, unpaidBillsCount, todayListDocs] = await Promise.all([
    Appointment.countDocuments({ appointmentDate: today }),
    Patient.countDocuments(),
    Bill.countDocuments({ status: { $in: ["unpaid", "partial"] } }),
    Appointment.find({ appointmentDate: today })
      .populate<{ patientId: IPatient }>("patientId")
      .populate<{ doctorId: DoctorWithUser }>({ path: "doctorId", populate: { path: "userId" } })
      .sort({ appointmentTime: 1 }),
  ]);

  return {
    todayAppointments,
    totalPatients,
    unpaidBillsCount,
    todayList: todayListDocs.map((a) => ({
      id: a.id,
      appointment_number: a.appointmentNumber,
      appointment_time: a.appointmentTime,
      status: a.status,
      patient_first_name: a.patientId?.firstName ?? "",
      patient_last_name: a.patientId?.lastName ?? "",
      doctor_name: a.doctorId?.userId?.name ?? "",
    })),
  };
}
