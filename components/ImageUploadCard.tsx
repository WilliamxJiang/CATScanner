"use client";

import type { ChangeEvent } from "react";
import { Camera } from "lucide-react";

interface ImageUploadCardProps {
  label: string;
  sublabel?: string;
  onFileSelected: (file: File | null) => void;
  previewUrl?: string | null;
  loading?: boolean;
}

export default function ImageUploadCard({
  label,
  sublabel,
  onFileSelected,
  previewUrl,
  loading
}: ImageUploadCardProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onFileSelected(file);
  };

  return (
    <label className="block cursor-pointer">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <div className="rounded-2xl border border-gray-700/60 bg-black/40 p-3 flex gap-3 items-center active:scale-[0.98] transition-transform">
        <div className="w-16 h-16 shrink-0 rounded-xl bg-gray-900/80 flex items-center justify-center overflow-hidden">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera className="w-6 h-6 text-cat-yellow" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-100">{label}</p>
          <p className="text-[11px] text-gray-400">
            {sublabel ?? "Tap to take or choose a photo"}
          </p>
        </div>
        <div className="shrink-0 flex items-center justify-center">
          <span className="text-[11px] px-2 py-1 rounded-full bg-gray-800 text-gray-300">
            {loading ? "Analyzing…" : "Add"}
          </span>
        </div>
      </div>
    </label>
  );
}
