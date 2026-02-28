import React from "react";

interface AsciiBlockProps {
  text: string;
}

export function AsciiBlock({ text }: AsciiBlockProps) {
  return (
    <pre className="mt-2 overflow-auto rounded-xl bg-black/60 p-3 text-xs font-mono text-gray-200">
      {text}
    </pre>
  );
}
