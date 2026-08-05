import mongoose, { Schema, Types } from "mongoose";

export interface IAuditLog {
  _id: Types.ObjectId;
  id: string;
  userId: Types.ObjectId | null;
  action: string;
  module: string | null;
  recordId: Types.ObjectId | null;
  ipAddress: string | null;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    action: { type: String, required: true },
    module: { type: String, default: null },
    recordId: { type: Schema.Types.ObjectId, default: null },
    ipAddress: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog =
  (mongoose.models.AuditLog as mongoose.Model<IAuditLog>) || mongoose.model<IAuditLog>("AuditLog", auditLogSchema);

export default AuditLog;
