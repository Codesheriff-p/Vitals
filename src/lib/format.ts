export function formatMoney(amount: number | string): string {
  return "₦" + Number(amount).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-GB");
}

export function formatTime(time: string): string {
  return time.slice(0, 5);
}

export function calcAge(dob: Date | string | null): string {
  if (!dob) return "—";
  const diff = Date.now() - new Date(dob).getTime();
  return String(Math.abs(new Date(diff).getUTCFullYear() - 1970));
}
