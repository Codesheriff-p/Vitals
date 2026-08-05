import mongoose, { Schema, Types } from "mongoose";

export interface IMedicalRecord {
  _id: Types.ObjectId;
  id: string;
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  appointmentId: Types.ObjectId | null;
  diagnosis: string | null;
  symptoms: string | null;
  treatment: string | null;
  prescriptionNotes: string | null;
  followUpDate: Date | null;
  createdAt: Date;
}

const medicalRecordSchema = new Schema<IMedicalRecord>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", default: null },
    diagnosis: { type: String, default: null },
    symptoms: { type: String, default: null },
    treatment: { type: String, default: null },
    prescriptionNotes: { type: String, default: null },
    followUpDate: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const MedicalRecord =
  (mongoose.models.MedicalRecord as mongoose.Model<IMedicalRecord>) ||
  mongoose.model<IMedicalRecord>("MedicalRecord", medicalRecordSchema);

export default MedicalRecord;
