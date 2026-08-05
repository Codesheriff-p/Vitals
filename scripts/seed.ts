import { config } from "dotenv";
config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import {
  connectDB,
  User,
  Department,
  Doctor,
  Staff,
  Patient,
  Appointment,
  MedicalRecord,
  PharmacyDrug,
  Prescription,
  LabTest,
  LabRequest,
  Bill,
  Payment,
  AuditLog,
} from "../src/models";

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

/** Deterministic placeholder headshot from pravatar.cc, keyed by a stable seed (e.g. email).
    Stored as base64 text, matching the `photo` field's String type on the models. */
async function fetchAvatar(seed: string): Promise<{ photo: string; photoContentType: string }> {
  const res = await fetch(`https://i.pravatar.cc/300?u=${encodeURIComponent(seed)}`);
  if (!res.ok) throw new Error(`Failed to fetch placeholder avatar for ${seed}: ${res.status}`);
  const photo = Buffer.from(await res.arrayBuffer()).toString("base64");
  const photoContentType = res.headers.get("content-type") || "image/jpeg";
  return { photo, photoContentType };
}

async function main() {
  console.log("Connecting to database...");
  await connectDB();

  console.log("Dropping database...");
  await mongoose.connection.dropDatabase();

  console.log("Seeding users...");
  const [adminPass, doctorPass, pharmaPass, labPass, receptionPass] =
    await Promise.all([
      hash("Admin@123"),
      hash("Doctor@123"),
      hash("Pharma@123"),
      hash("LabTech@123"),
      hash("Reception@123"),
    ]);

  console.log("Fetching placeholder avatars...");
  const staffEmails = [
    "admin@hms.com",
    "james.okafor@hms.com",
    "amina.bello@hms.com",
    "samuel.adeyemi@hms.com",
    "grace.nwosu@hms.com",
    "peter.eze@hms.com",
    "ifeoma.chukwu@hms.com",
    "tunde.bakare@hms.com",
    "blessing.udo@hms.com",
    "chidi.obi@hms.com",
  ];
  const staffAvatars = Object.fromEntries(
    await Promise.all(staffEmails.map(async (email) => [email, await fetchAvatar(email)] as const))
  );

  const admin = await User.create({
    name: "System Administrator",
    email: "admin@hms.com",
    password: adminPass,
    role: "admin",
    status: "active",
    ...staffAvatars["admin@hms.com"],
  });
  const drOkafor = await User.create({
    name: "Dr. James Okafor",
    email: "james.okafor@hms.com",
    password: doctorPass,
    role: "doctor",
    status: "active",
    ...staffAvatars["james.okafor@hms.com"],
  });
  const drBello = await User.create({
    name: "Dr. Amina Bello",
    email: "amina.bello@hms.com",
    password: doctorPass,
    role: "doctor",
    status: "active",
    ...staffAvatars["amina.bello@hms.com"],
  });
  const drAdeyemi = await User.create({
    name: "Dr. Samuel Adeyemi",
    email: "samuel.adeyemi@hms.com",
    password: doctorPass,
    role: "doctor",
    status: "active",
    ...staffAvatars["samuel.adeyemi@hms.com"],
  });
  const graceNwosu = await User.create({
    name: "Grace Nwosu",
    email: "grace.nwosu@hms.com",
    password: pharmaPass,
    role: "pharmacist",
    status: "active",
    ...staffAvatars["grace.nwosu@hms.com"],
  });
  const peterEze = await User.create({
    name: "Peter Eze",
    email: "peter.eze@hms.com",
    password: pharmaPass,
    role: "pharmacist",
    status: "active",
    ...staffAvatars["peter.eze@hms.com"],
  });
  const ifeomaChukwu = await User.create({
    name: "Ifeoma Chukwu",
    email: "ifeoma.chukwu@hms.com",
    password: labPass,
    role: "lab_technician",
    status: "active",
    ...staffAvatars["ifeoma.chukwu@hms.com"],
  });
  const tundeBakare = await User.create({
    name: "Tunde Bakare",
    email: "tunde.bakare@hms.com",
    password: labPass,
    role: "lab_technician",
    status: "active",
    ...staffAvatars["tunde.bakare@hms.com"],
  });
  const blessingUdo = await User.create({
    name: "Blessing Udo",
    email: "blessing.udo@hms.com",
    password: receptionPass,
    role: "receptionist",
    status: "active",
    ...staffAvatars["blessing.udo@hms.com"],
  });
  const chidiObi = await User.create({
    name: "Chidi Obi",
    email: "chidi.obi@hms.com",
    password: receptionPass,
    ...staffAvatars["chidi.obi@hms.com"],
    role: "receptionist",
    status: "active",
  });

  console.log("Seeding departments...");
  const general = await Department.create({
    name: "General Medicine",
    description: "Primary and general outpatient care",
  });
  const cardiology = await Department.create({
    name: "Cardiology",
    description: "Diagnosis and treatment of heart conditions",
  });
  const pediatrics = await Department.create({
    name: "Pediatrics",
    description: "Medical care for infants, children and adolescents",
  });
  const pharmacyDept = await Department.create({
    name: "Pharmacy",
    description: "Dispensing of medication and drug inventory management",
  });
  const laboratoryDept = await Department.create({
    name: "Laboratory",
    description: "Diagnostic testing and sample analysis",
  });

  console.log("Seeding doctors...");
  const doctorOkafor = await Doctor.create({
    userId: drOkafor.id,
    specialization: "Cardiologist",
    departmentId: cardiology.id,
    qualification: "MBBS, FWACS (Cardiology)",
    phone: "08031234501",
    status: "active",
    ...staffAvatars["james.okafor@hms.com"],
  });
  const doctorBello = await Doctor.create({
    userId: drBello.id,
    specialization: "Pediatrician",
    departmentId: pediatrics.id,
    qualification: "MBBS, FMCPaed",
    phone: "08031234502",
    status: "active",
    ...staffAvatars["amina.bello@hms.com"],
  });
  const doctorAdeyemi = await Doctor.create({
    userId: drAdeyemi.id,
    specialization: "General Physician",
    departmentId: general.id,
    qualification: "MBBS, MWACP",
    phone: "08031234503",
    status: "active",
    ...staffAvatars["samuel.adeyemi@hms.com"],
  });

  cardiology.headDoctorId = doctorOkafor._id;
  pediatrics.headDoctorId = doctorBello._id;
  general.headDoctorId = doctorAdeyemi._id;
  await Promise.all([cardiology.save(), pediatrics.save(), general.save()]);

  console.log("Seeding staff...");
  await Staff.insertMany([
    {
      userId: graceNwosu.id,
      departmentId: pharmacyDept.id,
      roleTitle: "Pharmacist",
      phone: "08041234501",
      status: "active",
      ...staffAvatars["grace.nwosu@hms.com"],
    },
    {
      userId: peterEze.id,
      departmentId: pharmacyDept.id,
      roleTitle: "Pharmacist",
      phone: "08041234502",
      status: "active",
      ...staffAvatars["peter.eze@hms.com"],
    },
    {
      userId: ifeomaChukwu.id,
      departmentId: laboratoryDept.id,
      roleTitle: "Lab Technician",
      phone: "08051234501",
      status: "active",
      ...staffAvatars["ifeoma.chukwu@hms.com"],
    },
    {
      userId: tundeBakare.id,
      departmentId: laboratoryDept.id,
      roleTitle: "Lab Technician",
      phone: "08051234502",
      status: "active",
      ...staffAvatars["tunde.bakare@hms.com"],
    },
    {
      userId: blessingUdo.id,
      departmentId: general.id,
      roleTitle: "Receptionist",
      phone: "08061234501",
      status: "active",
      ...staffAvatars["blessing.udo@hms.com"],
    },
    {
      userId: chidiObi.id,
      departmentId: general.id,
      roleTitle: "Receptionist",
      phone: "08061234502",
      status: "active",
      ...staffAvatars["chidi.obi@hms.com"],
    },
  ]);

  console.log("Seeding patients...");
  const patientSeed = [
    [
      "PAT-0001",
      "Chinedu",
      "Eze",
      "1990-03-12",
      "male",
      "O+",
      "08101110001",
      "chinedu.eze@example.com",
      "12 Allen Avenue, Lagos",
      "Ngozi Eze",
      "08101110011",
    ],
    [
      "PAT-0002",
      "Ngozi",
      "Okonkwo",
      "1985-07-24",
      "female",
      "A+",
      "08101110002",
      "ngozi.okonkwo@example.com",
      "5 Awolowo Road, Lagos",
      "Emeka Okonkwo",
      "08101110012",
    ],
    [
      "PAT-0003",
      "Musa",
      "Ibrahim",
      "1978-11-02",
      "male",
      "B+",
      "08101110003",
      "musa.ibrahim@example.com",
      "9 Ahmadu Bello Way, Abuja",
      "Amina Ibrahim",
      "08101110013",
    ],
    [
      "PAT-0004",
      "Fatima",
      "Yusuf",
      "2001-01-19",
      "female",
      "AB+",
      "08101110004",
      "fatima.yusuf@example.com",
      "3 Ibrahim Taiwo Rd, Kano",
      "Yusuf Aliyu",
      "08101110014",
    ],
    [
      "PAT-0005",
      "Emeka",
      "Nwankwo",
      "1995-05-30",
      "male",
      "O-",
      "08101110005",
      "emeka.nwankwo@example.com",
      "21 Zik Avenue, Enugu",
      "Chioma Nwankwo",
      "08101110015",
    ],
    [
      "PAT-0006",
      "Aisha",
      "Bello",
      "1988-09-14",
      "female",
      "A-",
      "08101110006",
      "aisha.bello@example.com",
      "7 Murtala Mohammed Way, Kaduna",
      "Bello Sani",
      "08101110016",
    ],
    [
      "PAT-0007",
      "Tunde",
      "Ogunleye",
      "1975-12-08",
      "male",
      "B-",
      "08101110007",
      "tunde.ogunleye@example.com",
      "15 Ring Road, Ibadan",
      "Bisi Ogunleye",
      "08101110017",
    ],
    [
      "PAT-0008",
      "Chiamaka",
      "Uba",
      "1999-04-22",
      "female",
      "O+",
      "08101110008",
      "chiamaka.uba@example.com",
      "18 Aba Road, Port Harcourt",
      "Obinna Uba",
      "08101110018",
    ],
    [
      "PAT-0009",
      "Ibrahim",
      "Suleiman",
      "1982-06-17",
      "male",
      "AB-",
      "08101110009",
      "ibrahim.suleiman@example.com",
      "4 Yandaki Road, Sokoto",
      "Suleiman Musa",
      "08101110019",
    ],
    [
      "PAT-0010",
      "Bisola",
      "Adeyemi",
      "1993-02-27",
      "female",
      "A+",
      "08101110010",
      "bisola.adeyemi@example.com",
      "10 Adeola Odeku St, Lagos",
      "Kunle Adeyemi",
      "08101110020",
    ],
    [
      "PAT-0011",
      "Yakubu",
      "Danladi",
      "1970-10-05",
      "male",
      "O+",
      "08101110021",
      "yakubu.danladi@example.com",
      "2 Bank Road, Jos",
      "Danladi Musa",
      "08101110031",
    ],
    [
      "PAT-0012",
      "Grace",
      "Effiong",
      "1992-08-11",
      "female",
      "B+",
      "08101110022",
      "grace.effiong@example.com",
      "6 Marina Road, Calabar",
      "Effiong Bassey",
      "08101110032",
    ],
    [
      "PAT-0013",
      "Segun",
      "Afolabi",
      "1986-01-30",
      "male",
      "A+",
      "08101110023",
      "segun.afolabi@example.com",
      "11 Oduduwa Cres, Ile-Ife",
      "Afolabi Ade",
      "08101110033",
    ],
    [
      "PAT-0014",
      "Chinwe",
      "Okafor",
      "1998-03-15",
      "female",
      "O-",
      "08101110024",
      "chinwe.okafor@example.com",
      "8 New Market Rd, Onitsha",
      "Okafor Chidi",
      "08101110034",
    ],
    [
      "PAT-0015",
      "Abdullahi",
      "Garba",
      "1980-07-09",
      "male",
      "AB+",
      "08101110025",
      "abdullahi.garba@example.com",
      "14 Zaria Road, Kano",
      "Garba Aliyu",
      "08101110035",
    ],
    [
      "PAT-0016",
      "Funmilayo",
      "Adebayo",
      "1991-11-21",
      "female",
      "A-",
      "08101110026",
      "funmilayo.adebayo@example.com",
      "3 Bode Thomas St, Lagos",
      "Adebayo Tolu",
      "08101110036",
    ],
    [
      "PAT-0017",
      "Chukwuemeka",
      "Onyeka",
      "1983-05-04",
      "male",
      "B-",
      "08101110027",
      "chukwuemeka.onyeka@example.com",
      "17 Ziks Ave, Awka",
      "Onyeka Nnamdi",
      "08101110037",
    ],
    [
      "PAT-0018",
      "Hauwa",
      "Abdullahi",
      "1996-09-28",
      "female",
      "O+",
      "08101110028",
      "hauwa.abdullahi@example.com",
      "5 Gwarinpa Estate, Abuja",
      "Abdullahi Musa",
      "08101110038",
    ],
    [
      "PAT-0019",
      "Olumide",
      "Fashola",
      "1979-12-19",
      "male",
      "AB-",
      "08101110029",
      "olumide.fashola@example.com",
      "9 Opebi Road, Lagos",
      "Fashola Tayo",
      "08101110039",
    ],
    [
      "PAT-0020",
      "Amaka",
      "Nnamdi",
      "1994-04-07",
      "female",
      "A+",
      "08101110030",
      "amaka.nnamdi@example.com",
      "20 Independence Layout, Enugu",
      "Nnamdi Uche",
      "08101110040",
    ],
  ] as const;

  const patientAvatars = await Promise.all(patientSeed.map(([, , , , , , , email]) => fetchAvatar(email)));

  const patients = await Patient.insertMany(
    patientSeed.map(
      (
        [
          patientNumber,
          firstName,
          lastName,
          dob,
          gender,
          bloodGroup,
          phone,
          email,
          address,
          nextOfKin,
          nextOfKinPhone,
        ],
        i,
      ) => ({
        patientNumber,
        firstName,
        lastName,
        dob: new Date(dob),
        gender: gender as "male" | "female",
        bloodGroup,
        phone,
        email,
        address,
        nextOfKin,
        nextOfKinPhone,
        registeredBy: i < 10 ? blessingUdo.id : chidiObi.id,
        ...patientAvatars[i],
      }),
    ),
  );

  console.log("Seeding appointments...");
  const apptSeed = [
    [
      "APT-0001",
      0,
      doctorAdeyemi,
      general,
      "2026-07-10",
      "09:00",
      "Consultation",
      "completed",
      "Routine checkup",
    ],
    [
      "APT-0002",
      1,
      doctorOkafor,
      cardiology,
      "2026-07-10",
      "10:00",
      "Consultation",
      "completed",
      "Chest pain follow-up",
    ],
    [
      "APT-0003",
      2,
      doctorBello,
      pediatrics,
      "2026-07-11",
      "11:00",
      "Consultation",
      "completed",
      "Child vaccination review",
    ],
    [
      "APT-0004",
      3,
      doctorAdeyemi,
      general,
      "2026-07-12",
      "09:30",
      "Follow-up",
      "completed",
      "Malaria follow-up",
    ],
    [
      "APT-0005",
      4,
      doctorOkafor,
      cardiology,
      "2026-07-14",
      "13:00",
      "Consultation",
      "no-show",
      "Patient did not show up",
    ],
    [
      "APT-0006",
      5,
      doctorBello,
      pediatrics,
      "2026-07-15",
      "10:30",
      "Consultation",
      "cancelled",
      "Rescheduled by patient",
    ],
    [
      "APT-0007",
      6,
      doctorAdeyemi,
      general,
      "2026-07-16",
      "08:30",
      "Consultation",
      "completed",
      "Hypertension review",
    ],
    [
      "APT-0008",
      7,
      doctorOkafor,
      cardiology,
      "2026-07-18",
      "14:00",
      "Consultation",
      "completed",
      "ECG review",
    ],
    [
      "APT-0009",
      8,
      doctorBello,
      pediatrics,
      "2026-07-20",
      "09:00",
      "Consultation",
      "scheduled",
      "New patient visit",
    ],
    [
      "APT-0010",
      9,
      doctorAdeyemi,
      general,
      "2026-07-22",
      "11:30",
      "Follow-up",
      "scheduled",
      "Lab result review",
    ],
    [
      "APT-0011",
      10,
      doctorOkafor,
      cardiology,
      "2026-07-24",
      "09:00",
      "Consultation",
      "scheduled",
      "Cardiac assessment",
    ],
    [
      "APT-0012",
      11,
      doctorBello,
      pediatrics,
      "2026-07-25",
      "10:00",
      "Consultation",
      "scheduled",
      "Pediatric checkup",
    ],
    [
      "APT-0013",
      12,
      doctorAdeyemi,
      general,
      "2026-07-27",
      "15:00",
      "Consultation",
      "scheduled",
      "General checkup",
    ],
    [
      "APT-0014",
      13,
      doctorOkafor,
      cardiology,
      "2026-07-29",
      "09:30",
      "Consultation",
      "scheduled",
      "Follow-up on medication",
    ],
    [
      "APT-0015",
      14,
      doctorBello,
      pediatrics,
      "2026-07-30",
      "10:00",
      "Consultation",
      "scheduled",
      "Growth monitoring",
    ],
  ] as const;

  const appointments = await Appointment.insertMany(
    apptSeed.map(
      ([
        appointmentNumber,
        patientIdx,
        doctor,
        department,
        appointmentDate,
        appointmentTime,
        type,
        status,
        notes,
      ]) => ({
        appointmentNumber,
        patientId: patients[patientIdx].id,
        doctorId: doctor.id,
        departmentId: department.id,
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        type,
        status: status as "scheduled" | "completed" | "cancelled" | "no-show",
        notes,
        createdBy: patientIdx < 10 ? blessingUdo.id : chidiObi.id,
      }),
    ),
  );

  console.log("Seeding medical records...");
  await MedicalRecord.insertMany([
    {
      patientId: patients[0].id,
      doctorId: doctorAdeyemi.id,
      appointmentId: appointments[0].id,
      diagnosis: "Mild hypertension",
      symptoms: "Headache, occasional dizziness",
      treatment: "Lifestyle modification, low-salt diet",
      prescriptionNotes: "Amlodipine 5mg once daily",
      followUpDate: new Date("2026-08-10"),
    },
    {
      patientId: patients[1].id,
      doctorId: doctorOkafor.id,
      appointmentId: appointments[1].id,
      diagnosis: "Angina pectoris",
      symptoms: "Chest tightness on exertion",
      treatment: "Beta-blocker therapy, ECG monitoring",
      prescriptionNotes: "Atenolol 50mg once daily",
      followUpDate: new Date("2026-08-05"),
    },
    {
      patientId: patients[2].id,
      doctorId: doctorBello.id,
      appointmentId: appointments[2].id,
      diagnosis: "Routine immunization",
      symptoms: "None - scheduled vaccination",
      treatment: "Administered scheduled vaccine dose",
      prescriptionNotes: "Paracetamol syrup if fever occurs",
      followUpDate: null,
    },
    {
      patientId: patients[3].id,
      doctorId: doctorAdeyemi.id,
      appointmentId: appointments[3].id,
      diagnosis: "Resolved malaria",
      symptoms: "Previously had fever and chills",
      treatment: "Completed antimalarial course",
      prescriptionNotes: "No further medication needed",
      followUpDate: null,
    },
    {
      patientId: patients[6].id,
      doctorId: doctorAdeyemi.id,
      appointmentId: appointments[6].id,
      diagnosis: "Essential hypertension",
      symptoms: "Elevated blood pressure on review",
      treatment: "Continue antihypertensive, monitor BP weekly",
      prescriptionNotes: "Lisinopril 10mg once daily",
      followUpDate: new Date("2026-08-16"),
    },
    {
      patientId: patients[7].id,
      doctorId: doctorOkafor.id,
      appointmentId: appointments[7].id,
      diagnosis: "Normal sinus rhythm",
      symptoms: "Occasional palpitations",
      treatment: "Reassurance, lifestyle advice",
      prescriptionNotes: "None",
      followUpDate: null,
    },
  ]);

  console.log("Seeding pharmacy drugs...");
  const drugs = await PharmacyDrug.insertMany([
    {
      drugName: "Paracetamol 500mg",
      category: "Analgesic",
      description: "Pain reliever and fever reducer",
      unit: "Tablet",
      unitPrice: 20.0,
      quantityInStock: 500,
      reorderLevel: 50,
    },
    {
      drugName: "Amoxicillin 500mg",
      category: "Antibiotic",
      description: "Broad-spectrum antibiotic capsule",
      unit: "Capsule",
      unitPrice: 45.0,
      quantityInStock: 300,
      reorderLevel: 50,
    },
    {
      drugName: "Amlodipine 5mg",
      category: "Antihypertensive",
      description: "Calcium channel blocker for hypertension",
      unit: "Tablet",
      unitPrice: 60.0,
      quantityInStock: 8,
      reorderLevel: 30,
    },
    {
      drugName: "Atenolol 50mg",
      category: "Beta-blocker",
      description: "Used to treat angina and hypertension",
      unit: "Tablet",
      unitPrice: 55.0,
      quantityInStock: 120,
      reorderLevel: 30,
    },
    {
      drugName: "Lisinopril 10mg",
      category: "ACE Inhibitor",
      description: "Used to treat high blood pressure",
      unit: "Tablet",
      unitPrice: 65.0,
      quantityInStock: 15,
      reorderLevel: 30,
    },
    {
      drugName: "Artemether/Lumefantrine",
      category: "Antimalarial",
      description: "Combination therapy for malaria",
      unit: "Tablet",
      unitPrice: 850.0,
      quantityInStock: 200,
      reorderLevel: 40,
    },
    {
      drugName: "Paracetamol Syrup",
      category: "Analgesic",
      description: "Pediatric fever and pain relief syrup",
      unit: "Bottle",
      unitPrice: 350.0,
      quantityInStock: 5,
      reorderLevel: 20,
    },
    {
      drugName: "Metformin 500mg",
      category: "Antidiabetic",
      description: "Used to control blood sugar levels",
      unit: "Tablet",
      unitPrice: 40.0,
      quantityInStock: 250,
      reorderLevel: 40,
    },
    {
      drugName: "Ibuprofen 400mg",
      category: "NSAID",
      description: "Anti-inflammatory pain reliever",
      unit: "Tablet",
      unitPrice: 25.0,
      quantityInStock: 400,
      reorderLevel: 50,
    },
    {
      drugName: "Vitamin C 1000mg",
      category: "Supplement",
      description: "Immune support supplement",
      unit: "Tablet",
      unitPrice: 30.0,
      quantityInStock: 6,
      reorderLevel: 25,
    },
  ]);

  console.log("Seeding prescriptions...");
  await Prescription.insertMany([
    {
      patientId: patients[0].id,
      doctorId: doctorAdeyemi.id,
      appointmentId: appointments[0].id,
      status: "dispensed",
      items: [
        {
          drugId: drugs[2].id,
          dosage: "5mg once daily",
          quantity: 30,
          instructions: "Take in the morning with food",
        },
      ],
    },
    {
      patientId: patients[1].id,
      doctorId: doctorOkafor.id,
      appointmentId: appointments[1].id,
      status: "dispensed",
      items: [
        {
          drugId: drugs[3].id,
          dosage: "50mg once daily",
          quantity: 30,
          instructions: "Take at the same time every day",
        },
      ],
    },
    {
      patientId: patients[6].id,
      doctorId: doctorAdeyemi.id,
      appointmentId: appointments[6].id,
      status: "pending",
      items: [
        {
          drugId: drugs[4].id,
          dosage: "10mg once daily",
          quantity: 30,
          instructions: "Take in the morning, monitor BP weekly",
        },
      ],
    },
    {
      patientId: patients[7].id,
      doctorId: doctorOkafor.id,
      appointmentId: appointments[7].id,
      status: "pending",
      items: [
        {
          drugId: drugs[8].id,
          dosage: "400mg as needed",
          quantity: 20,
          instructions: "Take after meals for pain relief",
        },
      ],
    },
  ]);

  console.log("Seeding lab tests...");
  const labTests = await LabTest.insertMany([
    {
      testName: "Complete Blood Count (CBC)",
      description: "Evaluates overall blood health",
      normalRange: "4.5 - 11.0",
      unit: "x10^9/L",
      price: 3500.0,
    },
    {
      testName: "Fasting Blood Sugar",
      description: "Measures blood glucose after fasting",
      normalRange: "70 - 100",
      unit: "mg/dL",
      price: 1500.0,
    },
    {
      testName: "Malaria Parasite Test",
      description: "Detects presence of malaria parasites",
      normalRange: "Negative",
      unit: "N/A",
      price: 2000.0,
    },
    {
      testName: "Lipid Profile",
      description: "Measures cholesterol and triglycerides",
      normalRange: "< 200",
      unit: "mg/dL",
      price: 5000.0,
    },
    {
      testName: "Liver Function Test",
      description: "Assesses liver enzyme levels",
      normalRange: "7 - 56",
      unit: "U/L",
      price: 6000.0,
    },
    {
      testName: "Kidney Function Test",
      description: "Assesses renal function via creatinine/urea",
      normalRange: "0.6 - 1.3",
      unit: "mg/dL",
      price: 5500.0,
    },
    {
      testName: "Urinalysis",
      description: "Physical, chemical and microscopic urine exam",
      normalRange: "Normal",
      unit: "N/A",
      price: 1800.0,
    },
    {
      testName: "HIV Screening",
      description: "Screens for HIV antibodies",
      normalRange: "Non-reactive",
      unit: "N/A",
      price: 2500.0,
    },
  ]);

  console.log("Seeding lab requests...");
  await LabRequest.insertMany([
    {
      requestNumber: "LAB-0001",
      patientId: patients[1].id,
      doctorId: doctorOkafor.id,
      appointmentId: appointments[1].id,
      status: "completed",
      items: [
        {
          testId: labTests[3].id,
          result: "210 mg/dL",
          resultNotes: "Slightly elevated cholesterol, dietary advice given",
          status: "completed",
          processedAt: new Date("2026-07-10T15:00:00"),
        },
        {
          testId: labTests[0].id,
          result: "6.2 x10^9/L",
          resultNotes: "Within normal range",
          status: "completed",
          processedAt: new Date("2026-07-10T15:05:00"),
        },
      ],
    },
    {
      requestNumber: "LAB-0002",
      patientId: patients[6].id,
      doctorId: doctorAdeyemi.id,
      appointmentId: appointments[6].id,
      status: "completed",
      items: [
        {
          testId: labTests[1].id,
          result: "95 mg/dL",
          resultNotes: "Normal fasting glucose",
          status: "completed",
          processedAt: new Date("2026-07-16T12:00:00"),
        },
      ],
    },
    {
      requestNumber: "LAB-0003",
      patientId: patients[7].id,
      doctorId: doctorOkafor.id,
      appointmentId: appointments[7].id,
      status: "processing",
      items: [
        {
          testId: labTests[0].id,
          result: null,
          resultNotes: null,
          status: "pending",
          processedAt: null,
        },
      ],
    },
    {
      requestNumber: "LAB-0004",
      patientId: patients[9].id,
      doctorId: doctorAdeyemi.id,
      appointmentId: appointments[9].id,
      status: "requested",
      items: [
        {
          testId: labTests[5].id,
          result: null,
          resultNotes: null,
          status: "pending",
          processedAt: null,
        },
      ],
    },
  ]);

  console.log("Seeding bills & payments...");
  const bills = await Bill.insertMany([
    {
      billNumber: "BILL-0001",
      patientId: patients[0].id,
      appointmentId: appointments[0].id,
      subtotal: 5000.0,
      discount: 0,
      total: 5000.0,
      status: "paid",
      createdBy: blessingUdo.id,
      items: [
        {
          description: "General consultation",
          category: "consultation",
          quantity: 1,
          unitPrice: 5000.0,
          total: 5000.0,
        },
      ],
    },
    {
      billNumber: "BILL-0002",
      patientId: patients[1].id,
      appointmentId: appointments[1].id,
      subtotal: 10500.0,
      discount: 500.0,
      total: 10000.0,
      status: "paid",
      createdBy: blessingUdo.id,
      items: [
        {
          description: "Cardiology consultation",
          category: "consultation",
          quantity: 1,
          unitPrice: 5000.0,
          total: 5000.0,
        },
        {
          description: "Lipid Profile test",
          category: "lab",
          quantity: 1,
          unitPrice: 5500.0,
          total: 5500.0,
        },
      ],
    },
    {
      billNumber: "BILL-0003",
      patientId: patients[6].id,
      appointmentId: appointments[6].id,
      subtotal: 7500.0,
      discount: 0,
      total: 7500.0,
      status: "partial",
      createdBy: blessingUdo.id,
      items: [
        {
          description: "General consultation",
          category: "consultation",
          quantity: 1,
          unitPrice: 5000.0,
          total: 5000.0,
        },
        {
          description: "Lisinopril 10mg (30 tablets)",
          category: "pharmacy",
          quantity: 30,
          unitPrice: 65.0,
          total: 1950.0,
        },
        {
          description: "Miscellaneous fee",
          category: "other",
          quantity: 1,
          unitPrice: 550.0,
          total: 550.0,
        },
      ],
    },
    {
      billNumber: "BILL-0004",
      patientId: patients[7].id,
      appointmentId: appointments[7].id,
      subtotal: 8300.0,
      discount: 0,
      total: 8300.0,
      status: "unpaid",
      createdBy: blessingUdo.id,
      items: [
        {
          description: "Cardiology consultation",
          category: "consultation",
          quantity: 1,
          unitPrice: 5000.0,
          total: 5000.0,
        },
        {
          description: "Kidney Function Test",
          category: "lab",
          quantity: 1,
          unitPrice: 3300.0,
          total: 3300.0,
        },
      ],
    },
    {
      billNumber: "BILL-0005",
      patientId: patients[3].id,
      appointmentId: appointments[3].id,
      subtotal: 5000.0,
      discount: 150.0,
      total: 4850.0,
      status: "paid",
      createdBy: chidiObi.id,
      items: [
        {
          description: "General consultation",
          category: "consultation",
          quantity: 1,
          unitPrice: 5000.0,
          total: 5000.0,
        },
      ],
    },
  ]);

  await Payment.insertMany([
    {
      billId: bills[0].id,
      amount: 5000.0,
      paymentMethod: "cash",
      paymentDate: new Date("2026-07-10"),
      receivedBy: blessingUdo.id,
      notes: "Paid in full at reception",
    },
    {
      billId: bills[1].id,
      amount: 10000.0,
      paymentMethod: "card",
      paymentDate: new Date("2026-07-10"),
      receivedBy: blessingUdo.id,
      notes: "Paid via POS",
    },
    {
      billId: bills[2].id,
      amount: 4000.0,
      paymentMethod: "transfer",
      paymentDate: new Date("2026-07-16"),
      receivedBy: blessingUdo.id,
      notes: "Partial payment received",
    },
    {
      billId: bills[4].id,
      amount: 4850.0,
      paymentMethod: "cash",
      paymentDate: new Date("2026-07-12"),
      receivedBy: chidiObi.id,
      notes: "Paid in full at reception",
    },
  ]);

  console.log("Seeding audit log...");
  await AuditLog.insertMany([
    {
      userId: admin.id,
      action: "CREATE_USER",
      module: "users",
      recordId: drOkafor.id,
      ipAddress: "127.0.0.1",
    },
    {
      userId: blessingUdo.id,
      action: "REGISTER_PATIENT",
      module: "patients",
      recordId: patients[0].id,
      ipAddress: "127.0.0.1",
    },
    {
      userId: blessingUdo.id,
      action: "CREATE_APPOINTMENT",
      module: "appointments",
      recordId: appointments[0].id,
      ipAddress: "127.0.0.1",
    },
    {
      userId: blessingUdo.id,
      action: "CREATE_BILL",
      module: "billing",
      recordId: bills[0].id,
      ipAddress: "127.0.0.1",
    },
    {
      userId: admin.id,
      action: "LOGIN",
      module: "auth",
      recordId: null,
      ipAddress: "127.0.0.1",
    },
  ]);

  console.log("Seed complete.");
  await mongoose.connection.close();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
