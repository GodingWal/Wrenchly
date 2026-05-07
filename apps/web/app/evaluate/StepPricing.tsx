"use client";

import type { DealDraft } from "./types";

export function StepPricing({
  draft,
  onChange,
}: {
  draft: DealDraft;
  onChange: (patch: Partial<Pick<DealDraft, "askingPrice" | "targetPrice" | "zip">>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-ink">Asking price (USD)</label>
        <input
          type="number"
          min={0}
          value={draft.askingPrice ?? ""}
          onChange={(e) =>
            onChange({ askingPrice: e.target.value ? Number(e.target.value) : undefined })
          }
          placeholder="6000"
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-ink">
          Your target buy price (optional)
        </label>
        <input
          type="number"
          min={0}
          value={draft.targetPrice ?? ""}
          onChange={(e) =>
            onChange({ targetPrice: e.target.value ? Number(e.target.value) : undefined })
          }
          placeholder="5000"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-slate-500">
          We&apos;ll show how your target compares to the walk-away threshold.
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-ink">Your ZIP code</label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={5}
          value={draft.zip ?? ""}
          onChange={(e) => onChange({ zip: e.target.value.replace(/\D/g, "") })}
          placeholder="55102"
          className={inputClass}
        />
      </div>
    </div>
  );
}

export function isPricingStepValid(draft: DealDraft): boolean {
  return Boolean(
    draft.askingPrice !== undefined &&
      draft.askingPrice >= 0 &&
      draft.zip &&
      /^\d{5}$/.test(draft.zip),
  );
}

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base outline-none focus:border-signal-go focus:ring-2 focus:ring-signal-go/30";
