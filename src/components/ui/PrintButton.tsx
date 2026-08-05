"use client";

import { Printer } from "lucide-react";
import { btnPrimary } from "./buttonStyles";

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className={`no-print ${btnPrimary}`}>
      <Printer size={16} /> Print
    </button>
  );
}
