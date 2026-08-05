"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import type { SessionUser } from "@/types/auth";

export default function AppShell({
  user,
  photoUrl,
  children,
}: {
  user: SessionUser;
  photoUrl?: string | null;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleToggle() {
    if (window.innerWidth < 1024) {
      setMobileOpen((v) => !v);
    } else {
      setCollapsed((v) => !v);
    }
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-ink">
      <Navbar user={user} photoUrl={photoUrl} onToggleSidebar={handleToggle} />

      <div className="flex pt-[60px]">
        <Sidebar user={user} collapsed={collapsed} mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />

        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 top-[60px] z-20 bg-black/35 backdrop-blur-[1px] lg:hidden"
          />
        )}

        <main
          className={`w-full min-w-0 px-5 py-6 transition-[margin] duration-200 sm:px-7 ${
            collapsed ? "lg:ml-[72px]" : "lg:ml-[250px]"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
