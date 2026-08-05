import { redirect } from "next/navigation";
import Link from "next/link";
import {
  HeartPulse,
  ArrowRight,
  Users,
  CalendarCheck,
  BadgeCheck,
  Pill,
  FlaskConical,
  Receipt,
  UserCog,
  Network,
  BarChart3,
  ShieldCheck,
  Lock,
  Printer,
  Activity,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import ClinicianPanel from "@/components/landing/ClinicianPanel";

const SNAPSHOT = [
  { value: "82%", label: "Bed occupancy" },
  { value: "11 min", label: "Avg. wait time" },
  { value: "214", label: "Active patients" },
  { value: "99.98%", label: "System uptime" },
];

const NAV_LINKS = [
  { href: "#modules", label: "Modules" },
  { href: "#workflow", label: "Workflow" },
  { href: "#access", label: "Access" },
];

const MODULES = [
  { icon: Users, label: "Patients", copy: "Full records, admissions and history in one chart." },
  { icon: CalendarCheck, label: "Appointments", copy: "Book, reschedule and track visits across every doctor." },
  { icon: BadgeCheck, label: "Doctors", copy: "Rosters, specialties and availability at a glance." },
  { icon: Pill, label: "Pharmacy", copy: "Track stock, dispense drugs and flag low supply." },
  { icon: FlaskConical, label: "Laboratory", copy: "Order tests and get results back to the right chart." },
  { icon: Receipt, label: "Billing", copy: "Generate and settle invoices without leaving a patient's file." },
  { icon: UserCog, label: "Staff", copy: "Manage who works where, and who covers what." },
  { icon: Network, label: "Departments", copy: "Structure the hospital the way it's actually organized." },
  { icon: BarChart3, label: "Reports", copy: "Read hospital-wide numbers the moment they change." },
  { icon: ShieldCheck, label: "Access Control", copy: "Grant every account exactly the role it needs — no more." },
];

const WORKFLOW = [
  { step: "01", title: "Register", copy: "Add a patient once — every department works from the same chart." },
  { step: "02", title: "Book", copy: "Schedule with any doctor, any department, in seconds." },
  { step: "03", title: "Consult", copy: "Doctors record diagnoses and request labs from the same screen." },
  { step: "04", title: "Diagnose & treat", copy: "Lab results and prescriptions land back on that same file." },
  { step: "05", title: "Bill", copy: "Generate the invoice and settle it before the patient leaves." },
];

const TRUST_FACTS = [
  {
    icon: ShieldCheck,
    title: "Scoped to the role",
    copy: "A receptionist can't open payroll. A lab technician can't edit billing. Access follows the account.",
  },
  {
    icon: Lock,
    title: "Session-secured",
    copy: "Signed-in sessions expire automatically, and every route re-checks who's asking before it responds.",
  },
  {
    icon: Activity,
    title: "Live across departments",
    copy: "A status change in the lab or pharmacy shows up on the ward the moment it happens — no refreshing.",
  },
  {
    icon: Printer,
    title: "Audit-ready billing",
    copy: "Every invoice prints exactly as billed, ready to hand to the patient or file for the record.",
  },
];

const ROLES = ["Admin", "Doctor", "Nurse", "Pharmacist", "Lab Technician", "Receptionist"];

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="bg-light-bg">
      {/* Hero — the monitor screen */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="monitor-screen pointer-events-none absolute inset-0" />
        <div className="relative mx-auto flex max-w-6xl flex-col px-6 pt-8 pb-20 sm:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-trace/15 text-trace">
                <HeartPulse size={18} />
              </span>
              <span className="font-display text-lg font-bold tracking-tight">
                VITALS <span className="font-normal text-white/50">HMS</span>
              </span>
            </div>
            <div className="flex items-center gap-7">
              <nav className="hidden items-center gap-6 sm:flex">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <Link
                href="/login"
                className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:border-white/30 hover:bg-white/5"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="mt-16 max-w-2xl sm:mt-24">
            <p className="pulse-dot inline-flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-trace uppercase">
              Hospital operations &middot; Live
            </p>
            <h1 className="mt-5 font-display text-4xl leading-[1.08] font-bold tracking-tight sm:text-6xl">
              Every vital sign your hospital runs on.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
              VITALS brings patients, appointments, staff, pharmacy, lab and billing onto one
              chart — so the front desk, the wards and admin are always reading the same
              numbers.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-trace px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-trace/90"
              >
                Sign in to VITALS
                <ArrowRight size={16} />
              </Link>
              <span className="text-sm text-white/40">Role-based access for every department.</span>
            </div>
          </div>

          {/* System activity trace */}
          <div className="mt-20 sm:mt-24">
            <p className="font-mono text-[11px] tracking-[0.25em] text-white/35 uppercase">
              System activity
            </p>
            <svg
              viewBox="0 0 1400 200"
              className="mt-3 h-24 w-full sm:h-32"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M-20,100 H40 L55,100 L65,70 L75,130 L85,20 L95,175 L105,90 L115,105 L125,100 H360 L375,100 L385,70 L395,130 L405,20 L415,175 L425,90 L435,105 L445,100 H680 L695,100 L705,70 L715,130 L725,20 L735,175 L745,90 L755,105 L765,100 H1000 L1015,100 L1025,70 L1035,130 L1045,20 L1055,175 L1065,90 L1075,105 L1085,100 H1420"
                fill="none"
                stroke="var(--color-trace)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ecg-trace"
                style={{ filter: "drop-shadow(0 0 6px color-mix(in srgb, var(--color-trace) 70%, transparent))" }}
              />
            </svg>

            <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-4">
              {SNAPSHOT.map((stat) => (
                <div key={stat.label} className="bg-ink px-5 py-4">
                  <dd className="font-mono text-2xl font-medium text-trace sm:text-3xl">{stat.value}</dd>
                  <dt className="mt-1 text-xs tracking-wide text-white/40 uppercase">{stat.label}</dt>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-white/30">Illustrative snapshot — your numbers will differ.</p>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20 sm:px-8 sm:py-28">
        <div className="max-w-xl">
          <p className="font-mono text-xs tracking-[0.2em] text-secondary uppercase">Modules</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Every department, one system.
          </h2>
          <p className="mt-4 text-slate-500">
            No spreadsheets to reconcile at the end of the day — everyone works from the same
            record, updated as it happens.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {MODULES.map(({ icon: Icon, label, copy }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/[0.03] transition-shadow hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon size={20} />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold text-slate-900">{label}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="scroll-mt-20 border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28">
          <div className="max-w-xl">
            <p className="font-mono text-xs tracking-[0.2em] text-secondary uppercase">Workflow</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              One patient, one file, start to finish.
            </h2>
            <p className="mt-4 text-slate-500">
              The same five steps happen at every hospital. VITALS just keeps them on one record
              instead of five different ones.
            </p>
          </div>

          <ol className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
            {WORKFLOW.map((item, i) => (
              <li key={item.step} className="relative pl-0">
                <div className="flex items-center gap-3 lg:block">
                  <span className="font-mono text-3xl font-medium text-primary/25">{item.step}</span>
                  {i < WORKFLOW.length - 1 && (
                    <span className="hidden h-px flex-1 bg-slate-200 lg:mt-4 lg:mb-4 lg:block" aria-hidden="true" />
                  )}
                </div>
                <h3 className="mt-2 font-display text-base font-semibold text-slate-900 lg:mt-3">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{item.copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Clinician / trust */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <ClinicianPanel />

          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-secondary uppercase">Why it holds up</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Built around how the ward actually works.
            </h2>
            <p className="mt-4 text-slate-500">
              Every screen is scoped to a role, so a nurse, a pharmacist and an administrator
              each open VITALS to exactly what their day needs — nothing they have to dig
              through.
            </p>

            <dl className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {TRUST_FACTS.map(({ icon: Icon, title, copy }) => (
                <div key={title}>
                  <dt className="flex items-center gap-2 font-display text-sm font-semibold text-slate-900">
                    <Icon size={16} className="text-primary" />
                    {title}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-slate-500">{copy}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="access" className="scroll-mt-20 border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
          <p className="font-mono text-xs tracking-[0.2em] text-secondary uppercase">Access</p>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Built for the whole ward.
          </h2>
          <p className="mt-3 max-w-lg text-slate-500">
            Each account sees only what its role needs — nothing more.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            {ROLES.map((role) => (
              <span
                key={role}
                className="rounded-full border border-slate-200 bg-light-bg px-4 py-1.5 font-mono text-xs tracking-wide text-slate-600 uppercase"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="monitor-screen pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 text-center sm:px-8">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to see today&rsquo;s numbers?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/60">
            Sign in with your hospital account to get started.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-trace px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-trace/90"
          >
            Sign in to VITALS
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 border-t border-white/10 px-6 py-8 text-center sm:flex-row sm:justify-between sm:px-8 sm:text-left">
          <div className="flex items-center gap-2 text-white/60">
            <HeartPulse size={16} className="text-trace" />
            <span className="font-mono text-xs tracking-wide uppercase">VITALS HMS</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-5">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-white/50 transition-colors hover:text-white">
                {link.label}
              </a>
            ))}
            <Link href="/login" className="text-sm text-white/50 transition-colors hover:text-white">
              Sign in
            </Link>
          </nav>
          <p className="font-mono text-xs text-white/30">
            &copy; {new Date().getFullYear()} internal hospital system.
          </p>
        </div>
      </footer>
    </main>
  );
}
