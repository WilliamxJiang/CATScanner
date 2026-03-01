# FieldIQ

**FieldIQ** is an AI-powered field assistant for equipment inspections, parts identification, and site layout planning. It uses GPT-4 with vision to analyze photos and generate structured reports in a CAT-inspired yellow/black UI.

## Features

- **Inspect** — Upload a machine image and optional notes; get a risk score (PASS / MONITOR / FAIL), issues with recommendations, and optional CAT-style inspection form output.
- **Parts** — Upload a part image and/or description (plus optional equipment model); get part number candidates with fitment scores.
- **Site Planning** — Describe site type, machine count, hazards, and objectives (safety / efficiency / cost); get layout plans with 3D zone views and ASCII maps.
- **Report** — Combine inspection, parts, and layout data into one report with executive summary and optional JSON export.

## Tech stack

- **Next.js 14** (App Router)
- **React 18**, **TypeScript**
- **Tailwind CSS** (CAT yellow/black theme)
- **OpenAI API** (GPT-4o) for vision and text
- **Lucide React** for icons

## Getting started

### Prerequisites

- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/api-keys)

### Setup

1. Clone the repo and install dependencies:

   ```bash
   cd HackIllinois
   npm install
   ```

2. Create a local env file with your OpenAI key:

   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` and set:

   ```
   OPENAI_API_KEY=your-openai-api-key
   ```

   *(If `.env.example` is not committed, create `.env.local` and add the line above.)*

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts

| Command       | Description              |
|---------------|--------------------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build       |
| `npm run start` | Run production server  |
| `npm run lint` | Run ESLint             |

## Project structure

```
├── app/
│   ├── api/           # API routes (inspect, parts, layout, report)
│   ├── layout.tsx     # Root layout & metadata
│   ├── page.tsx       # Home: tabs + state, passes data to screens
│   └── globals.css    # Tailwind + base styles
├── components/        # InspectionScreen, PartsScreen, LayoutScreen,
│                      # ReportScreen, Layout3DView, Card, etc.
├── lib/
│   └── types.ts       # Shared TypeScript types
├── data/              # Static data (e.g. inspection checklist)
├── prompts/           # Prompt fragments for OpenAI
└── public/            # Static assets (e.g. cat-logo.png)
```

## Environment variables

| Variable        | Required | Description                    |
|-----------------|----------|--------------------------------|
| `OPENAI_API_KEY` | Yes     | OpenAI API key for GPT-4o calls |

