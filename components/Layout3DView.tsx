"use client";

import React from "react";
import {
  Fuel,
  Package,
  Truck,
  User,
  DoorOpen,
  Box,
  type LucideIcon
} from "lucide-react";
import type { LayoutZone } from "@/lib/types";

const GRID_SIZE = 10;

const colorMap: Record<string, { main: string; shadow: string }> = {
  safety: { main: "#22c55e", shadow: "#16a34a" },
  efficiency: { main: "#0ea5e9", shadow: "#0284c7" },
  cost: { main: "#FFCD11", shadow: "#D4A800" }
};

/** Pick a 3D-style icon for the zone from its label. */
function iconForZone(label: string): LucideIcon {
  const lower = label.toLowerCase();
  if (lower.includes("fuel")) return Fuel;
  if (lower.includes("staging") || lower.includes("storage") || lower.includes("stock")) return Package;
  if (lower.includes("machine") || lower.includes("equipment") || lower.includes("work")) return Truck;
  if (lower.includes("pedestrian") || lower.includes("path") || lower.includes("walk")) return User;
  if (lower.includes("entry") || lower.includes("exit") || lower.includes("access")) return DoorOpen;
  return Box;
}

interface Layout3DViewProps {
  zones: LayoutZone[];
  primaryGoal: "safety" | "efficiency" | "cost";
}

/** Clamp zone to grid 0..GRID_SIZE and ensure min size. */
function toGrid(zone: LayoutZone): { col: number; row: number; w: number; h: number } {
  const col = Math.max(0, Math.min(GRID_SIZE - 1, Math.round(zone.x)));
  const row = Math.max(0, Math.min(GRID_SIZE - 1, Math.round(zone.y)));
  const w = Math.max(1, Math.min(GRID_SIZE - col, Math.round(zone.width) || 1));
  const h = Math.max(1, Math.min(GRID_SIZE - row, Math.round(zone.height) || 1));
  return { col, row, w, h };
}

/** Single block: grid placement + 3D depth (box-shadow). */
function Block3D({
  zone,
  col,
  row,
  w,
  h,
  primaryGoal
}: {
  zone: LayoutZone;
  col: number;
  row: number;
  w: number;
  h: number;
  primaryGoal: "safety" | "efficiency" | "cost";
}) {
  const colors = (zone.colorHint && colorMap[zone.colorHint]) || colorMap[primaryGoal] || colorMap.cost;
  const depth = 6;
  const Icon = iconForZone(zone.label);

  return (
    <div
      className="flex items-center justify-center border border-black/25 rounded-sm z-10 text-black/90"
      style={{
        gridColumn: `${col + 1} / span ${w}`,
        gridRow: `${row + 1} / span ${h}`,
        background: colors.main,
        boxShadow: `${depth}px ${depth}px 0 0 ${colors.shadow}`,
        minHeight: 20
      }}
      title={zone.label}
    >
      <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
    </div>
  );
}

export default function Layout3DView({ zones, primaryGoal }: Layout3DViewProps) {
  if (!zones?.length) return null;

  const cells = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i);

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border-2 border-gray-600 bg-gray-900"
      style={{ height: 240 }}
    >
      <p className="absolute left-2 top-1.5 z-10 text-[10px] font-medium text-gray-500">
        Site boundary
      </p>
      <div
        className="absolute inset-0 grid p-3 pt-6 gap-px"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`
        }}
      >
        {cells.map((i) => (
          <div
            key={i}
            className="min-h-0 rounded-sm bg-gray-800/60 border border-gray-700/80"
            style={{
              gridColumn: (i % GRID_SIZE) + 1,
              gridRow: Math.floor(i / GRID_SIZE) + 1
            }}
          />
        ))}
        {zones.map((zone) => {
          const { col, row, w, h } = toGrid(zone);
          return (
            <Block3D
              key={zone.id}
              zone={zone}
              col={col}
              row={row}
              w={w}
              h={h}
              primaryGoal={primaryGoal}
            />
          );
        })}
      </div>
    </div>
  );
}
