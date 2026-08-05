import mongoose, { Schema, Types } from "mongoose";

export type DoctorStatus = "active" | "inactive";

export interface IDoctor {
  _id: Types.ObjectId;
  id: string;
  userId: Types.ObjectId;
  specialization: string | null;
  departmentId: Types.ObjectId | null;
  qualification: string | null;
  phone: string | null;
  photo?: string | null;
  photoContentType?: string | null;
  status: DoctorStatus;
  createdAt: Date;
}

const doctorSchema = new Schema<IDoctor>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    specialization: { type: String, default: null },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", default: null },
    qualification: { type: String, default: null },
    phone: { type: String, default: null },
    photo: { type: String, default: null, select: false },
    photoContentType: { type: String, default: null, select: false },
    status: { type: String, required: true, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Doctor = (mongoose.models.Doctor as mongoose.Model<IDoctor>) || mongoose.model<IDoctor>("Doctor", doctorSchema);

export default Doctor;
