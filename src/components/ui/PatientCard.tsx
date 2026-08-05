import Link from "next/link";
import { Phone, Mail, MapPin, Droplet, Stethoscope } from "lucide-react";
import Avatar from "./Avatar";
import { calcAge } from "@/lib/format";
import { cardClass } from "./buttonStyles";

export interface PatientCardData {
  id: string;
  patientNumber: string;
  firstName: string;
  lastName: string;
  dob: Date | string | null;
  gender: string | null;
  bloodGroup: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  photoUrl: string | null;
  assignedDoctor?: { id: string; name: string; specialization: string | null } | null;
}

export default function PatientCard({ patient }: { patient: PatientCardData }) {
  const fullName = `${patient.firstName} ${patient.lastName}`;

  return (
    <Link
      href={`/patients/${patient.id}`}
      className={`${cardClass} flex flex-col gap-4 transition-shadow hover:shadow-md hover:shadow-slate-900/[0.06] dark:hover:shadow-black/30`}
    >
      <div className="flex items-start gap-3">
        <Avatar src={patient.photoUrl} name={fullName} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-800 dark:text-white">{fullName}</p>
          <p className="text-xs font-medium text-trace-deep dark:text-trace">{patient.patientNumber}</p>
          <p className="mt-0.5 text-xs text-slate-400 capitalize dark:text-white">
            {patient.gender ?? "—"} &middot; {calcAge(patient.dob)} yrs
          </p>
        </div>
        {patient.bloodGroup && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-danger/25 bg-danger/10 px-2 py-1 text-xs font-semibold text-danger dark:border-danger-bright/30 dark:bg-danger-bright/10 dark:text-danger-bright">
            <Droplet size={11} /> {patient.bloodGroup}
          </span>
        )}
      </div>

      <dl className="space-y-1.5 text-sm text-slate-600 dark:text-white">
        <div className="flex items-center gap-2">
          <Phone size={13} className="shrink-0 text-slate-400 dark:text-white" />
          <span className="truncate">{patient.phone}</span>
        </div>
        {patient.email && (
          <div className="flex items-center gap-2">
            <Mail size={13} className="shrink-0 text-slate-400 dark:text-white" />
            <span className="truncate">{patient.email}</span>
          </div>
        )}
        {patient.address && (
          <div className="flex items-center gap-2">
            <MapPin size={13} className="shrink-0 text-slate-400 dark:text-white" />
            <span className="truncate">{patient.address}</span>
          </div>
        )}
      </dl>

      {patient.assignedDoctor && (
        <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-light-bg px-2.5 py-1.5 text-xs dark:border-white/10 dark:bg-white/5">
          <Stethoscope size={13} className="shrink-0 text-trace-deep dark:text-trace" />
          <span className="truncate text-slate-600 dark:text-white">
            <span className="font-semibold">Dr. {patient.assignedDoctor.name}</span>
            {patient.assignedDoctor.specialization ? ` — ${patient.assignedDoctor.specialization}` : ""}
          </span>
        </div>
      )}
    </Link>
  );
}
