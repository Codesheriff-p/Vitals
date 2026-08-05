import Link from "next/link";
import {
  Users,
  CalendarCheck2,
  BadgeCheck,
  ClipboardList,
  TriangleAlert,
  Receipt,
  Wallet,
  CalendarX2,
  FileHeart,
  CheckCircle2,
  Eye,
  Pencil,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import {
  getAdminStats,
  getDoctorStats,
  getPharmacistStats,
  getLabTechStats,
  getReceptionStats,
} from "@/lib/dashboard";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/Badge";
import DashboardHero from "@/components/dashboard/DashboardHero";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import { iconBtnOutline } from "@/components/ui/buttonStyles";
import { formatDate, formatMoney } from "@/lib/format";

export const metadata = { title: "Dashboard - VITALS HMS" };

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div>
      {user.role === "admin" && <AdminDashboard name={user.name} />}
      {user.role === "doctor" && <DoctorDashboard name={user.name} userId={user.id} />}
      {user.role === "pharmacist" && <PharmacistDashboard name={user.name} />}
      {user.role === "lab_technician" && <LabTechDashboard name={user.name} />}
      {(user.role === "receptionist" || user.role === "nurse") && <ReceptionDashboard name={user.name} />}
    </div>
  );
}

async function AdminDashboard({ name }: { name: string }) {
  const stats = await getAdminStats();

  return (
    <>
      <DashboardHero
        name={name}
        stats={[
          { value: stats.totalPatients, label: "Total patients" },
          { value: stats.todayAppointments, label: "Today's appointments" },
          { value: stats.totalDoctors, label: "Active doctors" },
          { value: formatMoney(stats.outstandingAmount), label: "Outstanding balance" },
        ]}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Link href="/patients">
          <StatCard icon={Users} label="Total Patients" value={stats.totalPatients} color="primary" />
        </Link>
        <Link href={`/appointments?date=${todayISO()}`}>
          <StatCard icon={CalendarCheck2} label="Today's Appointments" value={stats.todayAppointments} color="secondary" />
        </Link>
        <Link href="/doctors">
          <StatCard icon={BadgeCheck} label="Active Doctors" value={stats.totalDoctors} color="success" />
        </Link>
        <Link href="/laboratory/requests">
          <StatCard icon={ClipboardList} label="Pending Lab Requests" value={stats.pendingLabRequests} color="warning" />
        </Link>
        <Link href="/pharmacy?lowStock=1">
          <StatCard icon={TriangleAlert} label="Low Stock Drugs" value={stats.lowStockCount} color="danger" />
        </Link>
        <Link href="/billing">
          <StatCard icon={Receipt} label="Unpaid / Partial Bills" value={stats.unpaidBillsCount} color="danger" />
        </Link>
        <Link href="/billing" className="col-span-2">
          <StatCard icon={Wallet} label="Outstanding Balance" value={formatMoney(stats.outstandingAmount)} color="primary" />
        </Link>
      </div>

      <DashboardCharts statusBreakdown={stats.statusBreakdown} monthlyRevenue={stats.monthlyRevenue} />

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Recent Appointments</h2>
          <Link href="/appointments" className="text-xs font-medium text-trace-deep hover:underline dark:text-trace">
            View all
          </Link>
        </div>
        {stats.recentAppointments.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                  <th className="py-2 pr-3">Appt #</th>
                  <th className="py-2 pr-3">Patient</th>
                  <th className="py-2 pr-3">Doctor</th>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentAppointments.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                    <td className="py-2 pr-3">{a.appointment_number}</td>
                    <td className="py-2 pr-3">
                      {a.patient_first_name} {a.patient_last_name}
                    </td>
                    <td className="py-2 pr-3">{a.doctor_name}</td>
                    <td className="py-2 pr-3">{formatDate(a.appointment_date)}</td>
                    <td className="py-2 pr-3">{a.appointment_time}</td>
                    <td className="py-2 pr-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex justify-end">
                        <Link href={`/appointments/${a.id}`} title="View" className={iconBtnOutline}>
                          <Eye size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={CalendarX2} message="No appointments yet." />
        )}
      </Card>
    </>
  );
}

