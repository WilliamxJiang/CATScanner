"use client";

import React from "react";
import type { PartsIdentificationResult } from "@/lib/types";
import { Card } from "@/components/Card";
import { FitmentBar } from "@/components/FitmentBar";
import ImageUploadCard from "@/components/ImageUploadCard";

interface PartsScreenProps {
  previewUrl: string | null;
  partDescription: string;
  equipmentModel: string;
  loading: boolean;
  error: string | null;
  result: PartsIdentificationResult | null;
  onImageChange: (file: File | null) => void;
  onPartDescriptionChange: (value: string) => void;
  onEquipmentModelChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function PartsScreen({
  previewUrl,
  partDescription,
  equipmentModel,
  loading,
  error,
  result,
  onImageChange,
  onPartDescriptionChange,
  onEquipmentModelChange,
  onSubmit
}: PartsScreenProps) {
  return (
    <div className="space-y-4 pb-6">
      <form onSubmit={onSubmit} className="space-y-3">
        <ImageUploadCard
          label="Part photo"
          sublabel="Optional — tap to add"
          onFileSelected={onImageChange}
          previewUrl={previewUrl}
          loading={loading}
        />
        <div>
          <label className="mb-1 block text-[11px] font-medium text-gray-400">
            Describe the part
          </label>
          <input
            type="text"
            value={partDescription}
            onChange={(e) => onPartDescriptionChange(e.target.value)}
            className="w-full rounded-xl border border-gray-700/60 bg-black/40 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cat-yellow"
            placeholder="e.g. Front idler, 320 GC, 9-bolt"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-medium text-gray-400">
            Equipment model
          </label>
          <input
            type="text"
            value={equipmentModel}
            onChange={(e) => onEquipmentModelChange(e.target.value)}
            className="w-full rounded-xl border border-gray-700/60 bg-black/40 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cat-yellow"
            placeholder="e.g. 320 GC, 950M"
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
          {loading ? "Identifying…" : "Identify part"}
        </button>
      </form>

      {result && (
        <>
          {result.equipmentModel && (
            <p className="text-[11px] text-gray-400">
              Model:{" "}
              <span className="font-semibold text-gray-100">
                {result.equipmentModel}
              </span>
            </p>
          )}
          <p className="text-[11px] text-gray-300 line-clamp-2">
            {result.explanation}
          </p>
          <div className="space-y-2">
            {result.candidates.map((candidate, idx) => (
              <div
                key={`${candidate.partNumber}-${idx}`}
                className="rounded-2xl border border-gray-800 bg-black/60 p-3 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-cat-yellow">
                    {candidate.partNumber}
                  </span>
                  {candidate.description && (
                    <span className="text-[11px] text-gray-400 truncate max-w-[50%]">
                      {candidate.description}
                    </span>
                  )}
                </div>
                <FitmentBar score={candidate.fitmentScore} />
                {candidate.notes && (
                  <p className="mt-1 text-[11px] text-gray-300 line-clamp-2">
                    {candidate.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
