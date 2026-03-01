 "use client";

import React, { useRef, useState } from "react";
import { AlertTriangle, AlertCircle, Info, Mic } from "lucide-react";
import type { InspectionResult } from "@/lib/types";
import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { RiskBar } from "@/components/RiskBar";
import CameraCapture from "@/components/CameraCapture";

// Web Speech API – not in default TypeScript DOM typings
interface SpeechRecognitionType {
  start(): void;
  stop(): void;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: unknown) => void) | null;
  onresult: ((event: unknown) => void) | null;
}

function SeverityIndicator({ severity }: { severity: "low" | "medium" | "high" }) {
  const config = {
    high: {
      icon: AlertTriangle,
      className: "bg-red-500/20 text-red-400 border-red-500/40",
      title: "Critical – immediate attention"
    },
    medium: {
      icon: AlertCircle,
      className: "bg-amber-500/20 text-amber-400 border-amber-500/40",
      title: "Caution – schedule maintenance"
    },
    low: {
      icon: Info,
      className: "bg-sky-500/20 text-sky-400 border-sky-500/40",
      title: "Low – note / monitor"
    }
  };
  const { icon: Icon, className, title } = config[severity];
  return (
    <span
      className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full border ${className}`}
      title={title}
    >
      <Icon className="w-4 h-4" />
    </span>
  );
}

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

interface VoiceNotesInputProps {
  notes: string;
  disabled: boolean;
  onNotesChange: (value: string) => void;
}

function VoiceNotesInput({ notes, disabled, onNotesChange }: VoiceNotesInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const userStoppedRef = useRef(false);

  const handleToggleRecording = () => {
    if (isRecording) {
      userStoppedRef.current = true;
      recognitionRef.current?.stop();
      return;
    }

    if (typeof window === "undefined") return;

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      alert("Voice notes are not supported in this browser.");
      return;
    }

    userStoppedRef.current = false;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onerror = (e: any) => {
      if (e?.error === "no-speech" || e?.error === "aborted") {
        return;
      }
      userStoppedRef.current = true;
      setIsRecording(false);
    };

    recognition.onend = () => {
      if (userStoppedRef.current) {
        setIsRecording(false);
        recognitionRef.current = null;
        return;
      }
      try {
        recognition.start();
      } catch {
        setIsRecording(false);
        recognitionRef.current = null;
      }
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();

      if (!transcript) return;

      const combined = notes ? `${notes.trim()} ${transcript}` : transcript;
      onNotesChange(combined);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-gray-400">
        Notes
      </label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          disabled={disabled}
          className="w-full rounded-xl border border-gray-700/60 bg-black/40 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cat-yellow"
          placeholder="e.g. Oil spot under left side, sluggish travel"
        />
        <button
          type="button"
          onClick={handleToggleRecording}
          disabled={disabled}
          className={`flex items-center justify-center rounded-full px-3 py-2 text-xs border transition-colors ${
            isRecording
              ? "border-red-400 bg-red-500/20 text-red-200"
              : "border-gray-600 bg-black/40 text-gray-200 hover:bg-gray-800"
          }`}
        >
          <Mic className="w-3 h-3 mr-1" />
          {isRecording ? "Stop" : "Speak"}
        </button>
      </div>
    </div>
  );
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
  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) onImageChange(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-4 pb-6">
      <form onSubmit={onSubmit} className="space-y-3">
        <CameraCapture
          key={previewUrl ? "preview" : "camera"}
          onCapture={(file) => onImageChange(file)}
          previewUrl={previewUrl}
          onRetake={() => onImageChange(null)}
          onChooseFromGallery={handleGallerySelect}
          disabled={loading}
        />
        <VoiceNotesInput notes={notes} onNotesChange={onNotesChange} disabled={loading} />
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
                  <SeverityIndicator severity={issue.severity} />
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
