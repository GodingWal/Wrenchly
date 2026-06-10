"use client";

import Link from "next/link";
import type { EngineOutput, Verdict as VerdictKey } from "@wrenchly/types";

const VERDICT_META: Record<
  VerdictKey,
  { label: string; sub: string; bg: string; text: string; ring: string }
> = {
  FLIP: {
    label: "FLIP IT",
    sub: "The math works. Make an offer.",
    bg: "bg-signal-go",
    text: "text-white",
    ring: "ring-signal-go/30",
  },
  MARGINAL: {
    label: "MARGINAL",
    sub: "Thin margin. Only proceed if you can do the work yourself.",
    bg: "bg-signal-warn",
    text: "text-white",
    ring: "ring-signal-warn/30",
  },
  PART: {
    label: "PART IT",
    sub: "Parting beats flipping for this one.",
    bg: "bg-signal-part",
    text: "text-white",
    ring: "ring-signal-part/30",
  },
  WALK: {
    label: "WALK AWAY",
    sub: "The numbers don't work at this price.",
    bg: "bg-signal-stop",
    text: "text-white",
    ring: "ring-signal-stop/30",
  },
};

export function Verdict({
  result,
  askingPrice,
  dealId,
  onReset,
}: {
  result: EngineOutput;
  askingPrice: number;
  dealId: string | null;
  onReset: () => void;
}) {
  const meta = VERDICT_META[result.verdict];
  const flipMid = (result.flip.netProfitLow + result.flip.netProfitHigh) / 2;
  const roiMid = ((result.flip.roiLow + result.flip.roiHigh) / 2) * 100;

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl p-8 text-center shadow-lg ring-8 ${meta.bg} ${meta.text} ${meta.ring}`}>
        <p className="text-sm font-semibold uppercase tracking-widest opacity-80">
          Verdict · confidence: {result.confidence}
        </p>
        <h1 className="mt-2 text-5xl font-extrabold tracking-tight sm:text-6xl">
          {meta.label}
        </h1>
        <p className="mt-3 text-base sm:text-lg">{meta.sub}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card title="Flip path" tone="go">
          <Money
            label="Profit range"
            value={`$${fmt(result.flip.netProfitLow)} – $${fmt(result.flip.netProfitHigh)}`}
          />
          <Stat label="ROI" value={`${roiMid.toFixed(0)}%`} />
          <Stat label="Days to sell" value={`${result.flip.daysToSell}d`} />
          <hr className="my-2 border-slate-200" />
          <Stat label="Retail comps" value={`$${fmt(result.flip.retailValueLow)}–$${fmt(result.flip.retailValueHigh)}`} small />
          <Stat label="Repair + recon" value={`$${fmt(result.flip.repairCost + result.flip.reconCost)}`} small />
        </Card>

        <Card title="Parts path" tone="part">
          <Money label="Net profit" value={`$${fmt(result.parts.netProfit)}`} />
          <Stat label="Realized" value={`$${fmt(result.parts.realizedValue)}`} />
          <Stat label="Weeks to liquidate" value={`${result.parts.weeksToLiquidate}w`} />
          <hr className="my-2 border-slate-200" />
          <Stat label="Catalog gross" value={`$${fmt(result.parts.totalPartsValue)}`} small />
          <Stat
            label="Recovery factor"
            value={`${(result.parts.liquidationFactor * 100).toFixed(0)}%`}
            small
          />
        </Card>

        <Card title="Walk-away" tone="stop">
          <Money label="Max viable price" value={`$${fmt(result.walkAwayPrice)}`} />
          <Stat label="Asking price" value={`$${fmt(askingPrice)}`} />
          <Stat
            label="Headroom"
            value={
              askingPrice <= result.walkAwayPrice
                ? `+$${fmt(result.walkAwayPrice - askingPrice)}`
                : `-$${fmt(askingPrice - result.walkAwayPrice)}`
            }
          />
          <hr className="my-2 border-slate-200" />
          <p className="text-xs text-slate-500">
            Pay this or less to keep a 20% margin after repairs and fees.
          </p>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ListCard title="What's driving this" items={result.drivers} tone="go" />
        <ListCard title="Risks & unknowns" items={result.risks} tone="stop" />
      </div>

      {dealId ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-signal-go/30 bg-signal-go/5 p-4 text-sm">
          <span className="text-ink">
            <span className="font-semibold text-signal-go">Saved</span> to your
            deal log.
          </span>
          <div className="flex gap-2">
            <Link
              href="/deals"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-ink hover:border-slate-400"
            >
              View deals
            </Link>
            <button
              type="button"
              onClick={onReset}
              className="rounded-lg bg-ink px-4 py-2 font-semibold text-white hover:bg-ink-soft"
            >
              New evaluation
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <span className="text-slate-700">
            <span className="font-semibold text-ink">Sign in</span> to save this
            evaluation to your log.
          </span>
          <div className="flex gap-2">
            <Link
              href="/sign-in?next=/deals"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-ink hover:border-slate-400"
            >
              Sign in
            </Link>
            <button
              type="button"
              onClick={onReset}
              className="rounded-lg bg-ink px-4 py-2 font-semibold text-white hover:bg-ink-soft"
            >
              New evaluation
            </button>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-slate-500">
        Numbers based on placeholder market data. Live comps and repair pricing arrive in Phase 3.
      </p>
    </div>
  );
}

function Card({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "go" | "part" | "stop";
  children: React.ReactNode;
}) {
  const accent = {
    go: "border-signal-go/30",
    part: "border-signal-part/30",
    stop: "border-signal-stop/30",
  }[tone];
  return (
    <div className={`rounded-2xl border bg-white p-5 ${accent}`}>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </h2>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}

function Money({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}

function Stat({
  label,
  value,
  small,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={small ? "text-xs text-slate-500" : "text-sm text-slate-600"}>
        {label}
      </span>
      <span className={small ? "text-xs font-medium text-ink" : "text-sm font-semibold text-ink"}>
        {value}
      </span>
    </div>
  );
}

function ListCard({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "go" | "stop";
}) {
  const dot = tone === "go" ? "bg-signal-go" : "bg-signal-stop";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">None flagged.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((line, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink">
              <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
