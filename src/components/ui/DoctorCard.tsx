import Link from "next/link";
import { Phone, Mail, GraduationCap, Building2 } from "lucide-react";
import Avatar from "./Avatar";
import Badge from "./Badge";
import { cardClass } from "./buttonStyles";

export interface DoctorCardData {
  id: string;
  name: string;
  specialization: string | null;
  qualification: string | null;
  phone: string | null;
  email: string;
  department: string | null;
  status: "active" | "inactive";
  photoUrl: string | null;
}

export default function DoctorCard({ doctor }: { doctor: DoctorCardData }) {
  return (
    <Link
      href={`/doctors/${doctor.id}`}
      className={`${cardClass} flex flex-col gap-4 transition-shadow hover:shadow-md hover:shadow-slate-900/[0.06] dark:hover:shadow-black/30`}
    >
      <div className="flex items-start gap-3">
        <Avatar src={doctor.photoUrl} name={doctor.name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-800 dark:text-white">Dr. {doctor.name}</p>
          <p className="text-xs font-medium text-trace-deep dark:text-trace">{doctor.specialization ?? "General Practice"}</p>
        </div>
        <Badge tone={doctor.status === "active" ? "success" : "danger"}>{doctor.status}</Badge>
      </div>

      <dl className="space-y-1.5 text-sm text-slate-600 dark:text-white">
        {doctor.phone && (
          <div className="flex items-center gap-2">
            <Phone size={13} className="shrink-0 text-slate-400 dark:text-white" />
            <span className="truncate">{doctor.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Mail size={13} className="shrink-0 text-slate-400 dark:text-white" />
          <span className="truncate">{doctor.email}</span>
        </div>
        {doctor.qualification && (
          <div className="flex items-center gap-2">
            <GraduationCap size={13} className="shrink-0 text-slate-400 dark:text-white" />
            <span className="truncate">{doctor.qualification}</span>
          </div>
        )}
        {doctor.department && (
          <div className="flex items-center gap-2">
            <Building2 size={13} className="shrink-0 text-slate-400 dark:text-white" />
            <span className="truncate">{doctor.department}</span>
          </div>
        )}
      </dl>
    </Link>
  );
}
