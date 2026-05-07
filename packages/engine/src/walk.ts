import type { DealInput, FlipResult } from "@wrenchly/types";

const TARGET_MARGIN = 0.20; // minimum acceptable margin on a flip

/**
 * Highest price at which the deal still hits the target margin.
 * Below this number, the math works; above it, walk away.
 */
export function calculateWalkAway(
  input: DealInput,
  flip: FlipResult,
): number {
  const retailMid = (flip.retailValueLow + flip.retailValueHigh) / 2;
  const requiredHeadroom = retailMid * TARGET_MARGIN;
  const fixedCosts = flip.repairCost + flip.reconCost + flip.fees;
  const walk = retailMid - requiredHeadroom - fixedCosts;
  return Math.max(0, Math.round(walk));
}
