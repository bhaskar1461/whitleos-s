"use client";

import { BarChart3, MapPinned, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { BrandMark } from "@/components/brand-mark";
import { LogoutButton } from "@/components/logout-button";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/utils";

function MetricCard({ label, value, helper }) {
  return (
    <div className="panel-strong p-5">
      <div className="text-xs uppercase tracking-[0.3em] text-white/35">{label}</div>
      <div className="mt-4 font-display text-4xl font-semibold text-white">{value}</div>
      <div className="mt-2 text-sm text-white/50">{helper}</div>
    </div>
  );
}

export function AdminView({ user, initialUsers, initialWaitlist, initialLocations, analytics }) {
  const [users] = useState(initialUsers);
  const [waitlist] = useState(initialWaitlist);
  const [locations, setLocations] = useState(initialLocations);
  const [form, setForm] = useState({
    name: "",
    city: "",
    status: "coming soon",
  });
  const [submitting, setSubmitting] = useState(false);

  const derivedAnalytics = useMemo(
    () => ({
      ...analytics,
      totalLocations: locations.length,
      liveLocations: locations.filter((location) => location.status === "live").length,
      comingSoonLocations: locations.filter((location) => location.status === "coming soon").length,
    }),
    [analytics, locations]
  );

  async function handleLocationSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await apiFetch("/api/admin/location", {
        method: "POST",
        body: form,
      });

      setLocations((current) => [response.location, ...current]);
      setForm({ name: "", city: "", status: "coming soon" });
      toast.success("Location created.");
    } catch (error) {
      toast.error(error.message || "Unable to create location.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid-shell py-8 sm:py-10">
      <div className="flex flex-col gap-4 pb-8 sm:flex-row sm:items-center sm:justify-between">
        <BrandMark caption="Admin operations console" />
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard" className="ghost-button">
            User dashboard
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="panel p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="eyebrow">Admin layer</div>
            <h1 className="mt-3 font-display text-4xl font-semibold text-white">Whiteloo investor demo console.</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-white/60">
              Track demand, launch readiness, and member activation across the premium gym network.
            </p>
          </div>
          <div className="rounded-full border border-neon/25 bg-neon/10 px-4 py-2 text-sm font-medium text-neon">
            Signed in as {user.email}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Users" value={derivedAnalytics.totalUsers} helper="Authenticated member profiles" />
          <MetricCard label="Admins" value={derivedAnalytics.totalAdmins} helper="Ops-ready access profiles" />
          <MetricCard label="Waitlist" value={derivedAnalytics.waitlistCount} helper="Interested launch members" />
          <MetricCard label="Live Locations" value={derivedAnalytics.liveLocations} helper="Gym machines online" />
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-5">
          <div className="panel-strong p-5">
            <div className="flex items-center gap-3">
              <MapPinned className="h-5 w-5 text-neon" />
              <div>
                <div className="eyebrow">Manage locations</div>
                <h2 className="mt-2 font-display text-2xl font-semibold text-white">Add rollout locations</h2>
              </div>
            </div>

            <form onSubmit={handleLocationSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-white/65">Gym name</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="field h-12 w-full"
                  placeholder="Equinox Kensington"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/65">City</label>
                <input
                  value={form.city}
                  onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                  className="field h-12 w-full"
                  placeholder="London"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/65">Status</label>
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                  className="field h-12 w-full"
                >
                  <option value="coming soon" className="bg-black text-white">
                    Coming soon
                  </option>
                  <option value="live" className="bg-black text-white">
                    Live
                  </option>
                </select>
              </div>

              <button type="submit" className="neon-button justify-center" disabled={submitting}>
                {submitting ? "Saving..." : "Create Location"}
              </button>
            </form>
          </div>

          <div className="panel p-5">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-neon" />
              <div>
                <div className="eyebrow">Analytics</div>
                <h2 className="mt-2 font-display text-2xl font-semibold text-white">Basic counts</h2>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm text-white/65">
              <div className="flex items-center justify-between border-b border-white/6 pb-3">
                <span>Total locations</span>
                <span className="text-white">{derivedAnalytics.totalLocations}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/6 pb-3">
                <span>Coming soon</span>
                <span className="text-white">{derivedAnalytics.comingSoonLocations}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Newest waitlist entry</span>
                <span className="text-white">{waitlist[0] ? formatDate(waitlist[0].createdAt) : "Pending"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="panel overflow-hidden p-5">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-neon" />
              <div>
                <div className="eyebrow">Manage users</div>
                <h2 className="mt-2 font-display text-2xl font-semibold text-white">Member access</h2>
              </div>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm text-white/65">
                <thead className="text-xs uppercase tracking-[0.24em] text-white/35">
                  <tr>
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Role</th>
                    <th className="pb-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((entry) => (
                    <tr key={entry.id} className="border-t border-white/6">
                      <td className="py-4 pr-4 text-white">{entry.name}</td>
                      <td className="py-4 pr-4">{entry.email}</td>
                      <td className="py-4 pr-4">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-neon">
                          {entry.role}
                        </span>
                      </td>
                      <td className="py-4">{formatDate(entry.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="panel-strong p-5">
              <div className="eyebrow">Waitlist</div>
              <h3 className="mt-2 font-display text-2xl font-semibold text-white">Demand snapshot</h3>
              <div className="mt-5 space-y-3">
                {waitlist.slice(0, 6).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm">
                    <span className="text-white/80">{entry.email}</span>
                    <span className="text-white/40">{formatDate(entry.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-strong p-5">
              <div className="eyebrow">Locations</div>
              <h3 className="mt-2 font-display text-2xl font-semibold text-white">Gym rollout map</h3>
              <div className="mt-5 space-y-3">
                {locations.map((location) => (
                  <div key={location.id} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm text-white">{location.name}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.24em] text-white/35">{location.city}</div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.24em] ${
                          location.status === "live"
                            ? "border border-neon/25 bg-neon/10 text-neon"
                            : "border border-white/10 bg-white/5 text-white/55"
                        }`}
                      >
                        {location.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
