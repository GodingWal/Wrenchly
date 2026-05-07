/**
 * Market context the engine needs to compute a verdict.
 *
 * In Phase 1 the caller can pass placeholder values (or values pasted by the
 * user from local listings). In Phase 3 these come from comp/repair APIs.
 */
export interface MarketContext {
  /** Median local retail for this year/make/model/mileage band, USD. */
  retailMedian: number;
  /** Width of the retail band as a fraction of the median (e.g. 0.12 → ±12%). */
  retailSpread: number;
  /** Estimated parts-out gross value (sum of common-parts retail), USD. */
  partsGross: number;
  /** Reliability score 0–1; higher = faster sell, narrower band. */
  reliabilityScore: number;
  /** Regional demand multiplier, 1.0 = neutral. */
  demandMultiplier: number;
  /** Repair-cost lookup keyed by IssueKey, USD. */
  repairCosts: Record<string, number>;
}