async function DoctorDashboard({ name, userId }: { name: string; userId: string }) {
  const stats = await getDoctorStats(userId);

  if (stats.noDoctorProfile) {
    return (
      <>
        <DashboardHero name={name} />
        <div className="rounded-lg bg-warning/10 px-4 py-3 text-sm text-warning dark:bg-white/10 dark:text-white">
          Your account is not linked to a doctor profile. Contact an administrator.
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHero
        name={name}
        stats={[
          { value: stats.todayAppointments, label: "Today's appointments" },
          { value: stats.myPatients, label: "Patients seen" },
          { value: stats.pendingLabRequests, label: "Pending lab requests" },
        ]}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Link href={`/appointments?date=${todayISO()}`}>
          <StatCard icon={CalendarCheck2} label="Today's Appointments" value={stats.todayAppointments} color="primary" />
        </Link>
        <Link href="/patients">
          <StatCard icon={Users} label="Patients Seen" value={stats.myPatients} color="success" />
        </Link>
        <Link href="/laboratory/requests">
          <StatCard icon={ClipboardList} label="Pending Lab Requests" value={stats.pendingLabRequests} color="warning" />
        </Link>
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Today&apos;s Schedule</h2>
          <Link href={`/appointments?date=${todayISO()}`} className="text-xs font-medium text-trace-deep hover:underline dark:text-trace">
            View all
          </Link>
        </div>
        {stats.todayList.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 pr-3">Patient</th>
                  <th className="py-2 pr-3">Patient #</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.todayList.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                    <td className="py-2 pr-3">{a.appointment_time}</td>
                    <td className="py-2 pr-3">
                      {a.patient_first_name} {a.patient_last_name}
                    </td>
                    <td className="py-2 pr-3">{a.patient_number}</td>
                    <td className="py-2 pr-3">{a.type}</td>
                    <td className="py-2 pr-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex justify-end">
                        <Link href={`/appointments/${a.id}`} title="View" className={iconBtnOutline}>
                          <Eye size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={CalendarX2} message="No appointments scheduled for today." />
        )}
      </Card>
    </>
  );
}

async function PharmacistDashboard({ name }: { name: string }) {
  const stats = await getPharmacistStats();

  return (
    <>
      <DashboardHero
        name={name}
        stats={[
          { value: stats.pendingPrescriptions, label: "Pending prescriptions" },
          { value: stats.lowStockList.length, label: "Low stock drugs" },
        ]}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Link href="/pharmacy/prescriptions?status=pending">
          <StatCard icon={FileHeart} label="Pending Prescriptions" value={stats.pendingPrescriptions} color="warning" />
        </Link>
        <Link href="/pharmacy?lowStock=1">
          <StatCard icon={TriangleAlert} label="Low Stock Drugs" value={stats.lowStockList.length} color="danger" />
        </Link>
      </div>

      <Card className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Pending Prescriptions</h2>
          <Link href="/pharmacy/prescriptions?status=pending" className="text-xs font-medium text-trace-deep hover:underline dark:text-trace">
            View all
          </Link>
        </div>
        {stats.pendingPrescriptionList.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                  <th className="py-2 pr-3">Patient</th>
                  <th className="py-2 pr-3">Doctor</th>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.pendingPrescriptionList.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                    <td className="py-2 pr-3">
                      {p.patient_first_name} {p.patient_last_name}
                    </td>
                    <td className="py-2 pr-3">{p.doctor_name}</td>
                    <td className="py-2 pr-3">{formatDate(p.created_at)}</td>
                    <td className="py-2 pr-3">
                      <div className="flex justify-end">
                        <Link href={`/pharmacy/prescriptions/${p.id}`} title="View" className={iconBtnOutline}>
                          <Eye size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={CheckCircle2} message="No pending prescriptions." />
        )}
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Low Stock Alerts</h2>
          <Link href="/pharmacy?lowStock=1" className="text-xs font-medium text-trace-deep hover:underline dark:text-trace">
            View all
          </Link>
        </div>
        {stats.lowStockList.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                  <th className="py-2 pr-3">Drug</th>
                  <th className="py-2 pr-3">In Stock</th>
                  <th className="py-2 pr-3">Reorder Level</th>
                  <th className="py-2 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.lowStockList.map((d) => (
                  <tr key={d.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                    <td className="py-2 pr-3">{d.drug_name}</td>
                    <td className="py-2 pr-3 font-semibold text-danger">{d.quantity_in_stock}</td>
                    <td className="py-2 pr-3">{d.reorder_level}</td>
                    <td className="py-2 pr-3">
                      <div className="flex justify-end">
                        <Link href={`/pharmacy/${d.id}/edit`} title="Edit" className={iconBtnOutline}>
                          <Pencil size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={CheckCircle2} message="All drug stock levels are healthy." />
        )}
      </Card>
    </>
  );
}

