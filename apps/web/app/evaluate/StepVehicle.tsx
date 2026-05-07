"use client";

import { TitleStatus } from "@wrenchly/types";
import type { DealDraft } from "./types";

const TITLE_OPTIONS: { value: (typeof TitleStatus._def.values)[number]; label: string }[] = [
  { value: "clean", label: "Clean" },
  { value: "salvage", label: "Salvage" },
  { value: "rebuilt", label: "Rebuilt" },
  { value: "lien", label: "Lien" },
  { value: "parts_only", label: "Parts only" },
];

export function StepVehicle({
  draft,
  onChange,
}: {
  draft: DealDraft;
  onChange: (patch: Partial<DealDraft["vehicle"]>) => void;
}) {
  const v = draft.vehicle;
  return (
    <div className="space-y-4">
      <div>
        <Label>VIN (optional)</Label>
        <input
          type="text"
          maxLength={17}
          value={v.vin ?? ""}
          onChange={(e) => onChange({ vin: e.target.value.toUpperCase() || undefined })}
          placeholder="1HGCM82633A123456"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-slate-500">
          We&apos;ll auto-fill year/make/model from the VIN in Phase 3.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label>Year</Label>
          <input
            type="number"
            min={1980}
            max={2099}
            value={v.year ?? ""}
            onChange={(e) =>
              onChange({ year: e.target.value ? Number(e.target.value) : undefined })
            }
            className={inputClass}
          />
        </div>
        <div>
          <Label>Make</Label>
          <input
            type="text"
            value={v.make ?? ""}
            onChange={(e) => onChange({ make: e.target.value })}
            placeholder="Honda"
            className={inputClass}
          />
        </div>
        <div>
          <Label>Model</Label>
          <input
            type="text"
            value={v.model ?? ""}
            onChange={(e) => onChange({ model: e.target.value })}
            placeholder="Civic"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Trim (optional)</Label>
          <input
            type="text"
            value={v.trim ?? ""}
            onChange={(e) => onChange({ trim: e.target.value || undefined })}
            placeholder="EX"
            className={inputClass}
          />
        </div>
        <div>
          <Label>Engine (optional)</Label>
          <input
            type="text"
            value={v.engine ?? ""}
            onChange={(e) => onChange({ engine: e.target.value || undefined })}
            placeholder="1.8L I4"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Mileage</Label>
          <input
            type="number"
            min={0}
            value={v.mileage ?? ""}
            onChange={(e) =>
              onChange({ mileage: e.target.value ? Number(e.target.value) : undefined })
            }
            placeholder="110000"
            className={inputClass}
          />
        </div>
        <div>
          <Label>Title status</Label>
          <select
            value={v.titleStatus ?? ""}
            onChange={(e) =>
              onChange({ titleStatus: (e.target.value || undefined) as DealDraft["vehicle"]["titleStatus"] })
            }
            className={inputClass}
          >
            <option value="">Select…</option>
            {TITLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export function isVehicleStepValid(draft: DealDraft): boolean {
  const v = draft.vehicle;
  return Boolean(v.year && v.make && v.model && v.mileage !== undefined && v.titleStatus);
}

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base outline-none focus:border-signal-go focus:ring-2 focus:ring-signal-go/30";

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-ink">{children}</label>;
}
