"use client";

import { useState } from "react";
import { toast } from "sonner";

import { WorkspaceHeader } from "@/components/workspace-header";
import { apiFetch } from "@/lib/api";

export function ContactView({ user }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    countryCode: "+1",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await apiFetch("/api/contact", {
        method: "POST",
        body: form,
      });
      setSubmitted(true);
      toast.success("Message received.");
    } catch (error) {
      toast.error(error.message || "Unable to send message.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid-shell py-8 sm:py-10">
      <WorkspaceHeader
        user={user}
        title="Contact"
        subtitle="Bring the old support page back with the same premium styling as the rest of Whiteloo."
        showLogout={Boolean(user)}
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="panel p-5">
          <div className="eyebrow">Support desk</div>
          <h1 className="mt-3 font-display text-4xl font-semibold text-white">Keep the support experience as sharp as the product.</h1>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="panel-muted p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-white/35">Email</div>
              <div className="mt-3 text-lg font-semibold text-white">hello@whiteloo.com</div>
            </div>
            <div className="panel-muted p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-white/35">Response path</div>
              <div className="mt-3 text-lg font-semibold text-white">Email first</div>
            </div>
            <div className="panel-muted p-4 sm:col-span-2">
              <div className="text-xs uppercase tracking-[0.24em] text-white/35">Focus</div>
              <div className="mt-3 text-sm leading-7 text-white/55">
                Launch partnerships, investor demos, product feedback, and premium gym rollout coordination.
              </div>
            </div>
          </div>
        </section>

        <section className="panel p-5">
          {submitted ? (
            <div className="panel-strong flex min-h-[340px] items-center justify-center p-8 text-center">
              <div>
                <div className="font-display text-3xl font-semibold text-white">Thanks.</div>
                <div className="mt-4 max-w-md text-sm leading-7 text-white/55">
                  Your message has been recorded. The restored contact page now uses the same Whiteloo visual system as
                  the rest of the app.
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="eyebrow">Send a message</div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" className="field h-12 w-full" required />
                <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" className="field h-12 w-full" required />
              </div>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="field h-12 w-full" required />
              <div className="grid gap-4 sm:grid-cols-3">
                <input name="countryCode" value={form.countryCode} onChange={handleChange} placeholder="Code" className="field h-12 w-full" />
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="field h-12 w-full sm:col-span-2" required />
              </div>
              <textarea name="message" value={form.message} onChange={handleChange} placeholder="Message" rows={6} className="field min-h-[200px] w-full resize-y py-4" required />
              <button type="submit" className="neon-button justify-center" disabled={submitting}>
                {submitting ? "Sending..." : "Submit"}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
