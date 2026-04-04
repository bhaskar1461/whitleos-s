import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ScanLine, Sparkles } from "lucide-react";

import { Reveal } from "@/components/animated-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WaitlistForm } from "@/components/waitlist-form";
import { launchCities, launchSignals, precisionFeatures, premiumNotes } from "@/lib/site";

export default function HomePage() {
  return (
    <main className="relative overflow-hidden pb-8">
      <SiteHeader />

      <section className="grid-shell pt-10 sm:pt-14">
        <Reveal className="panel overflow-hidden px-5 py-6 sm:px-8 sm:py-8">
          <div className="grid gap-8 lg:grid-cols-[0.98fr_1.02fr] lg:items-center">
            <div className="max-w-2xl">
              <div className="eyebrow">Fresh protein. Fresh experience.</div>
              <h1 className="mt-5 font-display text-[3rem] font-semibold leading-[0.95] tracking-tight text-white sm:text-[4.5rem] lg:text-[5.6rem]">
                Don&apos;t make protein.
                <span className="block text-neon">Just drink it.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/60 sm:text-lg">
                Whiteloo installs smart machines inside premium gyms, delivering fresh protein shakes in two minutes
                with zero shaker noise, zero prep friction, and a luxury-grade product ritual.
              </p>

              <div className="mt-8 max-w-xl">
                <WaitlistForm compact />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="data-chip">
                  <Sparkles className="h-4 w-4 text-neon" />
                  Apple/Tesla inspired experience
                </span>
                <span className="data-chip">2 minute dispense cycle</span>
                <span className="data-chip">Premium gym launch 2026</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-8 top-8 hidden h-40 w-40 rounded-full bg-neon/10 blur-3xl sm:block" />
              <div className="panel-strong relative overflow-hidden p-5">
                <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-neon/70 to-transparent" />
                <div className="flex items-center justify-between pb-5">
                  <div>
                    <div className="text-xs uppercase tracking-[0.32em] text-white/35">Smart machine visual</div>
                    <div className="mt-3 text-2xl font-semibold text-white">Fresh protein shakes in 2 minutes.</div>
                  </div>
                  <div className="rounded-full border border-neon/20 bg-neon/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-neon">
                    Launch Mode
                  </div>
                </div>

                <div className="overflow-hidden rounded-[26px] border border-white/8 bg-black/60">
                  <Image
                    src="/whiteloo-machine.svg"
                    alt="Whiteloo smart protein machine placeholder"
                    width={1200}
                    height={900}
                    className="h-auto w-full"
                    priority
                  />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {launchSignals.map((signal) => (
                    <div key={signal.title} className="panel-muted p-4">
                      <signal.icon className="h-5 w-5 text-neon" />
                      <div className="mt-3 text-base font-semibold text-white">{signal.title}</div>
                      <p className="mt-2 text-sm leading-6 text-white/50">{signal.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section id="process" className="grid-shell pt-8">
        <Reveal className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="panel p-6 sm:p-8">
            <div className="eyebrow">The evolution of post-workout nutrition.</div>
            <h2 className="mt-4 max-w-xl font-display text-3xl font-semibold text-white sm:text-4xl">
              Fresh protein shaken by systems, not by your schedule.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/58">
              Fresh protein shakes in 2 minutes. No shaker. No effort. No excuses. Whiteloo automates the final step
              in recovery so members can move from workout to refuel without breaking flow.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="panel-strong flex min-h-[220px] flex-col justify-between p-6">
              <div className="eyebrow">Step 01</div>
              <div className="text-5xl font-semibold text-neon">01</div>
              <p className="text-sm leading-6 text-white/55">Authenticate instantly with card, phone, or app tap.</p>
            </div>
            <div className="panel-strong flex min-h-[220px] flex-col justify-between p-6">
              <div className="eyebrow">Time to pour</div>
              <div className="text-5xl font-semibold text-neon">2m</div>
              <p className="text-sm leading-6 text-white/55">Mix, chill, and dispense with calibrated consistency.</p>
            </div>
            <div className="panel-strong flex min-h-[220px] flex-col justify-between p-6">
              <div className="eyebrow">Telemetry</div>
              <div className="text-5xl font-semibold text-neon">Live</div>
              <p className="text-sm leading-6 text-white/55">Monitor demand, stock, and sanitation from the admin layer.</p>
            </div>
          </div>
        </Reveal>
      </section>

      <section id="precision" className="grid-shell pt-16 sm:pt-24">
        <Reveal className="text-center">
          <div className="eyebrow">The process</div>
          <h2 className="mt-4 font-display text-3xl font-semibold text-white sm:text-4xl">Kinetic Precision</h2>
        </Reveal>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {precisionFeatures.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.08} className="panel-strong p-6">
              <feature.icon className="h-5 w-5 text-neon" />
              <div className="mt-4 text-xl font-semibold text-white">{feature.title}</div>
              <p className="mt-3 text-sm leading-6 text-white/55">{feature.description}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="launch" className="grid-shell pt-16 sm:pt-24">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal className="panel p-6 sm:p-8">
            <div className="eyebrow">Launching soon in premium gyms</div>
            <h2 className="mt-4 font-display text-3xl font-semibold text-white">Curated rollout footprint.</h2>
            <p className="mt-4 text-base leading-7 text-white/58">
              Launching first in premium fitness spaces where design, speed, and recovery quality matter as much as
              convenience.
            </p>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {launchCities.map((city, index) => (
              <Reveal key={city} delay={index * 0.08} className="panel-strong flex min-h-[180px] flex-col justify-between p-6">
                <div className="text-xs uppercase tracking-[0.3em] text-white/35">City {index + 1}</div>
                <div>
                  <div className="font-display text-3xl font-semibold text-white">{city}</div>
                  <div className="mt-3 text-sm text-neon">Premium gym shortlist active</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="grid-shell pt-16 sm:pt-24">
        <div className="grid gap-5 lg:grid-cols-2">
          {premiumNotes.map((note, index) => (
            <Reveal key={note.title} delay={index * 0.08} className="panel p-6 sm:p-8">
              <note.icon className="h-5 w-5 text-neon" />
              <div className="mt-4 font-display text-3xl font-semibold text-white">{note.title}</div>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/58">{note.copy}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="access" className="grid-shell pt-16 sm:pt-24">
        <Reveal className="panel-strong overflow-hidden px-6 py-10 text-center sm:px-10">
          <div className="eyebrow">Founding member access</div>
          <h2 className="mt-4 font-display text-4xl font-semibold text-white sm:text-5xl">Be first. Get access.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/58">
            Early members unlock launch pricing, priority flavor profiles, and the first machine networks inside
            premium gyms.
          </p>
          <div className="mx-auto mt-8 max-w-2xl">
            <WaitlistForm buttonLabel="Join Waitlist" />
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup" className="ghost-button">
              Create dashboard account
            </Link>
            <Link href="/login" className="neon-button">
              Member Login
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-white/40">
            <ScanLine className="h-4 w-4 text-neon" />
            Machine access, waitlist, and admin analytics in one codebase
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </main>
  );
}
