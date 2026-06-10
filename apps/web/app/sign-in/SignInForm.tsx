"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignInForm({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback${
      next ? `?next=${encodeURIComponent(next)}` : ""
    }`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }

    router.push(`/sign-in?sent=1${next ? `&next=${encodeURIComponent(next)}` : ""}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="text-sm font-medium text-ink" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base outline-none focus:border-signal-go focus:ring-2 focus:ring-signal-go/30"
      />
      {error && (
        <p className="rounded-lg bg-signal-stop/10 px-3 py-2 text-sm text-signal-stop">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting || !email}
        className="w-full rounded-lg bg-ink px-5 py-2.5 font-semibold text-white hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? "Sending…" : "Send magic link"}
      </button>
    </form>
  );
}
