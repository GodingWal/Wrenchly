import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignInForm } from "./SignInForm";

export const metadata = {
  title: "Sign in — Wrenchly",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; sent?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(params.next ?? "/deals");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
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
      </header>

      <section className="mx-auto max-w-md px-4 pb-16 pt-8 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <h1 className="text-2xl font-bold text-ink">Sign in to Wrenchly</h1>
          <p className="mt-1 text-sm text-slate-500">
            We&apos;ll email you a magic link. No password.
          </p>

          {params.sent === "1" ? (
            <div className="mt-6 rounded-lg bg-signal-go/10 p-4 text-sm text-ink">
              Check your inbox for a sign-in link. You can close this tab.
            </div>
          ) : (
            <div className="mt-6">
              <SignInForm next={params.next} />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
