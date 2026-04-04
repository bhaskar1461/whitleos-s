"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";

export function WaitlistForm({
  buttonLabel = "Join Waitlist",
  placeholder = "Enter your email",
  compact = false,
}) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Add your email to join the waitlist.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await apiFetch("/api/waitlist", {
        method: "POST",
        body: { email },
      });

      toast.success(response.message || "You're on the list.");
      setEmail("");
    } catch (error) {
      toast.error(error.message || "We couldn't save your email right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex w-full ${
        compact ? "flex-col gap-3 sm:flex-row sm:items-center" : "flex-col gap-4 sm:flex-row sm:items-center"
      }`}
    >
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder={placeholder}
        className="field h-12 flex-1"
        autoComplete="email"
      />
      <button type="submit" className="neon-button justify-center" disabled={submitting}>
        {submitting ? "Submitting..." : buttonLabel}
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
