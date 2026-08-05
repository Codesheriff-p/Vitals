"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import Avatar from "./Avatar";

export default function ImageUpload({
  name,
  label,
  defaultPreview,
  personName,
}: {
  name: string;
  label: string;
  defaultPreview?: string | null;
  /** Used to render initials in the fallback avatar before any name has been typed. */
  personName?: string;
}) {
  const [preview, setPreview] = useState<string | null>(defaultPreview ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar src={preview} name={personName ?? ""} size="xl" />
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-white">{label}</label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50 dark:border-white/15 dark:text-white dark:hover:border-white/30 dark:hover:bg-white/5"
        >
          <Camera size={14} /> {preview ? "Change photo" : "Upload photo"}
        </button>
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
        <p className="mt-1 text-xs text-slate-400 dark:text-white">JPG or PNG, up to 2MB.</p>
      </div>
    </div>
  );
}
