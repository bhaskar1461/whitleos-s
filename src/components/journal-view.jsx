"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { WorkspaceHeader } from "@/components/workspace-header";
import { apiFetch } from "@/lib/api";

export function JournalView({ user, initialEntries }) {
  const [entries, setEntries] = useState(initialEntries);
  const [form, setForm] = useState({
    title: "",
    content: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [entries]
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await apiFetch("/api/journal", {
        method: "POST",
        body: form,
      });

      setEntries((current) => [response.item, ...current]);
      setForm({
        title: "",
        content: "",
        date: new Date().toISOString().slice(0, 10),
      });
      toast.success("Reflection saved.");
    } catch (error) {
      toast.error(error.message || "Unable to save reflection.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await apiFetch(`/api/journal/${id}`, { method: "DELETE" });
      setEntries((current) => current.filter((entry) => entry.id !== id));
      toast.success("Entry deleted.");
    } catch (error) {
      toast.error(error.message || "Unable to delete entry.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="grid-shell py-8 sm:py-10">
      <WorkspaceHeader
        user={user}
        title="Journal"
        subtitle="Bring reflection back into the workspace without losing the premium visual tone."
      />

      <div className="mt-6 grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <section className="panel p-5">
          <div className="eyebrow">Reflection layer</div>
          <h1 className="mt-3 font-display text-4xl font-semibold text-white">Give the data a narrative.</h1>
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Title"
              className="field h-12 w-full"
              required
            />
            <textarea
              value={form.content}
              onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
              placeholder="Write your reflection..."
              className="field min-h-[220px] w-full resize-y py-4"
              required
            />
            <input
              type="date"
              value={form.date}
              onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              className="field h-12 w-full"
              required
            />
            <button type="submit" className="neon-button justify-center" disabled={saving}>
              {saving ? "Saving..." : "Save Reflection"}
            </button>
          </form>
        </section>

        <section className="panel p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="eyebrow">Timeline</div>
              <h2 className="mt-3 font-display text-3xl font-semibold text-white">Your journal archive</h2>
            </div>
            <div className="text-sm text-white/45">{sortedEntries.length} entries</div>
          </div>

          <div className="mt-5 space-y-3">
            {sortedEntries.length === 0 ? (
              <div className="panel-muted px-4 py-8 text-center text-sm text-white/45">
                No journal entries yet.
              </div>
            ) : (
              sortedEntries.map((entry) => (
                <article key={entry.id} className="panel-muted p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{entry.title}</h3>
                      <div className="mt-1 text-sm text-white/45">{entry.date}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                      className="text-sm text-red-200 transition hover:text-red-100"
                    >
                      {deletingId === entry.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                  <div className="mt-4 whitespace-pre-line text-sm leading-7 text-white/65">
                    {entry.content}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
