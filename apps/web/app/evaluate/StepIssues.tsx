"use client";

import type { IssueKey } from "@wrenchly/types";
import type { DealDraft } from "./types";

const ISSUES: { key: IssueKey; label: string }[] = [
  { key: "engine", label: "Engine" },
  { key: "transmission", label: "Transmission" },
  { key: "electrical", label: "Electrical" },
  { key: "hvac", label: "AC / heat" },
  { key: "brakes", label: "Brakes" },
  { key: "suspension", label: "Suspension" },
  { key: "exhaust", label: "Exhaust" },
  { key: "cosmetic", label: "Cosmetic" },
];

export function StepIssues({
  draft,
  onIssuesChange,
  onNotesChange,
}: {
  draft: DealDraft;
  onIssuesChange: (next: IssueKey[]) => void;
  onNotesChange: (next: string) => void;
}) {
  function toggle(key: IssueKey) {
    const set = new Set(draft.issues);
    if (set.has(key)) set.delete(key);
    else set.add(key);
    onIssuesChange(Array.from(set));
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium text-ink">Known issues</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ISSUES.map((i) => {
            const active = draft.issues.includes(i.key);
            return (
              <button
                type="button"
                key={i.key}
                onClick={() => toggle(i.key)}
                className={
                  "rounded-lg border px-3 py-2 text-sm font-medium transition " +
                  (active
                    ? "border-signal-stop bg-signal-stop/10 text-signal-stop"
                    : "border-slate-300 bg-white text-slate-700 hover:border-slate-400")
                }
              >
                {i.label}
              </button>
            );
          })}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Tap each problem you can confirm. Be honest — over-claiming kills the math.
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-ink">Notes (optional)</label>
        <textarea
          value={draft.notes ?? ""}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Anything specific — e.g. 'transmission slips at highway speed', 'recent tires', 'one owner'"
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base outline-none focus:border-signal-go focus:ring-2 focus:ring-signal-go/30"
        />
      </div>
    </div>
  );
}

export function isIssuesStepValid(): boolean {
  return true; // issues are optional
}
