import mongoose, { Schema, Types } from "mongoose";

export type PaymentMethod = "cash" | "card" | "transfer";

export interface IPayment {
  _id: Types.ObjectId;
  id: string;
  billId: Types.ObjectId;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  receivedBy: Types.ObjectId | null;
  notes: string | null;
  createdAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    billId: { type: Schema.Types.ObjectId, ref: "Bill", required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true, enum: ["cash", "card", "transfer"], default: "cash" },
    paymentDate: { type: Date, required: true },
    receivedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    notes: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Payment = (mongoose.models.Payment as mongoose.Model<IPayment>) || mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;
