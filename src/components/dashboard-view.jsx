"use client";

import { CreditCard, QrCode, ScanLine, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { BrandMark } from "@/components/brand-mark";
import { LogoutButton } from "@/components/logout-button";
import { PreferencesForm } from "@/components/preferences-form";
import { dashboardHighlights } from "@/lib/site";
import { formatDate } from "@/lib/utils";
import { workspaceLinks } from "@/lib/workspace";

function QrMock() {
  const cells = [
    "1110010",
    "1001011",
    "1011101",
    "0010110",
    "1101001",
    "0101100",
    "1010011",
  ];

  return (
    <div className="grid grid-cols-7 gap-1 rounded-[22px] border border-white/10 bg-black/70 p-4">
      {cells.join("").split("").map((value, index) => (
        <div key={index} className={`h-4 w-4 rounded-sm ${value === "1" ? "bg-neon" : "bg-white/10"}`} />
      ))}
    </div>
  );
}

export function DashboardView({ user }) {
  const [currentUser, setCurrentUser] = useState(user);

  return (
    <div className="grid-shell py-8 sm:py-10">
      <div className="flex flex-col gap-4 pb-8 sm:flex-row sm:items-center sm:justify-between">
        <BrandMark caption="Member control panel" />
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/" className="ghost-button">
            Back to launch page
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <div className="panel overflow-hidden p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="eyebrow">Member overview</div>
                <h1 className="mt-3 font-display text-4xl font-semibold text-white">Welcome back, {currentUser.name}.</h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-white/60">
                  Your account is ready for launch access, machine unlock, and precision drink defaults.
                </p>
              </div>
              <div className="rounded-full border border-neon/25 bg-neon/10 px-4 py-2 text-sm font-medium text-neon">
                {currentUser.subscription.status}
              </div>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {dashboardHighlights.map((item) => (
                <div key={item.label} className="panel-muted p-4">
                  <div className="text-xs uppercase tracking-[0.3em] text-white/35">{item.label}</div>
                  <div className="mt-3 text-xl font-semibold text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-5">
            <div className="eyebrow">Workspace pages</div>
            <h2 className="mt-3 font-display text-2xl font-semibold text-white">Restored tools, same premium UI.</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {workspaceLinks
                .filter((link) => link.href !== "/dashboard")
                .map((link) => (
                  <Link key={link.href} href={link.href} className="ghost-button">
                    {link.label}
                  </Link>
                ))}
            </div>
          </div>

          <PreferencesForm initialPreferences={currentUser.preferences} onSaved={setCurrentUser} />
        </div>

        <div className="space-y-5">
          <div className="panel-strong p-5">
            <div className="eyebrow">Access identity</div>
            <div className="mt-4 space-y-3 text-sm text-white/65">
              <div className="flex items-center justify-between border-b border-white/6 pb-3">
                <span>Name</span>
                <span className="text-white">{currentUser.name}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/6 pb-3">
                <span>Email</span>
                <span className="text-white">{currentUser.email}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/6 pb-3">
                <span>Plan</span>
                <span className="text-white">{currentUser.subscription.plan}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Joined</span>
                <span className="text-white">{formatDate(currentUser.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="panel overflow-hidden p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="eyebrow">QR / NFC mock integration</div>
                <h2 className="mt-3 font-display text-2xl font-semibold text-white">Instant machine unlock.</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <ScanLine className="h-5 w-5 text-neon" />
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-white/10 bg-gradient-to-br from-white/8 to-black/50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-white/35">Launch access token</div>
                  <div className="mt-3 text-xl font-semibold text-white">WHITEL00-FOUNDING</div>
                </div>
                <CreditCard className="h-6 w-6 text-neon" />
              </div>
              <div className="mt-5 flex items-end justify-between gap-6">
                <QrMock />
                <div className="space-y-2 text-right text-sm text-white/55">
                  <div className="flex items-center justify-end gap-2">
                    <QrCode className="h-4 w-4 text-neon" />
                    QR pickup ready
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Sparkles className="h-4 w-4 text-neon" />
                    NFC tap profile armed
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="panel-muted p-5">
            <div className="eyebrow">Current pour preset</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {Object.entries(currentUser.preferences).map(([key, value]) => (
                <div key={key} className="rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.24em] text-white/35">{key}</div>
                  <div className="mt-2 text-sm text-white">
                    {Array.isArray(value) ? value.join(", ") || "None selected" : value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
