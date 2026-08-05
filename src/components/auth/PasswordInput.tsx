"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { authInputClass, authIconClass } from "./authStyles";

export default function PasswordInput({
  id,
  name,
  placeholder = "••••••••",
  autoComplete,
}: {
  id: string;
  name: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Lock size={16} className={`pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 ${authIconClass}`} />
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        required
        minLength={6}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`${authInputClass} pr-9 pl-9`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className={`absolute top-1/2 right-3 -translate-y-1/2 transition-colors hover:text-slate-600 dark:hover:text-white ${authIconClass}`}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
