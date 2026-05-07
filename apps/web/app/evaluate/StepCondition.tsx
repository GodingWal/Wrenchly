"use client";

import type { DealDraft } from "./types";

type ConditionField = keyof NonNullable<DealDraft["condition"]>;

const GROUPS: {
  field: ConditionField;
  label: string;
  options: { value: string; label: string }[];
}[] = [
  {
    field: "body",
    label: "Body",
    options: [
      { value: "excellent", label: "Excellent" },
      { value: "good", label: "Good" },
      { value: "dented", label: "Dented" },
      { value: "rusty", label: "Rusty" },
      { value: "wrecked", label: "Wrecked" },
    ],
  },
  {
    field: "interior",
    label: "Interior",
    options: [
      { value: "excellent", label: "Excellent" },
      { value: "good", label: "Good" },
      { value: "worn", label: "Worn" },
      { value: "trashed", label: "Trashed" },
    ],
  },
  {
    field: "tires",
    label: "Tires",
    options: [
      { value: "new", label: "New" },
      { value: "decent", label: "Decent" },
      { value: "bald", label: "Bald" },
    ],
  },
  {
    field: "glass",
    label: "Glass",
    options: [
      { value: "intact", label: "Intact" },
      { value: "cracked", label: "Cracked" },
      { value: "shattered", label: "Shattered" },
    ],
  },
  {
    field: "runs",
    label: "Runs & drives",
    options: [
      { value: "yes", label: "Yes" },
      { value: "starts_only", label: "Starts only" },
      { value: "no", label: "No" },
    ],
  },
];

export function StepCondition({
  draft,
  onChange,
}: {
  draft: DealDraft;
  onChange: (patch: Partial<DealDraft["condition"]>) => void;
}) {
  return (
    <div className="space-y-5">
      {GROUPS.map((g) => (
        <div key={g.field}>
          <p className="mb-2 text-sm font-medium text-ink">{g.label}</p>
          <div className="flex flex-wrap gap-2">
            {g.options.map((o) => {
              const active = draft.condition?.[g.field] === o.value;
              return (
                <button
                  type="button"
                  key={o.value}
                  onClick={() => onChange({ [g.field]: o.value } as Partial<DealDraft["condition"]>)}
                  className={
                    "rounded-full border px-4 py-2 text-sm font-medium transition " +
                    (active
                      ? "border-signal-go bg-signal-go/10 text-signal-go"
                      : "border-slate-300 bg-white text-slate-700 hover:border-slate-400")
                  }
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function isConditionStepValid(draft: DealDraft): boolean {
  const c = draft.condition ?? {};
  return Boolean(c.body && c.interior && c.tires && c.glass && c.runs);
}
