"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";

export default function Alert({ type, message }: { type: "success" | "error"; message: string }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const isSuccess = type === "success";

  return (
    <div
      className={`mb-4 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
        isSuccess
          ? "border-success/20 bg-success/10 text-success dark:border-success-bright/20 dark:bg-success-bright/10 dark:text-success-bright"
          : "border-danger/20 bg-danger/10 text-danger dark:border-danger-bright/20 dark:bg-danger-bright/10 dark:text-danger-bright"
      }`}
    >
      <div className="flex items-start gap-2">
        {isSuccess ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertTriangle size={18} className="mt-0.5 shrink-0" />}
        <span>{message}</span>
      </div>
      <button onClick={() => setVisible(false)} aria-label="Dismiss" className="shrink-0 opacity-70 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  );
}
