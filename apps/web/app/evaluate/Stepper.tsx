import { STEPS, type StepKey } from "./types";

export function Stepper({ current }: { current: StepKey }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((s, i) => {
        const state =
          i < currentIndex ? "done" : i === currentIndex ? "active" : "todo";
        return (
          <li key={s.key} className="flex flex-1 items-center gap-2">
            <span
              className={
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold " +
                (state === "active"
                  ? "bg-ink text-white"
                  : state === "done"
                    ? "bg-signal-go text-white"
                    : "bg-slate-200 text-slate-500")
              }
            >
              {i + 1}
            </span>
            <span
              className={
                "hidden text-sm font-medium sm:inline " +
                (state === "todo" ? "text-slate-400" : "text-ink")
              }
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <span
                className={
                  "h-px flex-1 " +
                  (state === "done" ? "bg-signal-go" : "bg-slate-200")
                }
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
