import type { DealInput, EngineOutput } from "@wrenchly/types";

export type DealDraft = {
  vehicle: Partial<DealInput["vehicle"]>;
  condition: Partial<DealInput["condition"]>;
  issues: DealInput["issues"];
  notes?: string;
  askingPrice?: number;
  targetPrice?: number;
  zip?: string;
};

export type StepKey = "vehicle" | "condition" | "issues" | "pricing";

export const STEPS: { key: StepKey; label: string }[] = [
  { key: "vehicle", label: "Vehicle" },
  { key: "condition", label: "Condition" },
  { key: "issues", label: "Issues" },
  { key: "pricing", label: "Pricing" },
];

export type EvaluateResponse = {
  input: DealInput;
  result: EngineOutput;
  contextSource: "placeholder" | "live";
  /** Set when the deal was persisted (i.e. the user was signed in). */
  dealId: string | null;
};
