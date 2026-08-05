import "server-only";
import {
  connectDB,
  Patient,
  Appointment,
  Payment,
  Bill,
  PharmacyDrug,
  Prescription,
  LabRequest,
  Doctor,
  User,
  Staff,
} from "@/models";

function dateRange(from?: string, to?: string): { $gte: Date; $lte: Date } | null {
  if (!from || !to) return null;
  const start = new Date(from);
  const end = new Date(to);
  end.setHours(23, 59, 59, 999);
  return { $gte: start, $lte: end };
}

/* ------------------------------------------------------------
   1. Patients Report
   ------------------------------------------------------------ */
export async function getPatientsReport(from?: string, to?: string) {
  await connectDB();

  const range = dateRange(from, to);

  const [total, newInRangeCount, genderBreakdownAgg, bloodGroupBreakdownAgg, recentDocs] = await Promise.all([
    Patient.countDocuments(),
    range ? Patient.countDocuments({ createdAt: range }) : Promise.resolve(null),
    Patient.aggregate<{ _id: string; total: number }>([{ $group: { _id: "$gender", total: { $sum: 1 } } }]),
    Patient.aggregate<{ _id: string; total: number }>([
      { $group: { _id: { $ifNull: ["$bloodGroup", "Unknown"] }, total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    Patient.find(range ? { createdAt: range } : {})
      .sort({ createdAt: -1 })
      .limit(25),
  ]);

  return {
    total,
    newInRange: newInRangeCount ?? total,
    genderBreakdown: genderBreakdownAgg.map((g) => ({ gender: g._id, total: g.total })),
    bloodGroupBreakdown: bloodGroupBreakdownAgg.map((b) => ({ bloodGroup: b._id, total: b.total })),
    recent: recentDocs.map((p) => ({
      id: p.id,
      patient_number: p.patientNumber,
      first_name: p.firstName,
      last_name: p.lastName,
      gender: p.gender,
      phone: p.phone,
      created_at: p.createdAt,
    })),
  };
}

/* ------------------------------------------------------------
   2. Appointments Report
   ------------------------------------------------------------ */
export async function getAppointmentsReport(from?: string, to?: string) {
  await connectDB();

  const range = dateRange(from, to);
  const match = range ? { appointmentDate: range } : {};

  const [total, statusBreakdownAgg, byDepartmentAgg, byDoctorAgg] = await Promise.all([
    Appointment.countDocuments(match),
    Appointment.aggregate<{ _id: string; total: number }>([{ $match: match }, { $group: { _id: "$status", total: { $sum: 1 } } }]),
    Appointment.aggregate<{ _id: string; total: number }>([
      { $match: match },
      { $lookup: { from: "departments", localField: "departmentId", foreignField: "_id", as: "dept" } },
      { $addFields: { deptName: { $ifNull: [{ $arrayElemAt: ["$dept.name", 0] }, "Unassigned"] } } },
      { $group: { _id: "$deptName", total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    Appointment.aggregate<{ _id: string; total: number }>([
      { $match: match },
      { $lookup: { from: "doctors", localField: "doctorId", foreignField: "_id", as: "doc" } },
      { $unwind: "$doc" },
      { $lookup: { from: "users", localField: "doc.userId", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $group: { _id: "$user.name", total: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]),
  ]);

  return {
    total,
    statusBreakdown: statusBreakdownAgg.map((s) => ({ status: s._id, total: s.total })),
    byDepartment: byDepartmentAgg.map((d) => ({ department: d._id, total: d.total })),
    byDoctor: byDoctorAgg.map((d) => ({ doctor: d._id, total: d.total })),
  };
}

/* ------------------------------------------------------------
   3. Revenue Report
   ------------------------------------------------------------ */
export async function getRevenueReport(from?: string, to?: string) {
  await connectDB();

  const range = dateRange(from, to);
  const paymentMatch = range ? { paymentDate: range } : {};
  const billMatch = range ? { createdAt: range } : {};

  const [totalsAgg, byMethodAgg, byCategoryAgg, outstandingAgg, recentPaymentDocs] = await Promise.all([
    Payment.aggregate<{ _id: null; totalRevenue: number; paymentCount: number }>([
      { $match: paymentMatch },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" }, paymentCount: { $sum: 1 } } },
    ]),
    Payment.aggregate<{ _id: string; total: number }>([
      { $match: paymentMatch },
      { $group: { _id: "$paymentMethod", total: { $sum: "$amount" } } },
    ]),
    Bill.aggregate<{ _id: string; total: number }>([
      { $match: billMatch },
      { $unwind: "$items" },
      { $group: { _id: "$items.category", total: { $sum: "$items.total" } } },
      { $sort: { total: -1 } },
    ]),
    Bill.aggregate<{ _id: null; outstanding: number }>([
      { $match: { status: { $in: ["unpaid", "partial"] } } },
      { $lookup: { from: "payments", localField: "_id", foreignField: "billId", as: "payments" } },
      { $addFields: { paid: { $sum: "$payments.amount" } } },
      { $group: { _id: null, outstanding: { $sum: { $subtract: ["$total", "$paid"] } } } },
    ]),
    Payment.find(paymentMatch)
      .populate<{ billId: { billNumber: string; patientId: { firstName: string; lastName: string } } }>({
        path: "billId",
        populate: { path: "patientId" },
      })
      .sort({ paymentDate: -1 })
      .limit(20),
  ]);

  return {
    totalRevenue: totalsAgg[0]?.totalRevenue ?? 0,
    paymentCount: totalsAgg[0]?.paymentCount ?? 0,
    outstanding: outstandingAgg[0]?.outstanding ?? 0,
    byMethod: byMethodAgg.map((m) => ({ method: m._id, total: m.total })),
    byCategory: byCategoryAgg.map((c) => ({ category: c._id, total: c.total })),
    recentPayments: recentPaymentDocs.map((p) => ({
      id: p.id,
      amount: p.amount,
      payment_method: p.paymentMethod,
      payment_date: p.paymentDate,
      bill_number: p.billId?.billNumber ?? "—",
      patient_first_name: p.billId?.patientId?.firstName ?? "",
      patient_last_name: p.billId?.patientId?.lastName ?? "",
    })),
  };
}

/* ------------------------------------------------------------
   4. Pharmacy Report
   ------------------------------------------------------------ */
export async function getPharmacyReport() {
  await connectDB();

  const [drugCount, inventoryValueAgg, lowStockCount, lowStockDocs, topDispensedAgg, pendingPrescriptions, dispensedPrescriptions] =
    await Promise.all([
      PharmacyDrug.countDocuments(),
      PharmacyDrug.aggregate<{ _id: null; value: number }>([
        { $group: { _id: null, value: { $sum: { $multiply: ["$unitPrice", "$quantityInStock"] } } } },
      ]),
      PharmacyDrug.countDocuments({ $expr: { $lte: ["$quantityInStock", "$reorderLevel"] } }),
      PharmacyDrug.find({ $expr: { $lte: ["$quantityInStock", "$reorderLevel"] } }).sort({ quantityInStock: 1 }),
      Prescription.aggregate<{ _id: string; totalDispensed: number }>([
        { $match: { status: "dispensed" } },
        { $unwind: "$items" },
        { $lookup: { from: "pharmacydrugs", localField: "items.drugId", foreignField: "_id", as: "drug" } },
        { $unwind: "$drug" },
        { $group: { _id: "$drug.drugName", totalDispensed: { $sum: "$items.quantity" } } },
        { $sort: { totalDispensed: -1 } },
        { $limit: 10 },
      ]),
      Prescription.countDocuments({ status: "pending" }),
      Prescription.countDocuments({ status: "dispensed" }),
    ]);

  return {
    drugCount,
    inventoryValue: inventoryValueAgg[0]?.value ?? 0,
    lowStockCount,
    lowStock: lowStockDocs.map((d) => ({
      id: d.id,
      drug_name: d.drugName,
      quantity_in_stock: d.quantityInStock,
      reorder_level: d.reorderLevel,
    })),
    topDispensed: topDispensedAgg.map((t) => ({ drugName: t._id, totalDispensed: t.totalDispensed })),
    pendingPrescriptions,
    dispensedPrescriptions,
  };
}

/* ------------------------------------------------------------
   5. Laboratory Report
   ------------------------------------------------------------ */
export async function getLaboratoryReport() {
  await connectDB();

  const [totalRequests, statusBreakdownAgg, topTestsAgg, totalItemsAgg] = await Promise.all([
    LabRequest.countDocuments(),
    LabRequest.aggregate<{ _id: string; total: number }>([{ $group: { _id: "$status", total: { $sum: 1 } } }]),
    LabRequest.aggregate<{ _id: string; total: number }>([
      { $unwind: "$items" },
      { $lookup: { from: "labtests", localField: "items.testId", foreignField: "_id", as: "test" } },
      { $unwind: "$test" },
      { $group: { _id: "$test.testName", total: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]),
    LabRequest.aggregate<{ _id: null; total: number }>([
      { $unwind: "$items" },
      { $group: { _id: null, total: { $sum: 1 } } },
    ]),
  ]);

  return {
    totalRequests,
    totalItems: totalItemsAgg[0]?.total ?? 0,
    statusBreakdown: statusBreakdownAgg.map((s) => ({ status: s._id, total: s.total })),
    topTests: topTestsAgg.map((t) => ({ testName: t._id, total: t.total })),
  };
}

/* ------------------------------------------------------------
   6. Staff & Doctor Performance Report
   ------------------------------------------------------------ */
export async function getStaffReport() {
  await connectDB();

  const [activeDoctors, activeStaff, doctorPerformanceAgg, staffByRoleAgg] = await Promise.all([
    Doctor.countDocuments({ status: "active" }),
    Staff.countDocuments({ status: "active" }),
    Doctor.aggregate<{ doctor: string; department: string; total: number }>([
      { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $lookup: { from: "departments", localField: "departmentId", foreignField: "_id", as: "dept" } },
      { $addFields: { departmentName: { $ifNull: [{ $arrayElemAt: ["$dept.name", 0] }, "Unassigned"] } } },
      { $lookup: { from: "appointments", localField: "_id", foreignField: "doctorId", as: "appointments" } },
      {
        $project: {
          doctor: "$user.name",
          department: "$departmentName",
          total: { $size: "$appointments" },
        },
      },
      { $sort: { total: -1 } },
    ]),
    User.aggregate<{ _id: string; total: number }>([
      { $match: { role: { $ne: "admin" } } },
      { $group: { _id: "$role", total: { $sum: 1 } } },
    ]),
  ]);

  return {
    activeDoctors,
    activeStaff,
    doctorPerformance: doctorPerformanceAgg.map((d) => ({ doctor: d.doctor, department: d.department, total: d.total })),
    staffByRole: staffByRoleAgg.map((s) => ({ role: s._id, total: s.total })),
  };
}
