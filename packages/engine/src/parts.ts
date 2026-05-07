import type { DealInput, PartsResult } from "@wrenchly/types";
import type { MarketContext } from "./context";

const LIQUIDATION_FACTOR_BASE = 0.4; // realistic share of catalog value you actually realize
const LABOR_PER_HOUR = 35;
const HOURS_TO_PART_OUT = 18;

export function calculatePartsOut(
  input: DealInput,
  ctx: MarketContext,
): PartsResult {
  // If the car runs and is intact, parts-out is less attractive than flipping
  // because pulling parts destroys the running-vehicle premium.
  const runsPenalty = input.condition.runs === "yes" ? 0.85 : 1;
  const liquidationFactor = LIQUIDATION_FACTOR_BASE * runsPenalty;

  const realizedValue = ctx.partsGross * liquidationFactor;
  const laborCost = HOURS_TO_PART_OUT * LABOR_PER_HOUR;

  const netProfit = realizedValue - input.askingPrice - laborCost;

  // Parting out is slow: depends on how niche the parts market is.
  const weeksToLiquidate = Math.round(8 / Math.max(0.5, ctx.demandMultiplier));

  return {
    totalPartsValue: Math.round(ctx.partsGross),
    liquidationFactor: Math.round(liquidationFactor * 100) / 100,
    realizedValue: Math.round(realizedValue),
    laborCost: Math.round(laborCost),
    netProfit: Math.round(netProfit),
    weeksToLiquidate,
  };
}
