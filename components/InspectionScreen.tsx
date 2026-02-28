"use client";

import React from "react";
import type { InspectionResult } from "@/lib/types";
import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { RiskBar } from "@/components/RiskBar";
import ImageUploadCard from "@/components/ImageUploadCard";

interface InspectionScreenProps {
  previewUrl: string | null;
  notes: string;
  loading: boolean;
  error: string | null;
  result: InspectionResult | null;
  onImageChange: (file: File | null) => void;
  onNotesChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function InspectionScreen({
  previewUrl,
  notes,
  loading,
  error,
  result,
  onImageChange,
  onNotesChange,
  onSubmit
}: InspectionScreenProps) {
  return (
    <div className="space-y-4 pb-6">
      <form onSubmit={onSubmit} className="space-y-3">
        <ImageUploadCard
          label="Machine image"
          sublabel="Tap to take or choose a photo"
          onFileSelected={onImageChange}
          previewUrl={previewUrl}
          loading={loading}
        />
        <div>
          <label className="mb-1 block text-[11px] font-medium text-gray-400">
            Voice notes
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="w-full rounded-xl border border-gray-700/60 bg-black/40 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cat-yellow"
            placeholder="e.g. Oil spot under left side, sluggish travel"
          />
        </div>
        {error && (
          <p className="text-[11px] text-red-400">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-3 bg-cat-yellow text-black font-semibold hover:bg-cat-yellowDark disabled:opacity-60 transition-opacity"
        >
          {loading ? "Analyzing…" : "Run inspection"}
        </button>
      </form>

      {result && (
        <>
          <div className="rounded-2xl border border-gray-800 bg-black/60 p-3">
            <div className="flex items-center justify-between mb-2">
              <StatusBadge status={result.status} />
              <div className="text-right">
                <p className="text-[11px] text-gray-400">Risk score</p>
                <p className="text-sm font-semibold text-gray-100">
                  {result.riskScore}/100
                </p>
              </div>
            </div>
            <div className="w-full h-1.5 rounded-full bg-gray-800 overflow-hidden mb-2">
              <div
                className="h-full bg-cat-yellow rounded-full"
                style={{ width: `${Math.min(100, result.riskScore)}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-300 line-clamp-2">
              {result.notes}
            </p>
          </div>

          {result.issues?.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Issues
              </p>
              {result.issues.map((issue, idx) => (
                <div
                  key={`${issue.type}-${idx}`}
                  className="rounded-2xl border border-gray-800 bg-black/60 p-3 text-xs flex justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-50">
                      {issue.type.replace(/_/g, " ")}
                    </p>
                    {issue.location && (
                      <p className="text-[11px] text-gray-400">
                        {issue.location}
                      </p>
                    )}
                    <p className="text-[11px] text-gray-300 mt-1 line-clamp-2">
                      {issue.description}
                    </p>
                  </div>
                  <span className="shrink-0 px-2 py-1 rounded-full text-[10px] bg-gray-800 text-gray-200 uppercase">
                    {issue.severity}
                  </span>
                </div>
              ))}
            </div>
          )}

          {result.recommendedNextSteps?.length > 0 && (
            <Card title="Next steps">
              <ul className="list-disc space-y-0.5 pl-4 text-[11px] text-gray-300">
                {result.recommendedNextSteps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
