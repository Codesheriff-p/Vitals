import Link from "next/link";
import { Plus, Search, Eye, Pencil, Trash2, Users } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { connectDB, Patient } from "@/models";
import type { IDoctor, IUser } from "@/models";
import { deletePatient } from "@/actions/patients";
import PageHeader from "@/components/ui/PageHeader";
import FlashMessages from "@/components/ui/FlashMessages";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmSubmitButton from "@/components/ui/ConfirmSubmitButton";
import ViewToggle from "@/components/ui/ViewToggle";
import PatientCard from "@/components/ui/PatientCard";
import Avatar from "@/components/ui/Avatar";
import { btnPrimary, btnOutline, iconBtnOutline, iconBtnOutlineDanger, inputClass } from "@/components/ui/buttonStyles";
import { formatDate } from "@/lib/format";
import { containsRegex } from "@/lib/mongoRegex";
import { toPhotoDataUrl } from "@/lib/image";

export const metadata = { title: "Patients - VITALS HMS" };

type AssignedDoctor = IDoctor & { userId: IUser };

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireUser();
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const view = params.view === "table" ? "table" : "cards";

  await connectDB();

  const filter = search
    ? {
        $or: [
          { firstName: containsRegex(search) },
          { lastName: containsRegex(search) },
          { patientNumber: containsRegex(search) },
          { phone: containsRegex(search) },
        ],
      }
    : {};

  const patients = await Patient.find(filter)
    .sort({ createdAt: -1 })
    .select("+photo +photoContentType")
    .populate<{ assignedDoctorId: AssignedDoctor | null }>({ path: "assignedDoctorId", populate: { path: "userId" } });

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Patients" }]}
        title="Patients"
        action={
          <Link href="/patients/add" className={btnPrimary}>
            <Plus size={16} /> Add Patient
          </Link>
        }
      />

      <FlashMessages searchParams={params} />

      <form action="/patients" method="GET" className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 dark:text-white" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by name, patient #, or phone"
            className={`${inputClass} pl-9`}
          />
        </div>
        <button type="submit" className={btnOutline}>
          Search
        </button>
        {search && (
          <Link href="/patients" className="text-sm text-slate-500 dark:text-white hover:text-trace-deep dark:hover:text-trace">
            Clear
          </Link>
        )}
        <div className="ml-auto">
          <ViewToggle basePath="/patients" current={view} searchParams={params} />
        </div>
      </form>

      {patients.length ? (
        view === "cards" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {patients.map((p) => (
              <PatientCard
                key={p.id}
                patient={{
                  id: p.id,
                  patientNumber: p.patientNumber,
                  firstName: p.firstName,
                  lastName: p.lastName,
                  dob: p.dob,
                  gender: p.gender,
                  bloodGroup: p.bloodGroup,
                  phone: p.phone,
                  email: p.email,
                  address: p.address,
                  photoUrl: toPhotoDataUrl(p.photo, p.photoContentType),
                  assignedDoctor: p.assignedDoctorId
                    ? { id: p.assignedDoctorId.id, name: p.assignedDoctorId.userId.name, specialization: p.assignedDoctorId.specialization }
                    : null,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                    <th className="py-2 pr-3">Patient #</th>
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Gender</th>
                    <th className="py-2 pr-3">Blood Group</th>
                    <th className="py-2 pr-3">Phone</th>
                    <th className="py-2 pr-3">Registered</th>
                    <th className="py-2 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                      <td className="py-2.5 pr-3 font-semibold">{p.patientNumber}</td>
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar src={toPhotoDataUrl(p.photo, p.photoContentType)} name={`${p.firstName} ${p.lastName}`} size="sm" />
                          {p.firstName} {p.lastName}
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 capitalize">{p.gender}</td>
                      <td className="py-2.5 pr-3">{p.bloodGroup || "—"}</td>
                      <td className="py-2.5 pr-3">{p.phone}</td>
                      <td className="py-2.5 pr-3">{formatDate(p.createdAt)}</td>
                      <td className="py-2.5 pr-3">
                        <div className="flex justify-end gap-1.5">
                          <Link href={`/patients/${p.id}`} title="View" className={iconBtnOutline}>
                            <Eye size={14} />
                          </Link>
                          <Link href={`/patients/${p.id}/edit`} title="Edit" className={iconBtnOutline}>
                            <Pencil size={14} />
                          </Link>
                          <form action={deletePatient.bind(null, p.id)}>
                            <ConfirmSubmitButton
                              confirmMessage={`Delete patient ${p.patientNumber}? This cannot be undone.`}
                              className={iconBtnOutlineDanger}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </ConfirmSubmitButton>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
          <EmptyState icon={Users} message={search ? `No patients found for "${search}".` : "No patients found."} />
        </div>
      )}
    </div>
  );
}
