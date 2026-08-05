"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { connectDB, Bill, Payment } from "@/models";
import type { PaymentMethod } from "@/models";

export interface FormState {
  error?: string;
}

const BILL_CATEGORIES = ["consultation", "lab", "pharmacy", "other"] as const;
type BillCategory = (typeof BILL_CATEGORIES)[number];

function isBillCategory(value: string): value is BillCategory {
  return (BILL_CATEGORIES as readonly string[]).includes(value);
}

async function generateBillNumber(): Promise<string> {
  const count = await Bill.countDocuments();
  return "BILL-" + String(count + 1).padStart(4, "0");
}

export async function createBill(_prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  const user = await requireRole(["admin", "receptionist"]);

  const patientId = formData.get("patient_id");
  const appointmentId = formData.get("appointment_id");
  const discount = Number(formData.get("discount")) || 0;

  const descriptions = formData.getAll("description");
  const categories = formData.getAll("category");
  const quantities = formData.getAll("quantity");
  const unitPrices = formData.getAll("unit_price");

  if (!patientId) return { error: "Please select a patient." };

  const items = descriptions
    .map((desc, i) => {
      const description = String(desc || "").trim();
      if (!description) return null;
      const quantity = Number(quantities[i]) || 1;
      const unitPrice = Number(unitPrices[i]) || 0;
      const category = String(categories[i] || "other");
      return {
        description,
        category: isBillCategory(category) ? category : ("other" as BillCategory),
        quantity,
        unitPrice,
        total: quantity * unitPrice,
      };
    })
    .filter((i): i is NonNullable<typeof i> => i !== null);

  if (!items.length) return { error: "Please add at least one billable item." };

  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const total = Math.max(subtotal - discount, 0);

  await connectDB();

  let newBillId: string;
  try {
    const billNumber = await generateBillNumber();
    const bill = await Bill.create({
      billNumber,
      patientId: String(patientId),
      appointmentId: appointmentId ? String(appointmentId) : null,
      subtotal,
      discount,
      total,
      status: "unpaid",
      createdBy: user.id,
      items,
    });
    newBillId = bill.id;
  } catch (err) {
    console.error("Bill create error:", err);
    return { error: "Something went wrong while creating the bill." };
  }

  redirect(`/billing/${newBillId}?success=${encodeURIComponent("Bill created successfully.")}`);
}

export async function recordPayment(billId: string, formData: FormData) {
  const user = await requireRole(["admin", "receptionist"]);
  const mongoose = await connectDB();

  const amount = Number(formData.get("amount"));
  const paymentMethod = ((formData.get("payment_method") as string) || "cash") as PaymentMethod;
  const paymentDate = (formData.get("payment_date") as string) || new Date().toISOString().slice(0, 10);
  const notes = (formData.get("notes") as string) || null;

  const session = await mongoose.startSession();
  let redirectUrl: string;

  try {
    await session.withTransaction(async () => {
      const bill = await Bill.findById(billId).session(session);

      if (!bill) {
        redirectUrl = `/billing?error=${encodeURIComponent("Bill not found.")}`;
        return;
      }
      if (!amount || amount <= 0) {
        redirectUrl = `/billing/${billId}?error=${encodeURIComponent("Please enter a valid payment amount.")}`;
        return;
      }

      const paidAgg = await Payment.aggregate([
        { $match: { billId: bill._id } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]).session(session);
      const totalPaid = paidAgg[0]?.total ?? 0;
      const currentBalance = bill.total - totalPaid;

      if (amount > currentBalance) {
        redirectUrl = `/billing/${billId}?error=${encodeURIComponent(
          `Payment exceeds the outstanding balance of ₦${currentBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}.`
        )}`;
        return;
      }

      await Payment.create([{ billId, amount, paymentMethod, paymentDate, receivedBy: user.id, notes }], { session });

      const newBalance = currentBalance - amount;
      bill.status = newBalance <= 0 ? "paid" : "partial";
      await bill.save({ session });

      redirectUrl = `/billing/${billId}?success=${encodeURIComponent("Payment recorded successfully.")}`;
    });
  } catch (err) {
    console.error("Record payment error:", err);
    redirectUrl = `/billing/${billId}?error=${encodeURIComponent("Unable to record payment.")}`;
  } finally {
    await session.endSession();
  }

  redirect(redirectUrl!);
}
