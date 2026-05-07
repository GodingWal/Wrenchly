import type { DealInput, FlipResult } from "@wrenchly/types";
import type { MarketContext } from "./context";

const TRANSACTION_FEE_RATE = 0.05; // title, registration, listing fees, sales loss
const FLOOR_RECON = 250;

const RECON_FROM_CONDITION: Record<string, number> = {
  excellent: 100,
  good: 250,
  dented: 800,
  rusty: 600,
  worn: 400,
  trashed: 1500,
  bald: 600,
  cracked: 300,
  shattered: 900,
  starts_only: 1500,
  no: 3500,
};

function reconCost(input: DealInput): number {
  const c = input.condition;
  const sum =
    (RECON_FROM_CONDITION[c.body] ?? 0) +
    (RECON_FROM_CONDITION[c.interior] ?? 0) +
    (RECON_FROM_CONDITION[c.tires] ?? 0) +
    (RECON_FROM_CONDITION[c.glass] ?? 0) +
    (RECON_FROM_CONDITION[c.runs] ?? 0);
  return Math.max(FLOOR_RECON, sum);
}

function repairTotal(input: DealInput, ctx: MarketContext): number {
  return input.issues.reduce(
    (sum, key) => sum + (ctx.repairCosts[key] ?? 0),
    0,
  );
}

export function calculateFlip(
  input: DealInput,
  ctx: MarketContext,
): FlipResult {
  const retailMid = ctx.retailMedian * ctx.demandMultiplier;
  const retailValueLow = retailMid * (1 - ctx.retailSpread);
  const retailValueHigh = retailMid * (1 + ctx.retailSpread);

  const repair = repairTotal(input, ctx);
  const recon = reconCost(input);
  const fees = (input.askingPrice + retailMid) * TRANSACTION_FEE_RATE * 0.5;

  const totalCost = input.askingPrice + repair + recon + fees;
  const netProfitLow = retailValueLow - totalCost;
  const netProfitHigh = retailValueHigh - totalCost;

  const roiLow = totalCost > 0 ? netProfitLow / totalCost : 0;
  const roiHigh = totalCost > 0 ? netProfitHigh / totalCost : 0;

  // Days-to-sell: faster for reliable models in high-demand regions.
  const baseDays = 45;
  const daysToSell = Math.round(
    baseDays / Math.max(0.5, ctx.reliabilityScore * ctx.demandMultiplier),
  );

  return {
    retailValueLow: round(retailValueLow),
    retailValueHigh: round(retailValueHigh),
    repairCost: round(repair),
    reconCost: round(recon),
    fees: round(fees),
    netProfitLow: round(netProfitLow),
    netProfitHigh: round(netProfitHigh),
    roiLow: round2(roiLow),
    roiHigh: round2(roiHigh),
    daysToSell,
  };
}

const round = (n: number) => Math.round(n);
const round2 = (n: number) => Math.round(n * 100) / 100;
