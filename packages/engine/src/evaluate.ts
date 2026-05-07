import type { DealInput, EngineOutput, Verdict } from "@wrenchly/types";
import type { MarketContext } from "./context";
import { calculateFlip } from "./flip";
import { calculatePartsOut } from "./parts";
import { calculateWalkAway } from "./walk";

const MIN_FLIP_PROFIT = 1000;
const MARGINAL_BAND = 500;

export function evaluate(
  input: DealInput,
  ctx: MarketContext,
): EngineOutput {
  const flip = calculateFlip(input, ctx);
  const parts = calculatePartsOut(input, ctx);
  const walkAwayPrice = calculateWalkAway(input, flip);

  const verdict = decideVerdict({
    flipMidProfit: (flip.netProfitLow + flip.netProfitHigh) / 2,
    partsProfit: parts.netProfit,
    askingPrice: input.askingPrice,
    walkAwayPrice,
  });

  const drivers = buildDrivers(input, flip, parts, verdict);
  const risks = buildRisks(input, ctx);
  const confidence = pickConfidence(input, ctx);

  return {
    verdict,
    flip,
    parts,
    walkAwayPrice,
    drivers,
    risks,
    confidence,
  };
}

function decideVerdict(args: {
  flipMidProfit: number;
  partsProfit: number;
  askingPrice: number;
  walkAwayPrice: number;
}): Verdict {
  const { flipMidProfit, partsProfit, askingPrice, walkAwayPrice } = args;

  if (askingPrice > walkAwayPrice && partsProfit < MIN_FLIP_PROFIT) {
    return "WALK";
  }
  if (partsProfit > flipMidProfit + MARGINAL_BAND) {
    return "PART";
  }
  if (flipMidProfit >= MIN_FLIP_PROFIT) {
    return "FLIP";
  }
  if (flipMidProfit > 0) {
    return "MARGINAL";
  }
  return "WALK";
}

function buildDrivers(
  input: DealInput,
  flip: ReturnType<typeof calculateFlip>,
  parts: ReturnType<typeof calculatePartsOut>,
  verdict: Verdict,
): string[] {
  const out: string[] = [];
  if (verdict === "FLIP" || verdict === "MARGINAL") {
    out.push(
      `Retail comps land between $${flip.retailValueLow.toLocaleString()} and $${flip.retailValueHigh.toLocaleString()}.`,
    );
    out.push(
      `Repair + recon estimated at $${(flip.repairCost + flip.reconCost).toLocaleString()}.`,
    );
  }
  if (verdict === "PART") {
    out.push(
      `Parts catalog totals $${parts.totalPartsValue.toLocaleString()} gross.`,
    );
    out.push(
      `Realistic recovery at ${(parts.liquidationFactor * 100).toFixed(0)}% beats flipping by $${(parts.netProfit - (flip.netProfitLow + flip.netProfitHigh) / 2).toLocaleString()}.`,
    );
  }
  if (verdict === "WALK") {
    out.push(
      `Asking price exceeds the walk-away threshold by $${(input.askingPrice - flip.retailValueLow + flip.repairCost).toLocaleString()}.`,
    );
  }
  return out.slice(0, 3);
}

function buildRisks(input: DealInput, ctx: MarketContext): string[] {
  const risks: string[] = [];
  if (input.condition.runs !== "yes") {
    risks.push("Vehicle does not run reliably — diagnostic cost is unknown.");
  }
  if (input.issues.includes("transmission")) {
    risks.push("Transmission issues can blow up the budget by $1.5–4k.");
  }
  if (input.issues.includes("engine")) {
    risks.push("Engine issues are the #1 cause of flip losses.");
  }
  if (input.vehicle.titleStatus !== "clean") {
    risks.push(
      `Title is ${input.vehicle.titleStatus} — discount the retail estimate by 20–35%.`,
    );
  }
  if (ctx.reliabilityScore < 0.5) {
    risks.push("Model has below-average reliability; expect longer days-to-sell.");
  }
  return risks.slice(0, 3);
}

function pickConfidence(
  input: DealInput,
  ctx: MarketContext,
): "low" | "medium" | "high" {
  if (!ctx.retailMedian || !ctx.partsGross) return "low";
  if (input.issues.length > 4) return "low";
  if (input.condition.runs !== "yes") return "medium";
  return "high";
}
