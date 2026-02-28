import React from "react";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, children, className }: CardProps) {
  return (
    <section
      className={
        "mb-4 rounded-2xl border border-gray-700/60 bg-black/40 p-3 sm:p-4" +
        (className ? ` ${className}` : "")
      }
    >
      {title && (
        <h2 className="mb-2 text-sm font-semibold text-gray-200">{title}</h2>
      )}
      {children}
    </section>
  );
}
