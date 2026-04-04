export function formatDate(value: string | null | undefined) {
  if (!value) return "Pending";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatNumber(value: number | string | null | undefined) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function clampNumber(value: string, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}
