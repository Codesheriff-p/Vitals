import mongoose, { Schema, Types } from "mongoose";

export interface IPharmacyDrug {
  _id: Types.ObjectId;
  id: string;
  drugName: string;
  category: string | null;
  description: string | null;
  unit: string | null;
  unitPrice: number;
  quantityInStock: number;
  reorderLevel: number;
  createdAt: Date;
}

const pharmacyDrugSchema = new Schema<IPharmacyDrug>(
  {
    drugName: { type: String, required: true, trim: true },
    category: { type: String, default: null },
    description: { type: String, default: null },
    unit: { type: String, default: null },
    unitPrice: { type: Number, required: true, default: 0 },
    quantityInStock: { type: Number, required: true, default: 0 },
    reorderLevel: { type: Number, required: true, default: 10 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const PharmacyDrug =
  (mongoose.models.PharmacyDrug as mongoose.Model<IPharmacyDrug>) ||
  mongoose.model<IPharmacyDrug>("PharmacyDrug", pharmacyDrugSchema);

export default PharmacyDrug;
