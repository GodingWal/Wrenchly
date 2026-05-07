import { NextResponse } from "next/server";
import { z } from "zod";

const WaitlistSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  let payload: unknown;

  if (contentType.includes("application/json")) {
    payload = await req.json();
  } else {
    const form = await req.formData();
    payload = Object.fromEntries(form.entries());
  }

  const parsed = WaitlistSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid email" },
      { status: 400 },
    );
  }

  // TODO(phase-2): persist to supabase `waitlist` table.
  console.log("[waitlist]", parsed.data.email);

  return NextResponse.redirect(new URL("/?joined=1", req.url), 303);
}
