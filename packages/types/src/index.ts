import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Vehicle identity                                                    */
/* ------------------------------------------------------------------ */

export const TitleStatus = z.enum([
  "clean",
  "salvage",
  "rebuilt",
  "lien",
  "parts_only",
]);
export type TitleStatus = z.infer<typeof TitleStatus>;

export const VehicleSchema = z.object({
  vin: z.string().length(17).optional(),
  year: z.number().int().min(1980).max(2100),
  make: z.string().min(1),
  model: z.string().min(1),
  trim: z.string().optional(),
  engine: z.string().optional(),
  mileage: z.number().int().min(0),
  titleStatus: TitleStatus,
});
export type Vehicle = z.infer<typeof VehicleSchema>;

/* ------------------------------------------------------------------ */
/* Condition                                                           */
/* ------------------------------------------------------------------ */

export const BodyCondition = z.enum([
  "excellent",
  "good",
  "dented",
  "rusty",
  "wrecked",
]);
export const InteriorCondition = z.enum([
  "excellent",
  "good",
  "worn",
  "trashed",
]);
export const TireCondition = z.enum(["new", "decent", "bald"]);
export const GlassCondition = z.enum(["intact", "cracked", "shattered"]);
export const RunStatus = z.enum(["yes", "starts_only", "no"]);

export const ConditionSchema = z.object({
  body: BodyCondition,
  interior: InteriorCondition,
  tires: TireCondition,
  glass: GlassCondition,
  runs: RunStatus,
});
export type Condition = z.infer<typeof ConditionSchema>;

/* ------------------------------------------------------------------ */
/* Issues                                                              */
/* ------------------------------------------------------------------ */

export const IssueKey = z.enum([
  "engine",
  "transmission",
  "electrical",
  "hvac",
  "brakes",
  "suspension",
  "exhaust",
  "cosmetic",
]);
export type IssueKey = z.infer<typeof IssueKey>;

/* ------------------------------------------------------------------ */
/* Deal input                                                          */
/* ------------------------------------------------------------------ */

export const DealInputSchema = z.object({
  vehicle: VehicleSchema,
  condition: ConditionSchema,
  issues: z.array(IssueKey).default([]),
  notes: z.string().max(2000).optional(),
  askingPrice: z.number().nonnegative(),
  targetPrice: z.number().nonnegative().optional(),
  zip: z.string().regex(/^\d{5}$/),
});
export type DealInput = z.infer<typeof DealInputSchema>;

/* ------------------------------------------------------------------ */
/* Engine output                                                       */
/* ------------------------------------------------------------------ */

export const Verdict = z.enum(["FLIP", "MARGINAL", "PART", "WALK"]);
export type Verdict = z.infer<typeof Verdict>;

export interface FlipResult {
  retailValueLow: number;
  retailValueHigh: number;
  repairCost: number;
  reconCost: number;
  fees: number;
  netProfitLow: number;
  netProfitHigh: number;
  roiLow: number;
  roiHigh: number;
  daysToSell: number;
}

export interface PartsResult {
  totalPartsValue: number;
  liquidationFactor: number;
  realizedValue: number;
  laborCost: number;
  netProfit: number;
  weeksToLiquidate: number;
}

export interface EngineOutput {
  verdict: Verdict;
  flip: FlipResult;
  parts: PartsResult;
  walkAwayPrice: number;
  drivers: string[]; // top reasons behind verdict
  risks: string[]; // top unknowns / risks
  confidence: "low" | "medium" | "high";
}
