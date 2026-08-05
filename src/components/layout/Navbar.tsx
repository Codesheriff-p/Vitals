"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { HeartPulse, Menu, LogOut, UserCog } from "lucide-react";
import { logout } from "@/actions/auth";
import type { SessionUser } from "@/types/auth";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({
  user,
  photoUrl,
  onToggleSidebar,
}: {
  user: SessionUser;
  photoUrl?: string | null;
  onToggleSidebar: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 right-0 left-0 z-40 flex h-[60px] items-center justify-between bg-gradient-to-r from-primary to-primary-dark px-4 dark:border-b dark:border-white/10 dark:bg-none dark:bg-ink">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10"
        >
          <Menu size={20} />
        </button>
        <a href="/dashboard" className="flex items-center gap-2.5 text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-trace">
            <HeartPulse size={18} />
          </span>
          <span className="font-display font-semibold tracking-tight">
            VITALS <span className="font-normal text-white/50">HMS</span>
          </span>
        </a>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-white transition-colors hover:bg-white/10"
          >
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- data: URL (Mongo-stored photo) isn't supported by next/image's optimizer
              <img src={photoUrl} alt={`${user.name}'s photo`} className="h-8 w-8 rounded-full object-cover ring-2 ring-white/20" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-trace text-sm font-semibold text-ink ring-2 ring-white/20">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="hidden flex-col items-start leading-tight sm:flex">
              <span className="text-sm font-semibold">{user.name}</span>
              <span className="text-[11px] text-white capitalize">{user.role.replace("_", " ")}</span>
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10 dark:border-white/10 dark:bg-screen dark:shadow-black/20">
              <div className="border-b border-slate-100 px-3 py-2 text-xs text-slate-500 dark:border-white/5 dark:text-white">
                Signed in as <span className="capitalize">{user.role.replace("_", " ")}</span>
              </div>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 dark:text-white dark:hover:bg-white/5"
              >
                <UserCog size={16} /> Edit Profile
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger transition-colors hover:bg-danger/5 dark:text-danger-bright dark:hover:bg-danger-bright/10"
                >
                  <LogOut size={16} /> Logout
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
