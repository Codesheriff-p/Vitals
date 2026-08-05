"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { connectDB, PharmacyDrug, Prescription } from "@/models";

export interface FormState {
  error?: string;
}

/* ------------------------------------------------------------
   Drug inventory
   ------------------------------------------------------------ */

function validateDrug(formData: FormData): string | undefined {
  const name = String(formData.get("drug_name") || "").trim();
  const unitPrice = Number(formData.get("unit_price"));
  const quantity = formData.get("quantity_in_stock");

  if (!name) return "Drug name is required.";
  if (Number.isNaN(unitPrice) || unitPrice < 0) return "Unit price must be a valid non-negative number.";
  if (quantity === null || Number.isNaN(Number(quantity)) || Number(quantity) < 0) {
    return "Quantity in stock must be a valid non-negative number.";
  }
  return undefined;
}

export async function createDrug(_prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  await requireRole(["admin", "pharmacist"]);

  const error = validateDrug(formData);
  if (error) return { error };

  await connectDB();

  const name = String(formData.get("drug_name")).trim();

  await PharmacyDrug.create({
    drugName: name,
    category: (formData.get("category") as string) || null,
    description: (formData.get("description") as string) || null,
    unit: (formData.get("unit") as string) || null,
    unitPrice: Number(formData.get("unit_price")),
    quantityInStock: Number(formData.get("quantity_in_stock")),
    reorderLevel: Number(formData.get("reorder_level")) || 10,
  });

  redirect(`/pharmacy?success=${encodeURIComponent(`${name} added to inventory.`)}`);
}

export async function updateDrug(id: string, _prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  await requireRole(["admin", "pharmacist"]);

  const error = validateDrug(formData);
  if (error) return { error };

  await connectDB();

  const drug = await PharmacyDrug.findById(id);
  if (!drug) return { error: "Drug not found." };

  Object.assign(drug, {
    drugName: String(formData.get("drug_name")).trim(),
    category: (formData.get("category") as string) || null,
    description: (formData.get("description") as string) || null,
    unit: (formData.get("unit") as string) || null,
    unitPrice: Number(formData.get("unit_price")),
    quantityInStock: Number(formData.get("quantity_in_stock")),
    reorderLevel: Number(formData.get("reorder_level")) || 10,
  });
  await drug.save();

  redirect(`/pharmacy?success=${encodeURIComponent("Drug details updated successfully.")}`);
}

export async function deleteDrug(id: string) {
  await requireRole(["admin", "pharmacist"]);
  await connectDB();

  let failed = false;
  try {
    await PharmacyDrug.deleteOne({ _id: id });
  } catch {
    failed = true;
  }

  if (failed) {
    redirect(`/pharmacy?error=${encodeURIComponent("Unable to delete drug. It may be referenced in existing prescriptions.")}`);
  }
  redirect(`/pharmacy?success=${encodeURIComponent("Drug removed from inventory.")}`);
}

/* ------------------------------------------------------------
   Prescriptions
   ------------------------------------------------------------ */

export async function createPrescription(_prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  await requireRole(["admin", "doctor"]);

  const patientId = formData.get("patient_id");
  const doctorId = formData.get("doctor_id");
  const appointmentId = formData.get("appointment_id");
  const drugIds = formData.getAll("drug_id");
  const dosages = formData.getAll("dosage");
  const quantities = formData.getAll("quantity");
  const instructions = formData.getAll("instructions");

  if (!patientId) return { error: "Please select a patient." };
  if (!doctorId) return { error: "Please select a doctor." };

  const items = drugIds
    .map((drugId, i) => ({
      drugId: String(drugId),
      dosage: (dosages[i] as string) || null,
      quantity: Number(quantities[i]) || 1,
      instructions: (instructions[i] as string) || null,
    }))
    .filter((item) => item.drugId.trim());

  if (!items.length) return { error: "Please add at least one drug to the prescription." };

  await connectDB();

  let newPrescriptionId: string;
  try {
    const prescription = await Prescription.create({
      patientId: String(patientId),
      doctorId: String(doctorId),
      appointmentId: appointmentId ? String(appointmentId) : null,
      status: "pending",
      items,
    });
    newPrescriptionId = prescription.id;
  } catch (err) {
    console.error("Prescription create error:", err);
    return { error: "Something went wrong while creating the prescription." };
  }

  redirect(`/pharmacy/prescriptions/${newPrescriptionId}?success=${encodeURIComponent("Prescription created successfully.")}`);
}

export async function dispensePrescription(id: string) {
  await requireRole(["admin", "pharmacist"]);
  const mongoose = await connectDB();

  const session = await mongoose.startSession();
  let redirectUrl: string;

  try {
    await session.withTransaction(async () => {
      const prescription = await Prescription.findById(id).session(session);

      if (!prescription) {
        redirectUrl = `/pharmacy/prescriptions?error=${encodeURIComponent("Prescription not found.")}`;
        return;
      }
      if (prescription.status === "dispensed") {
        redirectUrl = `/pharmacy/prescriptions/${id}?error=${encodeURIComponent("This prescription has already been dispensed.")}`;
        return;
      }

      const drugs = await PharmacyDrug.find({ _id: { $in: prescription.items.map((i) => i.drugId) } }).session(session);
      const drugMap = new Map(drugs.map((d) => [d.id, d]));

      const shortages = prescription.items.filter((item) => {
        const drug = drugMap.get(item.drugId.toString());
        return !drug || drug.quantityInStock < item.quantity;
      });

      if (shortages.length) {
        const names = shortages.map((s) => drugMap.get(s.drugId.toString())?.drugName ?? "Unknown drug").join(", ");
        redirectUrl = `/pharmacy/prescriptions/${id}?error=${encodeURIComponent(`Insufficient stock for: ${names}.`)}`;
        return;
      }

      for (const item of prescription.items) {
        await PharmacyDrug.updateOne({ _id: item.drugId }, { $inc: { quantityInStock: -item.quantity } }, { session });
      }

      prescription.status = "dispensed";
      await prescription.save({ session });
      redirectUrl = `/pharmacy/prescriptions/${id}?success=${encodeURIComponent("Prescription dispensed and stock updated.")}`;
    });
  } catch (err) {
    console.error("Dispense prescription error:", err);
    redirectUrl = `/pharmacy/prescriptions/${id}?error=${encodeURIComponent("Unable to dispense prescription.")}`;
  } finally {
    await session.endSession();
  }

  redirect(redirectUrl!);
}
