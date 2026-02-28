import React from "react";

interface FitmentBarProps {
  score: number; // 0-1
}

export function FitmentBar({ score }: FitmentBarProps) {
  const clamped = Math.max(0, Math.min(1, score));
  const percent = Math.round(clamped * 100);

  let color = "bg-cat-yellow";
  if (percent < 40) {
    color = "bg-red-500";
  } else if (percent < 70) {
    color = "bg-amber-400";
  }

  return (
    <div className="mt-1">
      <div className="flex items-center justify-between text-[11px] text-gray-400">
        <span>Fitment</span>
        <span className="font-semibold text-gray-100">{percent}%</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-gray-800 overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
