import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Image
          src="/brand/wrenchly-wordmark.svg"
          alt="Wrenchly"
          width={180}
          height={36}
          priority
        />
        <nav className="flex items-center gap-6 text-sm font-medium text-ink">
          <a href="#how" className="hover:text-signal-go">
            How it works
          </a>
          <Link href="/evaluate" className="hover:text-signal-go">
            Try it
          </Link>
          <Link
            href="/evaluate"
            className="rounded-lg bg-ink px-4 py-2 text-white hover:bg-ink-soft"
          >
            Run an evaluation
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-24 pt-16 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-signal-go">
          For car flippers and small dealers
        </p>
        <h1 className="text-balance text-5xl font-bold leading-tight tracking-tight text-ink sm:text-6xl">
          Should you flip it,
          <br />
          part it, or walk?
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          Wrenchly turns any used-car listing into a verdict in under two
          minutes. Enter the VIN, condition, and asking price — get back a
          profit range, a parts-out estimate, and the price you should walk away
          at.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/evaluate"
            className="rounded-lg bg-signal-go px-6 py-3 text-base font-semibold text-white shadow-sm hover:brightness-95"
          >
            Run an evaluation
          </Link>
          <a
            href="#waitlist"
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-ink hover:border-slate-400"
          >
            Join waitlist
          </a>
        </div>

        <form
          id="waitlist"
          action="/api/waitlist"
          method="post"
          className="mx-auto mt-10 flex max-w-md gap-2"
        >
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-base outline-none focus:border-signal-go focus:ring-2 focus:ring-signal-go/30"
          />
          <button
            type="submit"
            className="rounded-lg bg-signal-go px-5 py-3 font-semibold text-white shadow-sm hover:brightness-95"
          >
            Join waitlist
          </button>
        </form>

        <p className="mt-3 text-xs text-slate-500">
          We&apos;ll email you when the MVP is ready. No spam.
        </p>
      </section>

      <section id="how" className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-3">
          <Card
            tone="go"
            title="Flip path"
            body="Projected profit range, ROI, and days to sell — based on local comps and your buy price."
          />
          <Card
            tone="part"
            title="Parts path"
            body="What the car is worth piece-by-piece. When parts beat flipping, Wrenchly tells you."
          />
          <Card
            tone="stop"
            title="Walk-away threshold"
            body="The exact dollar amount where the math stops working. Bring it to the negotiation."
          />
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-sm text-slate-500">
        &copy; {new Date().getFullYear()} Wrenchly. Built for the lot.
      </footer>
    </main>
  );
}

function Card({
  tone,
  title,
  body,
}: {
  tone: "go" | "part" | "stop";
  title: string;
  body: string;
}) {
  const accent = {
    go: "border-signal-go/30 bg-signal-go/5",
    part: "border-signal-part/30 bg-signal-part/5",
    stop: "border-signal-stop/30 bg-signal-stop/5",
  }[tone];
  return (
    <div className={`rounded-2xl border p-6 ${accent}`}>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{body}</p>
    </div>
  );
}
