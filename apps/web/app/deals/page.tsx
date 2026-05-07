import Link from "next/link";
import { redirect } from "next/navigation";
import type { Verdict } from "@wrenchly/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "My deals — Wrenchly",
};

type DealRow = {
  id: string;
  asking_price: number;
  verdict: Verdict;
  flip_profit_low: number | null;
  flip_profit_high: number | null;
  parts_profit: number | null;
  walk_threshold: number | null;
  created_at: string;
  vehicles: {
    year: number;
    make: string;
    model: string;
    trim: string | null;
    mileage: number;
  } | null;
};

export default async function DealsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?next=/deals");
  }

  const { data: deals, error } = await supabase
    .from("deals")
    .select(
      `id, asking_price, verdict, flip_profit_low, flip_profit_high,
       parts_profit, walk_threshold, created_at,
       vehicles ( year, make, model, trim, mileage )`,
    )
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<DealRow[]>();

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-2 sm:px-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">My deals</h1>
          <p className="mt-1 text-sm text-slate-500">
            Every car you&apos;ve evaluated.
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded-lg bg-signal-stop/10 px-3 py-2 text-sm text-signal-stop">
          Couldn&apos;t load deals: {error.message}
        </p>
      )}

      {!error && (!deals || deals.length === 0) ? (
        <EmptyState />
      ) : (
        <ul className="mt-6 space-y-3">
          {(deals ?? []).map((d) => (
            <li
              key={d.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-ink">
                    {d.vehicles
                      ? `${d.vehicles.year} ${d.vehicles.make} ${d.vehicles.model}${
                          d.vehicles.trim ? ` ${d.vehicles.trim}` : ""
                        }`
                      : "Vehicle"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {d.vehicles ? `${d.vehicles.mileage.toLocaleString()} mi · ` : ""}
                    Asking ${Number(d.asking_price).toLocaleString()} ·{" "}
                    {new Date(d.created_at).toLocaleDateString()}
                  </p>
                </div>
                <VerdictPill v={d.verdict} />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                <Stat
                  label="Flip"
                  value={
                    d.flip_profit_low != null && d.flip_profit_high != null
                      ? `$${fmt(Number(d.flip_profit_low))}–$${fmt(Number(d.flip_profit_high))}`
                      : "—"
                  }
                />
                <Stat
                  label="Parts"
                  value={
                    d.parts_profit != null
                      ? `$${fmt(Number(d.parts_profit))}`
                      : "—"
                  }
                />
                <Stat
                  label="Walk"
                  value={
                    d.walk_threshold != null
                      ? `$${fmt(Number(d.walk_threshold))}`
                      : "—"
                  }
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function EmptyState() {
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="text-base font-medium text-ink">No deals yet.</p>
      <p className="mt-1 text-sm text-slate-500">
        Run your first evaluation to start building your log.
      </p>
      <Link
        href="/evaluate"
        className="mt-4 inline-block rounded-lg bg-signal-go px-5 py-2.5 font-semibold text-white hover:brightness-95"
      >
        Run an evaluation
      </Link>
    </div>
  );
}

function VerdictPill({ v }: { v: Verdict }) {
  const styles: Record<Verdict, string> = {
    FLIP: "bg-signal-go/10 text-signal-go",
    MARGINAL: "bg-signal-warn/10 text-signal-warn",
    PART: "bg-signal-part/10 text-signal-part",
    WALK: "bg-signal-stop/10 text-signal-stop",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${styles[v]}`}
    >
      {v}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
      <p className="font-semibold text-ink">{value}</p>
    </div>
  );
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
