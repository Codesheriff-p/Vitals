import mongoose, { Schema, Types } from "mongoose";

export type LabRequestStatus = "requested" | "processing" | "completed";
export type LabRequestItemStatus = "pending" | "completed";

export interface ILabRequestItem {
  _id: Types.ObjectId;
  id: string;
  testId: Types.ObjectId;
  result: string | null;
  resultNotes: string | null;
  status: LabRequestItemStatus;
  processedAt: Date | null;
}

export interface ILabRequest {
  _id: Types.ObjectId;
  id: string;
  requestNumber: string;
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  appointmentId: Types.ObjectId | null;
  status: LabRequestStatus;
  items: Types.DocumentArray<ILabRequestItem>;
  createdAt: Date;
}

const labRequestItemSchema = new Schema<ILabRequestItem>({
  testId: { type: Schema.Types.ObjectId, ref: "LabTest", required: true },
  result: { type: String, default: null },
  resultNotes: { type: String, default: null },
  status: { type: String, required: true, enum: ["pending", "completed"], default: "pending" },
  processedAt: { type: Date, default: null },
});

const labRequestSchema = new Schema<ILabRequest>(
  {
    requestNumber: { type: String, required: true, unique: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", default: null },
    status: { type: String, required: true, enum: ["requested", "processing", "completed"], default: "requested" },
    items: { type: [labRequestItemSchema], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const LabRequest =
  (mongoose.models.LabRequest as mongoose.Model<ILabRequest>) || mongoose.model<ILabRequest>("LabRequest", labRequestSchema);

export default LabRequest;
