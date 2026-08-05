import mongoose, { Schema, Types } from "mongoose";

export type BillStatus = "unpaid" | "partial" | "paid";
export type BillItemCategory = "consultation" | "lab" | "pharmacy" | "other";

export interface IBillItem {
  _id: Types.ObjectId;
  id: string;
  description: string;
  category: BillItemCategory;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IBill {
  _id: Types.ObjectId;
  id: string;
  billNumber: string;
  patientId: Types.ObjectId;
  appointmentId: Types.ObjectId | null;
  subtotal: number;
  discount: number;
  total: number;
  status: BillStatus;
  createdBy: Types.ObjectId | null;
  items: Types.DocumentArray<IBillItem>;
  createdAt: Date;
}

const billItemSchema = new Schema<IBillItem>({
  description: { type: String, required: true },
  category: { type: String, required: true, enum: ["consultation", "lab", "pharmacy", "other"], default: "other" },
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true, default: 0 },
});

const billSchema = new Schema<IBill>(
  {
    billNumber: { type: String, required: true, unique: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", default: null },
    subtotal: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
    status: { type: String, required: true, enum: ["unpaid", "partial", "paid"], default: "unpaid" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    items: { type: [billItemSchema], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Bill = (mongoose.models.Bill as mongoose.Model<IBill>) || mongoose.model<IBill>("Bill", billSchema);

export default Bill;
