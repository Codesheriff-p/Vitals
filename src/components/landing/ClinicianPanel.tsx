export default function ClinicianPanel() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-ink p-8 sm:p-10">
      <div className="monitor-screen pointer-events-none absolute inset-0" />

      <div className="relative">
        <svg viewBox="0 0 320 360" className="mx-auto h-auto w-full max-w-[280px]" aria-hidden="true">
          {/* viewfinder corner brackets */}
          <g stroke="var(--color-trace)" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7">
            <path d="M14,44 V16 H42" />
            <path d="M278,16 H306 V44" />
            <path d="M306,316 V344 H278" />
            <path d="M42,344 H14 V316" />
          </g>

          {/* stethoscope tube */}
          <path
            d="M124,168 C110,190 108,215 122,232 C136,249 152,244 156,226"
            stroke="var(--color-trace)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
          />
          <path
            d="M196,168 C210,190 212,215 198,232 C186,246 172,244 160,232"
            stroke="var(--color-trace)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
          />
          <circle cx="157" cy="230" r="9" fill="var(--color-ink)" stroke="var(--color-trace)" strokeWidth="3.5" />
          <circle cx="157" cy="230" r="3" fill="var(--color-trace)" />

          {/* coat / shoulders */}
          <path
            d="M62,352 C58,270 76,206 122,178 L138,168 L160,186 L182,168 L198,178 C244,206 262,270 258,352 Z"
            fill="#0f1e30"
            stroke="#3d5872"
            strokeWidth="2"
          />
          <path d="M138,168 L160,186 L152,214 Z" fill="#13233a" stroke="#3d5872" strokeWidth="1.5" />
          <path d="M182,168 L160,186 L168,214 Z" fill="#13233a" stroke="#3d5872" strokeWidth="1.5" />

          {/* ID badge */}
          <rect x="184" y="248" width="34" height="24" rx="4" fill="#0f1e30" stroke="var(--color-trace)" strokeWidth="1.75" />
          <line x1="190" y1="256" x2="212" y2="256" stroke="var(--color-trace)" strokeWidth="1.5" opacity="0.7" />
          <line x1="190" y1="262" x2="206" y2="262" stroke="var(--color-trace)" strokeWidth="1.5" opacity="0.45" />

          {/* neck + head */}
          <rect x="146" y="140" width="28" height="34" rx="10" fill="#13233a" stroke="#3d5872" strokeWidth="2" />
          <circle cx="160" cy="104" r="46" fill="#13233a" stroke="#3d5872" strokeWidth="2" />
          <path
            d="M116,96 C118,64 138,46 160,46 C182,46 202,64 204,96 C196,84 182,78 160,78 C138,78 124,84 116,96 Z"
            fill="#0f1e30"
            stroke="#3d5872"
            strokeWidth="2"
          />
        </svg>

        <p className="mt-6 text-center font-mono text-[11px] tracking-[0.25em] text-white/40 uppercase">
          Clinical staff &middot; role-verified
        </p>
      </div>
    </div>
  );
}
