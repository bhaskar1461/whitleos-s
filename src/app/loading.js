export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian px-6">
      <div className="panel flex w-full max-w-md flex-col items-center gap-4 px-8 py-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-neon/25 bg-neon/10 text-lg font-semibold text-neon animate-pulseLine">
          W
        </div>
        <div className="font-display text-2xl font-semibold text-white">Loading Whiteloo</div>
        <div className="max-w-sm text-sm leading-6 text-white/50">
          Calibrating the launch interface, machine visuals, and member access layers.
        </div>
      </div>
    </div>
  );
}
