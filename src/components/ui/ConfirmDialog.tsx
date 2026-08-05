"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CircleHelp } from "lucide-react";
import { btnOutlineSecondary, btnDanger, btnPrimary } from "./buttonStyles";

export default function ConfirmDialog({
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  tone = "danger",
  pending,
  onConfirm,
  onCancel,
}: {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" (default) for destructive actions; "default" for a neutral/positive confirmation. */
  tone?: "danger" | "default";
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const isDanger = tone === "danger";
  const cancelRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus the safe (cancel) option by default, and trap Tab within the dialog.
  useEffect(() => {
    cancelRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>("button:not(:disabled)");
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [onCancel]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} aria-hidden="true" />

      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-message"
        className="relative w-full max-w-sm rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-screen dark:shadow-black/40"
      >
        <div className="flex items-start gap-3">
          <div
            className={
              isDanger
                ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger dark:bg-danger-bright/10 dark:text-danger-bright"
                : "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-trace-deep/10 text-trace-deep dark:bg-trace/10 dark:text-trace"
            }
          >
            {isDanger ? <AlertTriangle size={22} /> : <CircleHelp size={22} />}
          </div>

          <p id="confirm-dialog-message" className="pt-2.5 text-sm leading-relaxed text-slate-700 dark:text-white">
            {message}
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button ref={cancelRef} type="button" onClick={onCancel} className={btnOutlineSecondary}>
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} disabled={pending} className={isDanger ? btnDanger : btnPrimary}>
            {pending ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
