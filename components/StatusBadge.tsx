import React from "react";
import type { PassFailMonitorStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: PassFailMonitorStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = status;
  let colorClasses = "border-gray-600 bg-gray-800 text-gray-200";

  if (status === "PASS") {
    colorClasses =
      "bg-green-500/20 text-green-300 border-green-500/40";
  } else if (status === "MONITOR") {
    colorClasses =
      "bg-yellow-500/15 text-yellow-200 border-yellow-500/40";
  } else if (status === "FAIL") {
    colorClasses = "bg-red-500/15 text-red-300 border-red-500/40";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase ${colorClasses}`}
    >
      {label}
    </span>
  );
}
