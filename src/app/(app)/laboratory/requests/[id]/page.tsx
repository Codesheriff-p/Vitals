import { notFound } from "next/navigation";
import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { connectDB, LabRequest, LabTest } from "@/models";
import type { IPatient, IDoctor, IUser } from "@/models";
import { submitLabResults } from "@/actions/laboratory";
import PageHeader from "@/components/ui/PageHeader";
import FlashMessages from "@/components/ui/FlashMessages";
import EmptyState from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/Badge";
import { btnPrimary, inputClass } from "@/components/ui/buttonStyles";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Lab Request Details - VITALS HMS" };

type DoctorWithUser = IDoctor & { userId: IUser };

export default async function LabRequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireRole(["admin", "lab_technician", "doctor"]);
  const { id } = await params;
  const sp = await searchParams;

  await connectDB();

  const request = await LabRequest.findById(id)
    .populate<{ patientId: IPatient }>("patientId")
    .populate<{ doctorId: DoctorWithUser }>({ path: "doctorId", populate: { path: "userId" } });
  if (!request || !request.patientId || !request.doctorId?.userId) notFound();

  const tests = await LabTest.find({ _id: { $in: request.items.map((i) => i.testId) } });
  const testMap = new Map(tests.map((t) => [t.id, t]));

  const canEnterResults = ["admin", "lab_technician"].includes(user.role) && request.status !== "completed";
  const submitResultsAction = submitLabResults.bind(null, request.id);

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Laboratory", href: "/laboratory" },
          { label: "Requests", href: "/laboratory/requests" },
          { label: request.requestNumber },
        ]}
        title={request.requestNumber}
      />

      <FlashMessages searchParams={sp} />

      <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Request Info</h2>
        <dl className="space-y-2 text-sm">
          <Row
            label="Patient"
            value={
              <Link href={`/patients/${request.patientId.id}`} className="text-trace-deep dark:text-trace hover:underline">
                {request.patientId.firstName} {request.patientId.lastName}
              </Link>
            }
          />
          <Row label="Patient #" value={request.patientId.patientNumber} />
          <Row label="Doctor" value={request.doctorId.userId.name} />
          <Row label="Status" value={<StatusBadge status={request.status} />} />
          <Row label="Date" value={formatDate(request.createdAt)} />
        </dl>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Test Results</h2>
        {request.items.length ? (
          canEnterResults ? (
            <form action={submitResultsAction}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                      <th className="py-2 pr-3">Test</th>
                      <th className="py-2 pr-3">Normal Range</th>
                      <th className="py-2 pr-3">Result</th>
                      <th className="py-2 pr-3">Notes</th>
                      <th className="py-2 pr-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {request.items.map((i) => {
                      const test = testMap.get(i.testId.toString());
                      return (
                        <tr key={i.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                          <td className="py-2 pr-3 font-semibold">
                            <input type="hidden" name="item_id" value={i.id} />
                            {test?.testName}
                          </td>
                          <td className="py-2 pr-3">
                            {test?.normalRange || "—"} {test?.unit}
                          </td>
                          <td className="py-2 pr-3" style={{ minWidth: 160 }}>
                            {i.status === "completed" ? (
                              <>
                                {i.result}
                                <input type="hidden" name="result" value={i.result ?? ""} />
                              </>
                            ) : (
                              <input type="text" name="result" placeholder="Enter result" className={`${inputClass} py-1.5`} />
                            )}
                          </td>
                          <td className="py-2 pr-3" style={{ minWidth: 180 }}>
                            {i.status === "completed" ? (
                              <>
                                {i.resultNotes || "—"}
                                <input type="hidden" name="result_notes" value={i.resultNotes ?? ""} />
                              </>
                            ) : (
                              <input type="text" name="result_notes" placeholder="Optional notes" className={`${inputClass} py-1.5`} />
                            )}
                          </td>
                          <td className="py-2 pr-3">
                            <StatusBadge status={i.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <button type="submit" className={`${btnPrimary} mt-3`}>
                Save Results
              </button>
            </form>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                    <th className="py-2 pr-3">Test</th>
                    <th className="py-2 pr-3">Normal Range</th>
                    <th className="py-2 pr-3">Result</th>
                    <th className="py-2 pr-3">Notes</th>
                    <th className="py-2 pr-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {request.items.map((i) => {
                    const test = testMap.get(i.testId.toString());
                    return (
                      <tr key={i.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                        <td className="py-2 pr-3 font-semibold">{test?.testName}</td>
                        <td className="py-2 pr-3">
                          {test?.normalRange || "—"} {test?.unit}
                        </td>
                        <td className="py-2 pr-3">{i.result || "—"}</td>
                        <td className="py-2 pr-3">{i.resultNotes || "—"}</td>
                        <td className="py-2 pr-3">
                          <StatusBadge status={i.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <EmptyState icon={FlaskConical} message="No tests on this request." />
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-400 dark:text-white">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
