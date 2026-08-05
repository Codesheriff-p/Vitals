import mongoose, { Schema, Types } from "mongoose";

export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "no-show";

export interface IAppointment {
  _id: Types.ObjectId;
  id: string;
  appointmentNumber: string;
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  departmentId: Types.ObjectId | null;
  appointmentDate: Date;
  appointmentTime: string;
  type: string | null;
  status: AppointmentStatus;
  notes: string | null;
  createdBy: Types.ObjectId | null;
  createdAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    appointmentNumber: { type: String, required: true, unique: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", default: null },
    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String, required: true },
    type: { type: String, default: null },
    status: {
      type: String,
      required: true,
      enum: ["scheduled", "completed", "cancelled", "no-show"],
      default: "scheduled",
    },
    notes: { type: String, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Appointment =
  (mongoose.models.Appointment as mongoose.Model<IAppointment>) || mongoose.model<IAppointment>("Appointment", appointmentSchema);

export default Appointment;
