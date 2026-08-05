// Trace-green theming scoped to the auth pages (login/signup and their
// sub-steps) only. The rest of the app keeps its primary/secondary palette —
// these are deliberately separate from src/components/ui/buttonStyles.ts.
//
// The auth card flips with the theme like the rest of the app: a white
// surface in light mode, the dark `screen` surface in dark mode. So every
// class here carries both halves. Green-on-white needs `trace-deep` to clear
// contrast (see the note in globals.css); `trace` is only used on dark
// surfaces, or as an opaque fill under `text-ink`, which is safe in both.

export const authInputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 shadow-sm transition-colors placeholder:text-slate-400 focus:border-trace-deep focus:ring-2 focus:ring-trace-deep/20 focus:outline-none dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40 dark:focus:border-trace dark:focus:ring-trace/20";

export const authBtnPrimary =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-trace px-4 py-2 text-sm font-semibold text-ink shadow-sm shadow-trace/20 transition-all hover:bg-trace/90 hover:shadow-md hover:shadow-trace/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:active:scale-100";

export const authLinkClass =
  "font-semibold text-trace-deep transition-colors hover:text-trace-deep/80 dark:text-trace dark:hover:text-trace/80";

export const authLabelClass = "mb-1 block text-sm font-medium text-slate-600 dark:text-white/80";

// Muted copy inside the card — the switch-link footer, helper text under a
// form, the "we sent a code to X" line.
export const authMutedClass = "text-slate-500 dark:text-white/60";

// Icons sitting inside an input (mail, lock, eye).
export const authIconClass = "text-slate-400 dark:text-white/40";

// Inline form-level error banner. Uses the -bright danger variant on dark,
// matching Alert.tsx.
export const authErrorClass =
  "rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger dark:border-danger-bright/20 dark:bg-danger-bright/10 dark:text-danger-bright";
