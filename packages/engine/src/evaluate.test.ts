import { describe, expect, it } from "vitest";
import type { DealInput } from "@wrenchly/types";
import { evaluate } from "./evaluate";
import type { MarketContext } from "./context";

const baseDeal: DealInput = {
  vehicle: {
    year: 2014,
    make: "Honda",
    model: "Civic",
    mileage: 110000,
    titleStatus: "clean",
  },
  condition: {
    body: "good",
    interior: "good",
    tires: "decent",
    glass: "intact",
    runs: "yes",
  },
  issues: [],
  askingPrice: 6000,
  zip: "55102",
};

const baseCtx: MarketContext = {
  retailMedian: 9500,
  retailSpread: 0.12,
  partsGross: 7000,
  reliabilityScore: 0.85,
  demandMultiplier: 1.0,
  repairCosts: {
    engine: 2500,
    transmission: 2200,
    electrical: 600,
    hvac: 700,
    brakes: 350,
    suspension: 500,
    exhaust: 250,
    cosmetic: 300,
  },
};

describe("evaluate", () => {
  it("flags an obvious good deal as FLIP", () => {
    const out = evaluate(baseDeal, baseCtx);
    expect(out.verdict).toBe("FLIP");
    expect(out.flip.netProfitLow).toBeGreaterThan(0);
    expect(out.walkAwayPrice).toBeGreaterThan(baseDeal.askingPrice);
  });

  it("flags an overpriced deal as WALK", () => {
    const out = evaluate({ ...baseDeal, askingPrice: 9000 }, baseCtx);
    expect(out.verdict).toBe("WALK");
  });

  it("returns a walk-away price below retail median", () => {
    const out = evaluate(baseDeal, baseCtx);
    const retailMid = (out.flip.retailValueLow + out.flip.retailValueHigh) / 2;
    expect(out.walkAwayPrice).toBeLessThan(retailMid);
  });

  it("favors PART when the car doesn't run and parts gross is high", () => {
    const out = evaluate(
      {
        ...baseDeal,
        askingPrice: 1200,
        condition: { ...baseDeal.condition, runs: "no" },
        issues: ["engine", "transmission"],
      },
      { ...baseCtx, partsGross: 9000 },
    );
    expect(["PART", "WALK"]).toContain(out.verdict);
  });
});
