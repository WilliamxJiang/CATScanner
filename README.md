FieldIQ

AI-powered inspections, parts identification, and site planning for CAT field operations.

🚜 Overview

FieldIQ unifies CAT Inspect workflows with CAT AI Assistant intelligence.
From a mobile device, operators can instantly inspect machines, identify parts, and generate optimized site layouts using multimodal AI (vision, voice, text).

✨ Features
1. AI Machine Inspection

Upload a photo → get PASS/FAIL/MONITOR

Issues, severity, risk score, recommendations

Compact, operator-friendly summaries

2. Voice/Notes → Logs

Convert spoken or typed notes into structured inspection entries.

3. Visual Parts Identification

Photo or describe a part

Returns ranked part numbers + fitment certainty

4. AI Site Layout Planner

Input site details

Generates multiple layout options with ASCII diagrams + pros/cons

5. Unified Report

Combine inspection, parts, and layout outputs into one structured summary.

🧱 Tech Stack

Next.js 14 (App Router)

Tailwind CSS w/ CAT color palette

Node.js

OpenAI GPT-4o (vision, text, reasoning)

Mobile-first UI

⚙️ Setup
npm install
echo "OPENAI_API_KEY=your_key" > .env.local
npm run dev

Visit http://localhost:3000
 (mobile-friendly).

📁 Structure
app/
  api/inspect
  api/parts
  api/layout
  api/report
  components/
  page.tsx
lib/types.ts
🧪 Quick Demo Flow

Inspect: upload machine photo → structured results

Parts: photo/description → ranked part numbers

Layout: site inputs → multiple layout plans

Report: auto-generated summary

🏆 Impact

FieldIQ reduces inspection time, errors, and congestion while improving safety, documentation quality, and operational efficiency for CAT field teams.
