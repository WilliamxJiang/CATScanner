"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Camera, ImagePlus } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  previewUrl?: string | null;
  onRetake?: () => void;
  onChooseFromGallery?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export default function CameraCapture({
  onCapture,
  previewUrl,
  onRetake,
  onChooseFromGallery,
  disabled
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setReady(true);
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Camera access denied";
      setError(
        msg.includes("Permission") || msg.includes("denied")
          ? "Camera permission required. Use gallery below."
          : "Camera not available. Use gallery below."
      );
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setReady(false);
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || !streamRef.current || !video.videoWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "inspection.jpg", {
          type: "image/jpeg",
          lastModified: Date.now()
        });
        onCapture(file);
        stopCamera();
      },
      "image/jpeg",
      0.9
    );
  }, [onCapture, stopCamera]);

  if (previewUrl) {
    return (
      <div className="relative w-full rounded-2xl border border-gray-700/60 bg-black/40 overflow-hidden aspect-[9/16] max-h-[60vh]">
        <img
          src={previewUrl}
          alt="Captured"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/30">
          {onRetake && (
            <button
              type="button"
              onClick={onRetake}
              className="rounded-full bg-cat-yellow px-4 py-2 text-sm font-semibold text-black"
            >
              Retake
            </button>
          )}
          {onChooseFromGallery && (
            <label className="rounded-full bg-black/60 border border-gray-600 px-4 py-2 text-sm font-medium text-gray-100 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onChooseFromGallery}
              />
              Gallery
            </label>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <div className="w-full rounded-2xl border border-gray-700/60 bg-black/40 aspect-[9/16] max-h-[60vh] flex items-center justify-center">
          <div className="text-center px-4">
            <Camera className="w-12 h-12 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        </div>
        {onChooseFromGallery && (
          <label className="block">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onChooseFromGallery}
            />
            <div className="rounded-2xl border border-gray-700/60 bg-black/40 p-3 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]">
              <ImagePlus className="w-5 h-5 text-cat-yellow" />
              <span className="text-sm font-medium">Choose from gallery</span>
            </div>
          </label>
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <div className="relative w-full min-w-0 rounded-2xl border border-gray-700/60 bg-black overflow-hidden aspect-[9/16] max-h-[60vh]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {ready && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <button
              type="button"
              onClick={capture}
              disabled={disabled}
              className="w-16 h-16 rounded-full border-4 border-white bg-white/20 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
            >
              <Camera className="w-7 h-7 text-white" />
            </button>
          </div>
        )}
      </div>
      {onChooseFromGallery && (
        <label className="block text-center">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onChooseFromGallery}
          />
          <span className="text-[11px] text-gray-400 cursor-pointer hover:text-cat-yellow">
            or choose from gallery
          </span>
        </label>
      )}
    </div>
  );
}
