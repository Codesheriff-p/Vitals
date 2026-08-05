import mongoose, { Schema, Types } from "mongoose";
import type { UserRole } from "@/types/auth";

export interface IUser {
  _id: Types.ObjectId;
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: "active" | "inactive";
  phone: string | null;
  dob: Date | null;
  photo?: string | null;
  photoContentType?: string | null;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["admin", "doctor", "nurse", "pharmacist", "lab_technician", "receptionist"],
    },
    status: { type: String, required: true, enum: ["active", "inactive"], default: "active" },
    phone: { type: String, default: null },
    dob: { type: Date, default: null },
    photo: { type: String, select: false },
    photoContentType: { type: String, select: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const User = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>("User", userSchema);

export default User;
