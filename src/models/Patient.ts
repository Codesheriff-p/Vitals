import mongoose, { Schema, Types } from "mongoose";

export type Gender = "male" | "female" | "other";

export interface IPatient {
  _id: Types.ObjectId;
  id: string;
  patientNumber: string;
  firstName: string;
  lastName: string;
  dob: Date | null;
  gender: Gender | null;
  bloodGroup: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  nextOfKin: string | null;
  nextOfKinPhone: string | null;
  photo?: string | null;
  photoContentType?: string | null;
  assignedDoctorId: Types.ObjectId | null;
  registeredBy: Types.ObjectId | null;
  createdAt: Date;
}

const patientSchema = new Schema<IPatient>(
  {
    patientNumber: { type: String, required: true, unique: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dob: { type: Date, default: null },
    gender: { type: String, enum: ["male", "female", "other"], default: null },
    bloodGroup: { type: String, default: null },
    phone: { type: String, required: true },
    email: { type: String, default: null },
    address: { type: String, default: null },
    nextOfKin: { type: String, default: null },
    nextOfKinPhone: { type: String, default: null },
    photo: { type: String, default: null, select: false },
    photoContentType: { type: String, default: null, select: false },
    assignedDoctorId: { type: Schema.Types.ObjectId, ref: "Doctor", default: null },
    registeredBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Patient = (mongoose.models.Patient as mongoose.Model<IPatient>) || mongoose.model<IPatient>("Patient", patientSchema);

export default Patient;
