"use client";

import React from "react";
import type { LayoutResult } from "@/lib/types";
import { Card } from "@/components/Card";
import { AsciiBlock } from "@/components/AsciiBlock";
import Layout3DView from "@/components/Layout3DView";

interface LayoutScreenProps {
  siteType: string;
  numberOfMachines: number | "";
  hazardsInput: string;
  objectiveSafety: boolean;
  objectiveEfficiency: boolean;
  objectiveCost: boolean;
  loading: boolean;
  error: string | null;
  result: LayoutResult | null;
  onSiteTypeChange: (value: string) => void;
  onNumberOfMachinesChange: (value: number | "") => void;
  onHazardsChange: (value: string) => void;
  onObjectiveSafetyChange: (value: boolean) => void;
  onObjectiveEfficiencyChange: (value: boolean) => void;
  onObjectiveCostChange: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function LayoutScreen({
  siteType,
  numberOfMachines,
  hazardsInput,
  objectiveSafety,
  objectiveEfficiency,
  objectiveCost,
  loading,
  error,
  result,
  onSiteTypeChange,
  onNumberOfMachinesChange,
  onHazardsChange,
  onObjectiveSafetyChange,
  onObjectiveEfficiencyChange,
  onObjectiveCostChange,
  onSubmit
}: LayoutScreenProps) {
  return (
    <div className="space-y-4 pb-6">
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-[11px] font-medium text-gray-400">
            Site type
          </label>
          <input
            type="text"
            value={siteType}
            onChange={(e) => onSiteTypeChange(e.target.value)}
            className="w-full rounded-xl border border-gray-700/60 bg-black/40 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cat-yellow"
            placeholder="e.g. Quarry, pipeline spread"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-medium text-gray-400">
            Number of machines
          </label>
          <input
            type="number"
            min={1}
            value={numberOfMachines}
            onChange={(e) =>
              onNumberOfMachinesChange(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            className="w-full rounded-xl border border-gray-700/60 bg-black/40 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cat-yellow"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-medium text-gray-400">
            Hazards
          </label>
          <input
            type="text"
            value={hazardsInput}
            onChange={(e) => onHazardsChange(e.target.value)}
            className="w-full rounded-xl border border-gray-700/60 bg-black/40 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cat-yellow"
            placeholder="Comma-separated"
          />
        </div>
        <div>
          <p className="mb-2 text-[11px] font-medium text-gray-400">
            Objectives
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onObjectiveSafetyChange(!objectiveSafety)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-medium border transition-colors ${
                objectiveSafety
                  ? "bg-cat-yellow text-black border-cat-yellow"
                  : "border-gray-600 text-gray-400 bg-black/40"
              }`}
            >
              Safety
            </button>
            <button
              type="button"
              onClick={() => onObjectiveEfficiencyChange(!objectiveEfficiency)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-medium border transition-colors ${
                objectiveEfficiency
                  ? "bg-cat-yellow text-black border-cat-yellow"
                  : "border-gray-600 text-gray-400 bg-black/40"
              }`}
            >
              Efficiency
            </button>
            <button
              type="button"
              onClick={() => onObjectiveCostChange(!objectiveCost)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-medium border transition-colors ${
                objectiveCost
                  ? "bg-cat-yellow text-black border-cat-yellow"
                  : "border-gray-600 text-gray-400 bg-black/40"
              }`}
            >
              Cost
            </button>
          </div>
        </div>
        {error && (
          <p className="text-[11px] text-red-400">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-3 bg-cat-yellow text-black font-semibold hover:bg-cat-yellowDark disabled:opacity-60 transition-opacity"
        >
          {loading ? "Generating…" : "Generate layout plans"}
        </button>
      </form>

      {result && (
        <>
          <p className="text-[11px] text-gray-300">
            {result.overallRecommendation}
          </p>
          <div className="space-y-3">
            {result.plans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-2xl border border-gray-800 bg-black/60 p-3 text-xs"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-gray-100">
                    {plan.name}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      plan.primaryGoal === "safety"
                        ? "bg-green-500/20 text-green-300"
                        : plan.primaryGoal === "efficiency"
                        ? "bg-sky-500/20 text-sky-300"
                        : "bg-cat-yellow/20 text-cat-yellow"
                    }`}
                  >
                    {plan.primaryGoal}
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 mb-2 line-clamp-2">
                  {plan.summary}
                </p>
                {plan.zones?.length ? (
                  <Layout3DView zones={plan.zones} primaryGoal={plan.primaryGoal} />
                ) : (
                  <AsciiBlock text={plan.asciiMap} />
                )}
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {plan.pros?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase text-green-400 mb-0.5">
                        Pros
                      </p>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-gray-300">
                        {plan.pros.slice(0, 3).map((p, idx) => (
                          <li key={idx}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {plan.cons?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase text-red-400 mb-0.5">
                        Cons
                      </p>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-gray-300">
                        {plan.cons.slice(0, 2).map((c, idx) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                  {plan.estimatedTravelDistance && (
                    <span className="rounded-full bg-gray-800 px-2 py-0.5 text-gray-300">
                      {plan.estimatedTravelDistance}
                    </span>
                  )}
                  {plan.congestionRisk && (
                    <span className="rounded-full bg-gray-800 px-2 py-0.5 text-gray-300">
                      Congestion: {plan.congestionRisk}
                    </span>
                  )}
                  {plan.safetyRisk && (
                    <span className="rounded-full bg-gray-800 px-2 py-0.5 text-gray-300">
                      Safety: {plan.safetyRisk}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
