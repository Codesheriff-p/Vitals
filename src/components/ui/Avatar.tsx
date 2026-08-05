import { User } from "lucide-react";

const SIZE_CLASSES = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-20 w-20 text-lg",
  xl: "h-28 w-28 text-2xl",
} as const;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export default function Avatar({
  src,
  name,
  size = "md",
  className,
}: {
  src?: string | null;
  name: string;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  const base = `flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200/80 bg-light-bg font-semibold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white ${SIZE_CLASSES[size]} ${className ?? ""}`;

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- data: URLs (Mongo-stored photos) aren't supported by next/image's optimizer
    return <img src={src} alt={name ? `${name}'s photo` : "Profile photo"} className={`${base} object-cover`} />;
  }

  const label = initials(name);
  return (
    <div className={base} aria-hidden="true">
      {label || <User size={SIZE_CLASSES[size] === SIZE_CLASSES.xl ? 32 : 18} />}
    </div>
  );
}
