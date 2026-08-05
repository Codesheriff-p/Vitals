import mongoose, { Schema, Types } from "mongoose";

export interface ILabTest {
  _id: Types.ObjectId;
  id: string;
  testName: string;
  description: string | null;
  normalRange: string | null;
  unit: string | null;
  price: number;
  createdAt: Date;
}

const labTestSchema = new Schema<ILabTest>(
  {
    testName: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    normalRange: { type: String, default: null },
    unit: { type: String, default: null },
    price: { type: Number, required: true, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const LabTest = (mongoose.models.LabTest as mongoose.Model<ILabTest>) || mongoose.model<ILabTest>("LabTest", labTestSchema);

export default LabTest;
