"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { connectDB, LabTest, LabRequest } from "@/models";
import type { LabRequestStatus } from "@/models";

export interface FormState {
  error?: string;
}

/* ------------------------------------------------------------
   Lab test catalog
   ------------------------------------------------------------ */

function validateTest(formData: FormData): string | undefined {
  const name = String(formData.get("test_name") || "").trim();
  const price = Number(formData.get("price"));
  if (!name) return "Test name is required.";
  if (Number.isNaN(price) || price < 0) return "Price must be a valid non-negative number.";
  return undefined;
}

export async function createLabTest(_prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  await requireRole(["admin", "lab_technician"]);

  const error = validateTest(formData);
  if (error) return { error };

  await connectDB();

  const name = String(formData.get("test_name")).trim();

  await LabTest.create({
    testName: name,
    description: (formData.get("description") as string) || null,
    normalRange: (formData.get("normal_range") as string) || null,
    unit: (formData.get("unit") as string) || null,
    price: Number(formData.get("price")),
  });

  redirect(`/laboratory?success=${encodeURIComponent(`${name} added to the test catalog.`)}`);
}

export async function updateLabTest(id: string, _prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  await requireRole(["admin", "lab_technician"]);

  const error = validateTest(formData);
  if (error) return { error };

  await connectDB();

  const test = await LabTest.findById(id);
  if (!test) return { error: "Lab test not found." };

  Object.assign(test, {
    testName: String(formData.get("test_name")).trim(),
    description: (formData.get("description") as string) || null,
    normalRange: (formData.get("normal_range") as string) || null,
    unit: (formData.get("unit") as string) || null,
    price: Number(formData.get("price")),
  });
  await test.save();

  redirect(`/laboratory?success=${encodeURIComponent("Lab test updated successfully.")}`);
}

export async function deleteLabTest(id: string) {
  await requireRole(["admin", "lab_technician"]);
  await connectDB();

  let failed = false;
  try {
    await LabTest.deleteOne({ _id: id });
  } catch {
    failed = true;
  }

  if (failed) {
    redirect(`/laboratory?error=${encodeURIComponent("Unable to delete test. It may be referenced in existing lab requests.")}`);
  }
  redirect(`/laboratory?success=${encodeURIComponent("Lab test removed from catalog.")}`);
}

/* ------------------------------------------------------------
   Lab requests
   ------------------------------------------------------------ */

async function generateRequestNumber(): Promise<string> {
  const count = await LabRequest.countDocuments();
  return "LAB-" + String(count + 1).padStart(4, "0");
}

export async function createLabRequest(_prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  await requireRole(["admin", "doctor"]);

  const patientId = formData.get("patient_id");
  const doctorId = formData.get("doctor_id");
  const appointmentId = formData.get("appointment_id");
  const testIds = formData.getAll("test_id").filter((v) => String(v).trim());

  if (!patientId) return { error: "Please select a patient." };
  if (!doctorId) return { error: "Please select a doctor." };
  if (!testIds.length) return { error: "Please select at least one test." };

  await connectDB();

  let newRequestId: string;
  try {
    const requestNumber = await generateRequestNumber();
    const request = await LabRequest.create({
      requestNumber,
      patientId: String(patientId),
      doctorId: String(doctorId),
      appointmentId: appointmentId ? String(appointmentId) : null,
      status: "requested",
      items: testIds.map((testId) => ({ testId: String(testId), status: "pending" })),
    });
    newRequestId = request.id;
  } catch (err) {
    console.error("Lab request create error:", err);
    return { error: "Something went wrong while creating the lab request." };
  }

  redirect(`/laboratory/requests/${newRequestId}?success=${encodeURIComponent("Lab request created successfully.")}`);
}

export async function submitLabResults(requestId: string, formData: FormData) {
  await requireRole(["admin", "lab_technician"]);
  await connectDB();

  const itemIds = formData.getAll("item_id");
  const results = formData.getAll("result");
  const notes = formData.getAll("result_notes");

  let redirectUrl: string;
  try {
    const request = await LabRequest.findById(requestId);
    if (!request) {
      redirectUrl = `/laboratory/requests?error=${encodeURIComponent("Lab request not found.")}`;
    } else {
      for (let i = 0; i < itemIds.length; i++) {
        const result = String(results[i] ?? "").trim();
        if (!result) continue;
        const item = request.items.id(String(itemIds[i]));
        if (item) {
          item.result = result;
          item.resultNotes = (notes[i] as string) || null;
          item.status = "completed";
          item.processedAt = new Date();
        }
      }

      const total = request.items.length;
      const completed = request.items.filter((i) => i.status === "completed").length;

      let newStatus: LabRequestStatus = "requested";
      if (total > 0 && completed === total) newStatus = "completed";
      else if (completed > 0) newStatus = "processing";
      request.status = newStatus;

      await request.save();
      redirectUrl = `/laboratory/requests/${requestId}?success=${encodeURIComponent("Lab results saved successfully.")}`;
    }
  } catch (err) {
    console.error("Submit lab results error:", err);
    redirectUrl = `/laboratory/requests/${requestId}?error=${encodeURIComponent("Unable to save results.")}`;
  }

  redirect(redirectUrl);
}