async function LabTechDashboard({ name }: { name: string }) {
  const stats = await getLabTechStats();

  return (
    <>
      <DashboardHero name={name} stats={[{ value: stats.pendingLabRequests, label: "Pending lab requests" }]} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Link href="/laboratory/requests">
          <StatCard icon={ClipboardList} label="Pending Lab Requests" value={stats.pendingLabRequests} color="warning" />
        </Link>
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Pending Requests</h2>
          <Link href="/laboratory/requests" className="text-xs font-medium text-trace-deep hover:underline dark:text-trace">
            View all
          </Link>
        </div>
        {stats.pendingList.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                  <th className="py-2 pr-3">Request #</th>
                  <th className="py-2 pr-3">Patient</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Requested</th>
                  <th className="py-2 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.pendingList.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                    <td className="py-2 pr-3">{r.request_number}</td>
                    <td className="py-2 pr-3">
                      {r.patient_first_name} {r.patient_last_name}
                    </td>
                    <td className="py-2 pr-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-2 pr-3">{formatDate(r.created_at)}</td>
                    <td className="py-2 pr-3">
                      <div className="flex justify-end">
                        <Link href={`/laboratory/requests/${r.id}`} title="View" className={iconBtnOutline}>
                          <Eye size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={CheckCircle2} message="No pending lab requests." />
        )}
      </Card>
    </>
  );
}

async function ReceptionDashboard({ name }: { name: string }) {
  const stats = await getReceptionStats();

  return (
    <>
      <DashboardHero
        name={name}
        stats={[
          { value: stats.todayAppointments, label: "Today's appointments" },
          { value: stats.totalPatients, label: "Total patients" },
          { value: stats.unpaidBillsCount, label: "Unpaid / partial bills" },
        ]}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Link href={`/appointments?date=${todayISO()}`}>
          <StatCard icon={CalendarCheck2} label="Today's Appointments" value={stats.todayAppointments} color="primary" />
        </Link>
        <Link href="/patients">
          <StatCard icon={Users} label="Total Patients" value={stats.totalPatients} color="success" />
        </Link>
        <Link href="/billing">
          <StatCard icon={Receipt} label="Unpaid / Partial Bills" value={stats.unpaidBillsCount} color="danger" />
        </Link>
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Today&apos;s Schedule</h2>
          <Link href={`/appointments?date=${todayISO()}`} className="text-xs font-medium text-trace-deep hover:underline dark:text-trace">
            View all
          </Link>
        </div>
        {stats.todayList.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 pr-3">Patient</th>
                  <th className="py-2 pr-3">Doctor</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.todayList.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                    <td className="py-2 pr-3">{a.appointment_time}</td>
                    <td className="py-2 pr-3">
                      {a.patient_first_name} {a.patient_last_name}
                    </td>
                    <td className="py-2 pr-3">{a.doctor_name}</td>
                    <td className="py-2 pr-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex justify-end">
                        <Link href={`/appointments/${a.id}`} title="View" className={iconBtnOutline}>
                          <Eye size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={CalendarX2} message="No appointments scheduled for today." />
        )}
      </Card>
    </>
  );
}
