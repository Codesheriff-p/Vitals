import mongoose, { Schema, Types } from "mongoose";

export type StaffStatus = "active" | "inactive";

export interface IStaff {
  _id: Types.ObjectId;
  id: string;
  userId: Types.ObjectId;
  departmentId: Types.ObjectId | null;
  roleTitle: string | null;
  phone: string | null;
  photo?: string | null;
  photoContentType?: string | null;
  status: StaffStatus;
  createdAt: Date;
}

const staffSchema = new Schema<IStaff>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", default: null },
    roleTitle: { type: String, default: null },
    phone: { type: String, default: null },
    photo: { type: String, default: null, select: false },
    photoContentType: { type: String, default: null, select: false },
    status: { type: String, required: true, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Staff = (mongoose.models.Staff as mongoose.Model<IStaff>) || mongoose.model<IStaff>("Staff", staffSchema);

export default Staff;
