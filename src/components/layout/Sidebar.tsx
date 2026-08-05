"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_SECTIONS } from "./navConfig";
import type { SessionUser } from "@/types/auth";

export default function Sidebar({
  user,
  collapsed,
  mobileOpen,
  onNavigate,
}: {
  user: SessionUser;
  collapsed: boolean;
  mobileOpen: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={`fixed top-[60px] bottom-0 left-0 z-30 overflow-y-auto border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 dark:border-white/10 dark:bg-ink ${
        collapsed ? "lg:w-[72px]" : "lg:w-[250px]"
      } w-[250px] ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <nav className="px-3 py-4 pb-10">
        {NAV_SECTIONS.map((section) => {
          const items = section.items.filter((item) => item.roles.includes(user.role));
          if (!items.length) return null;

          return (
            <div key={section.heading} className="mb-4">
              {!collapsed && (
                <p className="mb-1.5 px-3 font-mono text-[10px] font-semibold tracking-widest text-slate-400 uppercase dark:text-white">
                  {section.heading}
                </p>
              )}
              {items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`relative mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      collapsed ? "justify-center" : ""
                    } ${
                      active
                        ? "bg-trace/10 text-trace-deep dark:bg-trace/15 dark:text-trace"
                        : "text-slate-600 hover:bg-light-bg hover:text-trace-deep dark:text-white dark:hover:bg-white/5 dark:hover:text-white"
                    }`}
                  >
                    {active && (
                      <span
                        className="absolute top-1/2 left-0 h-5 -translate-y-1/2 rounded-r-full bg-trace dark:shadow-[0_0_8px_rgba(51,226,154,0.5)]"
                        style={{ width: 3 }}
                      />
                    )}
                    <Icon size={18} className="shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
