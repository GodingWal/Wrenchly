import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function AuthNav() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Link
        href="/sign-in"
        className="text-sm font-medium text-slate-600 hover:text-ink"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/deals"
        className="text-sm font-medium text-slate-600 hover:text-ink"
      >
        My deals
      </Link>
      <span className="hidden text-sm text-slate-400 sm:inline" title={user.email ?? undefined}>
        {user.email}
      </span>
      <form action="/auth/sign-out" method="post">
        <button
          type="submit"
          className="text-sm font-medium text-slate-500 hover:text-signal-stop"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
