import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="grid-shell pb-8 pt-14">
      <div className="panel flex flex-col gap-5 px-5 py-5 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <BrandMark caption="Premium gym launch network" />
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/login" className="transition hover:text-white">
            Member Login
          </Link>
          <Link href="/signup" className="transition hover:text-white">
            Create Account
          </Link>
          <span>Premium gyms launch 2026</span>
        </div>
      </div>
    </footer>
  );
}
