import type { ReactNode } from "react";
import { cardClass } from "./buttonStyles";

export default function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`${cardClass} ${className}`}>{children}</div>;
}
