const TONE_CLASS = {
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
  info: "badge-info",
  neutral: "badge-neutral",
} as const;

export type BadgeTone = keyof typeof TONE_CLASS;

const STATUS_TONE: Record<string, BadgeTone> = {
  completed: "success",
  dispensed: "success",
  paid: "success",
  active: "success",
  scheduled: "warning",
  pending: "warning",
  processing: "info",
  requested: "warning",
  partial: "warning",
  cancelled: "danger",
  "no-show": "danger",
  unpaid: "danger",
  inactive: "danger",
};

export function statusTone(status: string): BadgeTone {
  return STATUS_TONE[status] ?? "neutral";
}

export default function Badge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  return <span className={`badge ${TONE_CLASS[tone]}`}>{children}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={statusTone(status)}>{status}</Badge>;
}
