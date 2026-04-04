import Link from "next/link";

export function BrandMark({ href = "/", caption = "Automated protein rituals" }) {
  return (
    <Link href={href} className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold tracking-[0.3em] text-neon shadow-neon">
        W
      </div>
      <div>
        <div className="font-display text-lg font-semibold tracking-tight text-white">Whiteloo</div>
        <div className="text-[10px] uppercase tracking-[0.34em] text-white/40">{caption}</div>
      </div>
    </Link>
  );
}
