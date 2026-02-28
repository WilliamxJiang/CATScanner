import React from "react";

interface RiskBarProps {
  score: number; // 0-100
}

export function RiskBar({ score }: RiskBarProps) {
  const clamped = Math.max(0, Math.min(100, score));

  let color = "bg-green-500";
  if (clamped >= 70) {
    color = "bg-red-500";
  } else if (clamped >= 40) {
    color = "bg-cat-yellow";
  }

  return (
    <div className="mt-1">
      <div className="flex items-center justify-between text-[11px] text-gray-400">
        <span>Risk score</span>
        <span className="font-semibold text-gray-100">{clamped}/100</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-gray-800 overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
