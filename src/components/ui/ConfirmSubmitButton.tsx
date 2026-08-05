"use client";

import { useRef, useState, useTransition } from "react";
import type { ReactNode } from "react";
import ConfirmDialog from "./ConfirmDialog";

export default function ConfirmSubmitButton({
  confirmMessage,
  confirmLabel,
  tone,
  className,
  children,
  title,
}: {
  confirmMessage: string;
  confirmLabel?: string;
  tone?: "danger" | "default";
  className?: string;
  children: ReactNode;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const buttonRef = useRef<HTMLButtonElement>(null);

  function handleConfirm() {
    const form = buttonRef.current?.form;
    if (!form) return;
    startTransition(() => {
      form.requestSubmit();
    });
  }

  return (
    <>
      <button ref={buttonRef} type="button" onClick={() => setOpen(true)} className={className} title={title}>
        {children}
      </button>
      {open && (
        <ConfirmDialog
          message={confirmMessage}
          confirmLabel={confirmLabel}
          tone={tone}
          pending={pending}
          onConfirm={handleConfirm}
          onCancel={() => setOpen(false)}
        />
      )}
    </>
  );
}
