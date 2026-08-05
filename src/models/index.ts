// Central barrel file — always import models from here (not from individual
// model files) so every schema is registered with Mongoose before any
// .populate() call tries to resolve a ref by name.
import connectDB from "@/lib/db";

export { User } from "./User";
export type { IUser } from "./User";

export { Department } from "./Department";
export type { IDepartment } from "./Department";

export { Doctor } from "./Doctor";
export type { IDoctor, DoctorStatus } from "./Doctor";

export { Staff } from "./Staff";
export type { IStaff, StaffStatus } from "./Staff";

export { Patient } from "./Patient";
export type { IPatient, Gender } from "./Patient";

export { Appointment } from "./Appointment";
export type { IAppointment, AppointmentStatus } from "./Appointment";

export { MedicalRecord } from "./MedicalRecord";
export type { IMedicalRecord } from "./MedicalRecord";

export { PharmacyDrug } from "./PharmacyDrug";
export type { IPharmacyDrug } from "./PharmacyDrug";

export { Prescription } from "./Prescription";
export type { IPrescription, IPrescriptionItem, PrescriptionStatus } from "./Prescription";

export { LabTest } from "./LabTest";
export type { ILabTest } from "./LabTest";

export { LabRequest } from "./LabRequest";
export type { ILabRequest, ILabRequestItem, LabRequestStatus, LabRequestItemStatus } from "./LabRequest";

export { Bill } from "./Bill";
export type { IBill, IBillItem, BillStatus, BillItemCategory } from "./Bill";

export { Payment } from "./Payment";
export type { IPayment, PaymentMethod } from "./Payment";

export { AuditLog } from "./AuditLog";
export type { IAuditLog } from "./AuditLog";

export { connectDB };
