import type { DealInput, IssueKey } from "@wrenchly/types";
import type { MarketContext } from "@wrenchly/engine";

/**
 * Placeholder MarketContext for Phase 1.
 *
 * Real numbers land in Phase 3 when comp / repair APIs are wired up. Until
 * then, we synthesize a defensible starting point from the deal inputs so the
 * verdict screen has something real to render.
 */
export function buildPlaceholderContext(input: DealInput): MarketContext {
  const retailMedian = estimateRetailMedian(input);
  const partsGross = retailMedian * 0.7;
  const reliabilityScore = guessReliability(input.vehicle.make);
  const demandMultiplier = 1.0;

  // Title penalty — branded titles drag retail.
  const titleAdjusted =
    input.vehicle.titleStatus === "salvage"
      ? retailMedian * 0.6
      : input.vehicle.titleStatus === "rebuilt"
        ? retailMedian * 0.75
        : input.vehicle.titleStatus === "parts_only"
          ? retailMedian * 0.4
          : retailMedian;

  return {
    retailMedian: Math.round(titleAdjusted),
    retailSpread: 0.12,
    partsGross: Math.round(partsGross),
    reliabilityScore,
    demandMultiplier,
    repairCosts: REPAIR_COST_DEFAULTS,
  };
}

/**
 * Crude depreciation curve. New-ish cars depreciate ~15%/yr for the first 5
 * years, then slower. Mileage above 12k/yr knocks more value off.
 */
function estimateRetailMedian(input: DealInput): number {
  const { year, mileage } = input.vehicle;
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - year);

  // Anchor MSRP guess (very rough; will be replaced by KBB-style lookup later).
  const anchorMsrp = 28000;

  const ageFactor = Math.pow(0.85, Math.min(age, 5)) * Math.pow(0.93, Math.max(0, age - 5));
  const expectedMileage = age * 12000;
  const mileageDelta = mileage - expectedMileage;
  // ~$0.08 per excess mile, half-rate credit for low miles.
  const mileageAdjustment = mileageDelta > 0 ? -mileageDelta * 0.08 : -mileageDelta * 0.04;

  const value = anchorMsrp * ageFactor + mileageAdjustment;
  return Math.max(800, Math.round(value));
}

const RELIABILITY_BY_MAKE: Record<string, number> = {
  toyota: 0.92,
  lexus: 0.92,
  honda: 0.9,
  acura: 0.85,
  mazda: 0.85,
  subaru: 0.78,
  hyundai: 0.75,
  kia: 0.75,
  nissan: 0.7,
  ford: 0.65,
  chevrolet: 0.65,
  gmc: 0.65,
  ram: 0.6,
  jeep: 0.55,
  dodge: 0.55,
  bmw: 0.5,
  mercedes: 0.5,
  audi: 0.5,
  volkswagen: 0.55,
  cadillac: 0.55,
  chrysler: 0.5,
};

function guessReliability(make: string): number {
  return RELIABILITY_BY_MAKE[make.toLowerCase()] ?? 0.7;
}

const REPAIR_COST_DEFAULTS: Record<IssueKey, number> = {
  engine: 2800,
  transmission: 2500,
  electrical: 600,
  hvac: 800,
  brakes: 400,
  suspension: 600,
  exhaust: 350,
  cosmetic: 400,
};
