import { NextResponse } from "next/server";
import { DealInputSchema } from "@wrenchly/types";
import { evaluate } from "@wrenchly/engine";
import { buildPlaceholderContext } from "@/lib/market-context";

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = DealInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid deal input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const ctx = buildPlaceholderContext(input);
  const result = evaluate(input, ctx);

  return NextResponse.json({ input, result, contextSource: "placeholder" });
}
