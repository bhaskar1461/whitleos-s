import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

const navLinks = [
  { label: "Precision", href: "#precision" },
  { label: "Process", href: "#process" },
  { label: "Launch", href: "#launch" },
  { label: "Access", href: "#access" },
];

export function SiteHeader() {
  return (
    <header className="grid-shell pt-5 sm:pt-7">
      <div className="panel flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <BrandMark />
        <nav className="hidden items-center gap-6 text-sm text-white/60 lg:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="ghost-button hidden xl:inline-flex">
            Workspace
          </Link>
          <Link href="/login" className="ghost-button hidden sm:inline-flex">
            Login
          </Link>
          <Link href="/signup" className="neon-button">
            Join Waitlist
          </Link>
        </div>
      </div>
    </header>
  );
}
