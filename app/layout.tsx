import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FieldIQ",
  description: "AI-powered inspections, parts ID, and site planning"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cat-bg text-gray-100">
        <div className="mx-auto flex min-h-screen max-w-md flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}

