import mongoose, { Schema, Types } from "mongoose";

export type PrescriptionStatus = "pending" | "dispensed";

export interface IPrescriptionItem {
  _id: Types.ObjectId;
  id: string;
  drugId: Types.ObjectId;
  dosage: string | null;
  quantity: number;
  instructions: string | null;
}

export interface IPrescription {
  _id: Types.ObjectId;
  id: string;
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  appointmentId: Types.ObjectId | null;
  status: PrescriptionStatus;
  items: Types.DocumentArray<IPrescriptionItem>;
  createdAt: Date;
}

const prescriptionItemSchema = new Schema<IPrescriptionItem>({
  drugId: { type: Schema.Types.ObjectId, ref: "PharmacyDrug", required: true },
  dosage: { type: String, default: null },
  quantity: { type: Number, required: true, default: 1 },
  instructions: { type: String, default: null },
});

const prescriptionSchema = new Schema<IPrescription>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", default: null },
    status: { type: String, required: true, enum: ["pending", "dispensed"], default: "pending" },
    items: { type: [prescriptionItemSchema], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Prescription =
  (mongoose.models.Prescription as mongoose.Model<IPrescription>) ||
  mongoose.model<IPrescription>("Prescription", prescriptionSchema);

export default Prescription;
