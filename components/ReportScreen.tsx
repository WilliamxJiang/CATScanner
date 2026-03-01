"use client";

import React from "react";
import type { HyperInspectReport, InspectionForm, InspectionFormSection } from "@/lib/types";
import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { RiskBar } from "@/components/RiskBar";
import { FitmentBar } from "@/components/FitmentBar";
import { AsciiBlock } from "@/components/AsciiBlock";
import { Check, X } from "lucide-react";
function InspectionFormView({
  form,
  inspectorName,
  machineId
}: {
  form: InspectionForm;
  inspectorName?: string;
  machineId?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-black/60 overflow-hidden">
      <div className="p-3 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-gray-100 uppercase tracking-wide">
          HYDRAULIC EXCAVATOR
        </h2>
        <p className="text-[11px] text-cat-yellow font-medium mt-0.5">
          {form.formTitle} ({form.formNumber})
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-[11px] text-gray-400">
          <span>Operator/Inspector</span>
          <span className="text-gray-100">{form.operatorInspector || inspectorName || "—"}</span>
          <span>Date</span>
          <span className="text-gray-100">{form.date}</span>
          <span>Time</span>
          <span className="text-gray-100">{form.time}</span>
          <span>Serial Number</span>
          <span className="text-gray-100">{form.serialNumber || machineId || "—"}</span>
          <span>Machine Hours</span>
          <span className="text-gray-100">{form.machineHours || "—"}</span>
        </div>
      </div>
      <div className="divide-y divide-gray-800">
        {form.sections.map((sec: InspectionFormSection) => (
          <div key={sec.title} className="p-3">
            <h3 className="text-[11px] font-semibold text-cat-yellow uppercase tracking-wide mb-2">
              {sec.title}
            </h3>
            <div className="space-y-0">
              <div className="hidden sm:grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 text-[10px] text-gray-500 font-medium border-b border-gray-700 pb-1">
                <span>What are you inspecting?</span>
                <span className="text-center">√</span>
                <span>What are you looking for?</span>
                <span className="text-center">√</span>
                <span>Evaluator Comments</span>
              </div>
              {sec.rows.map((row, i) => (
                <div
                  key={`${row.component}-${i}`}
                  className={`flex flex-wrap gap-x-2 gap-y-1 py-2 border-b border-gray-800/80 last:border-0 text-[11px] sm:grid sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center sm:gap-2 ${!row.passed ? "bg-red-500/5" : ""}`}
                >
                  <span className="sm:col-span-1 font-medium text-gray-200 w-full sm:w-auto">
                    {row.component}
                  </span>
                  <span className="shrink-0 sm:justify-self-center">
                    {row.passed ? (
                      <Check className="w-4 h-4 text-green-500" aria-label="Pass" />
                    ) : (
                      <X className="w-4 h-4 text-red-400" aria-label="Fail" />
                    )}
                  </span>
                  <span className="text-gray-400 w-full sm:w-auto sm:col-span-1">
                    {row.whatToLookFor}
                  </span>
                  <span className="shrink-0 sm:justify-self-center hidden sm:inline">
                    {row.passed ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-400" />
                    )}
                  </span>
                  <span className="text-gray-300 text-[10px] w-full sm:w-auto sm:col-span-1">
                    {row.evaluatorComments || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-gray-800 text-[11px] text-gray-400">
        <p className="font-medium text-gray-300 mb-1">NOTES</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <span>Inspected by</span>
          <span className="text-gray-100">{form.notesInspectedBy || "—"}</span>
          <span>Date</span>
          <span className="text-gray-100">{form.notesDate}</span>
          <span>Time</span>
          <span className="text-gray-100">{form.notesTime}</span>
        </div>
      </div>
    </div>
  );
}

interface ReportScreenProps {
  inspectorName: string;
  machineId: string;
  hasAnyData: boolean;
  report: HyperInspectReport | null;
  reportLoading: boolean;
  reportError: string | null;
  copySuccess: boolean;
  onInspectorNameChange: (value: string) => void;
  onMachineIdChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCopyJson: () => void;
}

export default function ReportScreen({
  inspectorName,
  machineId,
  hasAnyData,
  report,
  reportLoading,
  reportError,
  copySuccess,
  onInspectorNameChange,
  onMachineIdChange,
  onSubmit,
  onCopyJson
}: ReportScreenProps) {
  return (
    <div className="space-y-4 pb-6">
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-gray-400">
              Inspector
            </label>
            <input
              type="text"
              value={inspectorName}
              onChange={(e) => onInspectorNameChange(e.target.value)}
              className="w-full rounded-xl border border-gray-700/60 bg-black/40 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cat-yellow"
              placeholder="Name"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-gray-400">
              Machine ID
            </label>
            <input
              type="text"
              value={machineId}
              onChange={(e) => onMachineIdChange(e.target.value)}
              className="w-full rounded-xl border border-gray-700/60 bg-black/40 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cat-yellow"
              placeholder="e.g. 320GC-1234"
            />
          </div>
        </div>
        {!hasAnyData && (
          <p className="text-[11px] text-gray-400">
            Run Inspect / Parts / Layout first for a richer report.
          </p>
        )}
        {reportError && (
          <p className="text-[11px] text-red-400">{reportError}</p>
        )}
        <button
          type="submit"
          disabled={reportLoading}
          className="w-full rounded-xl py-3 bg-cat-yellow text-black font-semibold hover:bg-cat-yellowDark disabled:opacity-60 transition-opacity"
        >
          {reportLoading ? "Generating…" : "Build report"}
        </button>
      </form>

      {report && (
        <>
          {report.inspectionForm ? (
            <InspectionFormView
              form={report.inspectionForm}
              inspectorName={report.inspectorName || inspectorName}
              machineId={report.machineId || machineId}
            />
          ) : (
            <div className="rounded-2xl border border-gray-800 bg-black/60 p-3">
              <div className="flex items-center justify-between gap-2 text-[11px] text-gray-400 mb-2">
                <span>
                  Inspector:{" "}
                  <span className="font-semibold text-gray-100">
                    {report.inspectorName || inspectorName || "—"}
                  </span>
                </span>
                <span>
                  Machine:{" "}
                  <span className="font-semibold text-gray-100">
                    {report.machineId || machineId || "—"}
                  </span>
                </span>
              </div>
              <p className="text-[11px] text-gray-300 line-clamp-3 mb-2">
                {report.overallSummary}
              </p>
              <p className="text-[10px] text-gray-500 mb-3">
                {report.timestamp}
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-gray-800 bg-black/60 p-3">
            <p className="text-[11px] text-gray-300 line-clamp-3 mb-2">
              {report.overallSummary}
            </p>
            <p className="text-[10px] text-gray-500 mb-2">
              {report.timestamp}
            </p>
            <button
              type="button"
              onClick={onCopyJson}
              className="rounded-xl border border-gray-600 bg-black/40 px-3 py-2 text-[11px] font-semibold text-gray-100 hover:bg-gray-800 transition-colors"
            >
              {copySuccess ? "Copied" : "Copy report JSON"}
            </button>
          </div>

          {report.inspection && !report.inspectionForm && (
            <Card title="Inspection">
              <div className="flex items-center justify-between gap-2">
                <StatusBadge status={report.inspection.status} />
                <span className="text-[11px] text-gray-400">
                  Risk: {report.inspection.riskScore}
                </span>
              </div>
              <RiskBar score={report.inspection.riskScore} />
            </Card>
          )}

          {report.parts && (
            <Card title="Parts">
              {report.parts.equipmentModel && (
                <p className="text-[11px] text-gray-400 mb-2">
                  {report.parts.equipmentModel}
                </p>
              )}
              <p className="text-[11px] text-gray-300 line-clamp-2 mb-2">
                {report.parts.explanation}
              </p>
              <div className="space-y-2">
                {report.parts.candidates.slice(0, 3).map((c, idx) => (
                  <div
                    key={`${c.partNumber}-${idx}`}
                    className="rounded-xl bg-black/40 p-2 text-[11px]"
                  >
                    <span className="font-semibold text-cat-yellow">
                      {c.partNumber}
                    </span>
                    <FitmentBar score={c.fitmentScore} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {report.layout && (
            <Card title="Layout">
              <p className="text-[11px] text-gray-300 line-clamp-2 mb-2">
                {report.layout.overallRecommendation}
              </p>
              <div className="space-y-2">
                {report.layout.plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="rounded-xl bg-black/40 p-2 text-[11px]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-gray-100">
                        {plan.name}
                      </span>
                      <span className="rounded-full px-2 py-0.5 text-[10px] bg-gray-800 text-gray-300">
                        {plan.primaryGoal}
                      </span>
                    </div>
                    <AsciiBlock text={plan.asciiMap} />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
