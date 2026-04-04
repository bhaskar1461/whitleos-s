"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandMark } from "@/components/brand-mark";
import { LogoutButton } from "@/components/logout-button";
import { workspaceLinks } from "@/lib/workspace";

export function WorkspaceHeader({ user, title, subtitle, showLogout = true }) {
  const pathname = usePathname();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <BrandMark caption="Performance workspace" />
          <div className="hidden h-10 w-px bg-white/10 lg:block" />
          <div>
            <div className="font-display text-2xl font-semibold text-white">{title}</div>
            <div className="mt-1 text-sm text-white/50">{subtitle}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {user ? (
            <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/65">
              {user.name}
            </div>
          ) : null}
          <Link href="/" className="ghost-button">
            Launch Page
          </Link>
          {showLogout && user ? <LogoutButton /> : null}
          {!user ? (
            <Link href="/login" className="neon-button">
              Login
            </Link>
          ) : null}
        </div>
      </div>

      <div className="panel flex flex-wrap gap-2 px-3 py-3">
        {workspaceLinks.map((link) => {
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm transition ${
                active
                  ? "bg-neon text-black"
                  : "border border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
