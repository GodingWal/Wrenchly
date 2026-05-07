import Image from "next/image";
import Link from "next/link";
import { AuthNav } from "@/components/AuthNav";

export default function DealsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/">
          <Image
            src="/brand/wrenchly-wordmark.svg"
            alt="Wrenchly"
            width={150}
            height={30}
            priority
          />
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/evaluate"
            className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink-soft"
          >
            New evaluation
          </Link>
          <AuthNav />
        </div>
      </header>
      {children}
    </div>
  );
}
