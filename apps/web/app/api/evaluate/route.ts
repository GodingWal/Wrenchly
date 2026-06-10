import { NextResponse } from "next/server";
import { DealInputSchema, type DealInput, type EngineOutput } from "@wrenchly/types";
import { evaluate } from "@wrenchly/engine";
import { buildPlaceholderContext } from "@/lib/market-context";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  // Persist when the user is authenticated; ignore (don't 500) on failure.
  let dealId: string | null = null;
  try {
    dealId = await persistDeal(input, result);
  } catch (err) {
    console.error("[evaluate] persist failed", err);
  }

  return NextResponse.json({
    input,
    result,
    contextSource: "placeholder",
    dealId,
  });
}

async function persistDeal(
  input: DealInput,
  result: EngineOutput,
): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Upsert vehicle. Dedupe by VIN if present, otherwise insert a new row.
  let vehicleId: string | null = null;
  if (input.vehicle.vin) {
    const { data: existing } = await supabase
      .from("vehicles")
      .select("id")
      .eq("vin", input.vehicle.vin)
      .maybeSingle();
    vehicleId = existing?.id ?? null;
  }

  if (!vehicleId) {
    const { data: inserted, error: vErr } = await supabase
      .from("vehicles")
      .insert({
        vin: input.vehicle.vin ?? null,
        year: input.vehicle.year,
        make: input.vehicle.make,
        model: input.vehicle.model,
        trim: input.vehicle.trim ?? null,
        engine: input.vehicle.engine ?? null,
        mileage: input.vehicle.mileage,
        title_status: input.vehicle.titleStatus,
      })
      .select("id")
      .single();
    if (vErr || !inserted) {
      throw new Error(`vehicle insert failed: ${vErr?.message}`);
    }
    vehicleId = inserted.id;
  }

  // 2. Insert deal.
  const { data: deal, error: dErr } = await supabase
    .from("deals")
    .insert({
      user_id: user.id,
      vehicle_id: vehicleId,
      asking_price: input.askingPrice,
      target_price: input.targetPrice ?? null,
      zip: input.zip,
      condition: input.condition,
      issues: input.issues,
      notes: input.notes ?? null,
      verdict: result.verdict,
      flip_profit_low: result.flip.netProfitLow,
      flip_profit_high: result.flip.netProfitHigh,
      parts_profit: result.parts.netProfit,
      walk_threshold: result.walkAwayPrice,
      engine_output: result,
    })
    .select("id")
    .single();

  if (dErr || !deal) {
    throw new Error(`deal insert failed: ${dErr?.message}`);
  }

  return deal.id;
}
