"use client";

import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { BrandMark } from "@/components/brand-mark";
import { authBenefits } from "@/lib/site";
import { apiFetch } from "@/lib/api";

export function AuthForm({ mode = "login" }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === "signup";

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await apiFetch(`/api/auth/${isSignup ? "signup" : "login"}`, {
        method: "POST",
        body: form,
      });

      toast.success(response.message || "Access granted.");
      router.push(response.user?.role === "admin" ? "/admin" : "/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid-shell py-10 sm:py-14">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.92fr]">
        <div className="panel overflow-hidden p-6 sm:p-8">
          <BrandMark caption="Investor-ready performance platform" />
          <div className="mt-10 max-w-xl">
            <div className="eyebrow">Premium launch console</div>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {isSignup ? "Create your Whiteloo access profile." : "Return to your recovery dashboard."}
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-white/60">
              Whiteloo blends a premium launch page, smart machine onboarding, and an operations-grade admin layer
              into one polished experience.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {authBenefits.map((benefit) => (
              <div key={benefit} className="panel-muted flex items-start gap-3 p-4">
                <Sparkles className="mt-0.5 h-5 w-5 text-neon" />
                <span className="text-sm leading-6 text-white/70">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/55">
            <span className="data-chip">
              <ShieldCheck className="h-4 w-4 text-neon" />
              JWT secured
            </span>
            <span className="data-chip">MongoDB Atlas ready</span>
            <span className="data-chip">App Router deployed</span>
          </div>
        </div>

        <div className="panel-strong p-6 sm:p-8">
          <div className="eyebrow">{isSignup ? "Founding member setup" : "Member login"}</div>
          <h2 className="mt-4 font-display text-3xl font-semibold text-white">
            {isSignup ? "Be first. Get access." : "Welcome back to Whiteloo."}
          </h2>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {isSignup ? (
              <div>
                <label className="mb-2 block text-sm text-white/70">Full name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  className="field h-12 w-full"
                  placeholder="Alex Mercer"
                  autoComplete="name"
                />
              </div>
            ) : null}

            <div>
              <label className="mb-2 block text-sm text-white/70">
                {isSignup ? "Email" : "Email or admin ID"}
              </label>
              <input
                type={isSignup ? "email" : "text"}
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="field h-12 w-full"
                placeholder={isSignup ? "hello@whiteloo.com" : "hello@whiteloo.com or admin@123"}
                autoComplete={isSignup ? "email" : "username"}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/70">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                className="field h-12 w-full"
                placeholder="At least 8 characters"
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
            </div>

            <button type="submit" className="neon-button mt-3 w-full justify-center" disabled={submitting}>
              {submitting ? "Processing..." : isSignup ? "Create Account" : "Login"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5 text-sm text-white/50">
            {isSignup ? "Already have access?" : "New to Whiteloo?"}{" "}
            <Link href={isSignup ? "/login" : "/signup"} className="text-neon transition hover:text-white">
              {isSignup ? "Login" : "Create an account"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
