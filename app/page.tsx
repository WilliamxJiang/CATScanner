"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Camera, Wrench, Map, FileText } from "lucide-react";

import type {
  InspectionResult,
  PartsIdentificationResult,
  LayoutResult,
  SiteLayoutRequest,
  HyperInspectReport
} from "@/lib/types";
import InspectionScreen from "@/components/InspectionScreen";
import PartsScreen from "@/components/PartsScreen";
import LayoutScreen from "@/components/LayoutScreen";
import ReportScreen from "@/components/ReportScreen";

type TabId = "inspection" | "parts" | "layout" | "report";

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "inspection", label: "Inspect", icon: Camera },
  { id: "parts", label: "Parts", icon: Wrench },
  { id: "layout", label: "Layout", icon: Map },
  { id: "report", label: "Report", icon: FileText }
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabId>("inspection");

  const [inspectionResult, setInspectionResult] = useState<InspectionResult | null>(null);
  const [partsResult, setPartsResult] = useState<PartsIdentificationResult | null>(null);
  const [layoutResult, setLayoutResult] = useState<LayoutResult | null>(null);

  const [inspectionImage, setInspectionImage] = useState<File | null>(null);
  const [inspectionPreviewUrl, setInspectionPreviewUrl] = useState<string | null>(null);
  const [inspectionNotes, setInspectionNotes] = useState("");
  const [inspectionLoading, setInspectionLoading] = useState(false);
  const [inspectionError, setInspectionError] = useState<string | null>(null);

  const [partsImage, setPartsImage] = useState<File | null>(null);
  const [partsPreviewUrl, setPartsPreviewUrl] = useState<string | null>(null);
  const [partDescription, setPartDescription] = useState("");
  const [equipmentModel, setEquipmentModel] = useState("");
  const [partsLoading, setPartsLoading] = useState(false);
  const [partsError, setPartsError] = useState<string | null>(null);

  const [siteType, setSiteType] = useState("");
  const [numberOfMachines, setNumberOfMachines] = useState<number | "">("");
  const [hazardsInput, setHazardsInput] = useState("");
  const [objectiveSafety, setObjectiveSafety] = useState(true);
  const [objectiveEfficiency, setObjectiveEfficiency] = useState(false);
  const [objectiveCost, setObjectiveCost] = useState(false);
  const [layoutLoading, setLayoutLoading] = useState(false);
  const [layoutError, setLayoutError] = useState<string | null>(null);

  const [inspectorName, setInspectorName] = useState("");
  const [machineId, setMachineId] = useState("");
  const [report, setReport] = useState<HyperInspectReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!inspectionImage) {
      if (inspectionPreviewUrl) URL.revokeObjectURL(inspectionPreviewUrl);
      setInspectionPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(inspectionImage);
    setInspectionPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [inspectionImage]);

  useEffect(() => {
    if (!partsImage) {
      if (partsPreviewUrl) URL.revokeObjectURL(partsPreviewUrl);
      setPartsPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(partsImage);
    setPartsPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [partsImage]);

  const handleInspectionSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!inspectionImage) {
        setInspectionError("Please upload a machine image to inspect.");
        return;
      }
      setInspectionLoading(true);
      setInspectionError(null);
      const formData = new FormData();
      formData.append("image", inspectionImage);
      if (inspectionNotes.trim()) formData.append("notes", inspectionNotes.trim());
      try {
        const res = await fetch("/api/inspect", { method: "POST", body: formData });
        const json = await res.json();
        if (!res.ok) {
          setInspectionError(json?.error || "Inspection request failed.");
          return;
        }
        setInspectionResult(json as InspectionResult);
      } catch (err) {
        console.error(err);
        setInspectionError("Unexpected error while running inspection.");
      } finally {
        setInspectionLoading(false);
      }
    },
    [inspectionImage, inspectionNotes]
  );

  const handlePartsSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!partsImage && !partDescription.trim()) {
        setPartsError("Provide at least a part image or a short text description.");
        return;
      }
      setPartsLoading(true);
      setPartsError(null);
      const formData = new FormData();
      if (partsImage) formData.append("image", partsImage);
      if (partDescription.trim()) formData.append("description", partDescription.trim());
      if (equipmentModel.trim()) formData.append("equipmentModel", equipmentModel.trim());
      try {
        const res = await fetch("/api/parts", { method: "POST", body: formData });
        const json = await res.json();
        if (!res.ok) {
          setPartsError(json?.error || "Parts identification failed.");
          return;
        }
        setPartsResult(json as PartsIdentificationResult);
      } catch (err) {
        console.error(err);
        setPartsError("Unexpected error while identifying part.");
      } finally {
        setPartsLoading(false);
      }
    },
    [equipmentModel, partDescription, partsImage]
  );

  const handleLayoutSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!siteType.trim()) {
        setLayoutError("Please describe the site type.");
        return;
      }
      if (numberOfMachines === "" || Number.isNaN(Number(numberOfMachines))) {
        setLayoutError("Please enter a valid number of machines.");
        return;
      }
      const objectives: string[] = [];
      if (objectiveSafety) objectives.push("safety");
      if (objectiveEfficiency) objectives.push("efficiency");
      if (objectiveCost) objectives.push("cost");
      const hazards = hazardsInput.split(",").map((h) => h.trim()).filter(Boolean);
      const payload: SiteLayoutRequest = {
        siteType: siteType.trim(),
        numberOfMachines: Number(numberOfMachines),
        hazards,
        objectives
      };
      setLayoutLoading(true);
      setLayoutError(null);
      try {
        const res = await fetch("/api/layout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (!res.ok) {
          setLayoutError(json?.error || "Layout generation failed.");
          return;
        }
        setLayoutResult(json as LayoutResult);
      } catch (err) {
        console.error(err);
        setLayoutError("Unexpected error while generating layout.");
      } finally {
        setLayoutLoading(false);
      }
    },
    [hazardsInput, numberOfMachines, objectiveCost, objectiveEfficiency, objectiveSafety, siteType]
  );

  const handleReportGenerate = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!inspectionResult && !partsResult && !layoutResult) {
        setReportError("Run at least one of Inspection, Parts, or Site Planning before generating a report.");
        return;
      }
      const payload = {
        inspectorName: inspectorName.trim() || undefined,
        machineId: machineId.trim() || undefined,
        inspection: inspectionResult || undefined,
        parts: partsResult || undefined,
        layout: layoutResult || undefined
      };
      setReportLoading(true);
      setReportError(null);
      try {
        const res = await fetch("/api/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (!res.ok) {
          setReportError(json?.error || "Report generation failed.");
          return;
        }
        setReport(json as HyperInspectReport);
      } catch (err) {
        console.error(err);
        setReportError("Unexpected error while generating report.");
      } finally {
        setReportLoading(false);
      }
    },
    [inspectionResult, layoutResult, machineId, partsResult, inspectorName]
  );

  const handleCopyReportJson = useCallback(async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500);
    } catch (err) {
      console.error("Failed to copy report JSON", err);
    }
  }, [report]);

  return (
    <div className="min-h-screen flex flex-col bg-cat-bg text-white">
      <header className="px-4 pt-5 pb-4 flex items-center justify-between shrink-0 bg-black border-b border-gray-800/80">
        <div className="min-w-0">
          <h1 className="font-cat font-bold text-white tracking-tight text-2xl sm:text-3xl leading-tight">
            <span className="text-white">Field</span>
            <span className="text-cat-yellow">IQ</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 tracking-wide">
            AI field assistant for inspections
          </p>
        </div>
        <div className="h-14 flex items-center justify-center shrink-0 ml-3">
          <img
            src="/cat-logo.png"
            alt="CAT"
            className="h-14 w-auto object-contain"
          />
        </div>
      </header>

      <div className="px-3 pb-3 shrink-0">
        <div className="bg-black/50 rounded-full p-1 flex gap-1 text-xs">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-1 rounded-full py-1.5 min-h-[2.25rem] ${
                  active ? "bg-cat-yellow text-black font-semibold" : "text-gray-400"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-3 pb-4">
        {activeTab === "inspection" && (
          <InspectionScreen
            previewUrl={inspectionPreviewUrl}
            notes={inspectionNotes}
            loading={inspectionLoading}
            error={inspectionError}
            result={inspectionResult}
            onImageChange={setInspectionImage}
            onNotesChange={setInspectionNotes}
            onSubmit={handleInspectionSubmit}
          />
        )}
        {activeTab === "parts" && (
          <PartsScreen
            previewUrl={partsPreviewUrl}
            partDescription={partDescription}
            equipmentModel={equipmentModel}
            loading={partsLoading}
            error={partsError}
            result={partsResult}
            onImageChange={setPartsImage}
            onPartDescriptionChange={setPartDescription}
            onEquipmentModelChange={setEquipmentModel}
            onSubmit={handlePartsSubmit}
          />
        )}
        {activeTab === "layout" && (
          <LayoutScreen
            siteType={siteType}
            numberOfMachines={numberOfMachines}
            hazardsInput={hazardsInput}
            objectiveSafety={objectiveSafety}
            objectiveEfficiency={objectiveEfficiency}
            objectiveCost={objectiveCost}
            loading={layoutLoading}
            error={layoutError}
            result={layoutResult}
            onSiteTypeChange={setSiteType}
            onNumberOfMachinesChange={setNumberOfMachines}
            onHazardsChange={setHazardsInput}
            onObjectiveSafetyChange={setObjectiveSafety}
            onObjectiveEfficiencyChange={setObjectiveEfficiency}
            onObjectiveCostChange={setObjectiveCost}
            onSubmit={handleLayoutSubmit}
          />
        )}
        {activeTab === "report" && (
          <ReportScreen
            inspectorName={inspectorName}
            machineId={machineId}
            hasAnyData={!!(inspectionResult || partsResult || layoutResult)}
            report={report}
            reportLoading={reportLoading}
            reportError={reportError}
            copySuccess={copySuccess}
            onInspectorNameChange={setInspectorName}
            onMachineIdChange={setMachineId}
            onSubmit={handleReportGenerate}
            onCopyJson={handleCopyReportJson}
          />
        )}
      </main>
    </div>
  );
}
