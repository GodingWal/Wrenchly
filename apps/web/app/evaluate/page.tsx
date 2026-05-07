"use client";

import { useState } from "react";
import type { IssueKey } from "@wrenchly/types";
import { Stepper } from "./Stepper";
import { StepVehicle, isVehicleStepValid } from "./StepVehicle";
import { StepCondition, isConditionStepValid } from "./StepCondition";
import { StepIssues } from "./StepIssues";
import { StepPricing, isPricingStepValid } from "./StepPricing";
import { Verdict } from "./Verdict";
import { STEPS, type DealDraft, type EvaluateResponse, type StepKey } from "./types";

const EMPTY_DRAFT: DealDraft = {
  vehicle: {},
  condition: {},
  issues: [],
};

export default function EvaluatePage() {
  const [step, setStep] = useState<StepKey>("vehicle");
  const [draft, setDraft] = useState<DealDraft>(EMPTY_DRAFT);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<EvaluateResponse | null>(null);

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const isLast = stepIndex === STEPS.length - 1;

  function patchVehicle(patch: Partial<DealDraft["vehicle"]>) {
    setDraft((d) => ({ ...d, vehicle: { ...d.vehicle, ...patch } }));
  }
  function patchCondition(patch: Partial<DealDraft["condition"]>) {
    setDraft((d) => ({ ...d, condition: { ...d.condition, ...patch } }));
  }
  function patchPricing(patch: Partial<Pick<DealDraft, "askingPrice" | "targetPrice" | "zip">>) {
    setDraft((d) => ({ ...d, ...patch }));
  }
  function patchIssues(next: IssueKey[]) {
    setDraft((d) => ({ ...d, issues: next }));
  }
  function patchNotes(next: string) {
    setDraft((d) => ({ ...d, notes: next }));
  }

  function canAdvance(): boolean {
    switch (step) {
      case "vehicle":
        return isVehicleStepValid(draft);
      case "condition":
        return isConditionStepValid(draft);
      case "issues":
        return true;
      case "pricing":
        return isPricingStepValid(draft);
    }
  }

  function next() {
    if (!canAdvance()) return;
    if (!isLast) {
      setStep(STEPS[stepIndex + 1].key);
    } else {
      void submit();
    }
  }

  function back() {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1].key);
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        vehicle: draft.vehicle,
        condition: draft.condition,
        issues: draft.issues,
        notes: draft.notes,
        askingPrice: draft.askingPrice,
        targetPrice: draft.targetPrice,
        zip: draft.zip,
      };
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      const json: EvaluateResponse = await res.json();
      setResponse(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setResponse(null);
    setDraft(EMPTY_DRAFT);
    setStep("vehicle");
  }

  return (
    <main>
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        {response ? (
          <Verdict
            result={response.result}
            askingPrice={response.input.askingPrice}
            dealId={response.dealId}
            onReset={reset}
          />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <Stepper current={step} />
            <h1 className="mt-6 text-2xl font-bold text-ink sm:text-3xl">
              {STEP_TITLE[step]}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{STEP_SUB[step]}</p>

            <div className="mt-6">
              {step === "vehicle" && (
                <StepVehicle draft={draft} onChange={patchVehicle} />
              )}
              {step === "condition" && (
                <StepCondition draft={draft} onChange={patchCondition} />
              )}
              {step === "issues" && (
                <StepIssues
                  draft={draft}
                  onIssuesChange={patchIssues}
                  onNotesChange={patchNotes}
                />
              )}
              {step === "pricing" && (
                <StepPricing draft={draft} onChange={patchPricing} />
              )}
            </div>

            {error && (
              <p className="mt-4 rounded-lg bg-signal-stop/10 px-3 py-2 text-sm text-signal-stop">
                {error}
              </p>
            )}

            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={back}
                disabled={stepIndex === 0 || submitting}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-ink hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>
              <button
                type="button"
                onClick={next}
                disabled={!canAdvance() || submitting}
                className="rounded-lg bg-ink px-5 py-2.5 font-semibold text-white hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting
                  ? "Crunching…"
                  : isLast
                    ? "Get verdict"
                    : "Next"}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

const STEP_TITLE: Record<StepKey, string> = {
  vehicle: "What's the vehicle?",
  condition: "What kind of shape is it in?",
  issues: "What's wrong with it?",
  pricing: "What are they asking?",
};

const STEP_SUB: Record<StepKey, string> = {
  vehicle: "Year, make, model, mileage, and title status.",
  condition: "Quick visual assessment — be honest.",
  issues: "Check anything you can confirm.",
  pricing: "We'll compare against local comps.",
};
