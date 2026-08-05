import mongoose, { Schema, Types } from "mongoose";

export interface IDepartment {
  _id: Types.ObjectId;
  id: string;
  name: string;
  description: string | null;
  headDoctorId: Types.ObjectId | null;
  createdAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: null },
    headDoctorId: { type: Schema.Types.ObjectId, ref: "Doctor", default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Department =
  (mongoose.models.Department as mongoose.Model<IDepartment>) || mongoose.model<IDepartment>("Department", departmentSchema);

export default Department;
