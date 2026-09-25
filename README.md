# 🔥 Roast My Profile — Savage AI Career Critic

[![Live Demo](https://img.shields.io/badge/Live_Demo-roast--bot--plum.vercel.app-brightgreen?style=for-the-badge&logo=vercel)](https://roast-bot-plum.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Groq Cloud](https://img.shields.io/badge/Inference-Groq_LPU-f55036?style=for-the-badge)](https://groq.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

An internet-culture-fluent AI critic that dissects developer resumes, LinkedIn headlines, and GitHub profiles with brutal honesty. Features zero-friction GitHub account ingestion, dynamic LLM failover, and client-side rasterized shareable cards.

---

## ✨ Features

- ⚡ **Zero-Friction GitHub Ingestion:** Input any public GitHub username (e.g. `@torvalds`) to instantly pull public metadata, bio, followers, and recent repositories with language & star metrics.
- 🎯 **Multi-Surface Roast Engine:** Specialized evaluation prompts tailored for resumes, LinkedIn bios, and open-source profiles.
- 📊 **Structured Metric Synthesis:** Enforces JSON schemas to derive numeric indicators (*Corporate Buzzword Toxicity*, *Ghosting Likelihood*, *Cringe Rating*).
- 🖼️ **One-Click Shareable Cards:** Client-side DOM rasterization via `html-to-image` renders 2x pixel-density PNG cards ready for Twitter/X and LinkedIn.
- 🐦 **Instant Social Distribution:** Integrated one-click intent sharing directly to X.

---

## 🏗️ Architecture & Engineering Highlights

┌─────────────────┐ ┌────────────────────────┐ ┌──────────────────────┐
│ Client (React) │ ───▶ │ Next.js Server Route │ ───▶ │ Groq Cloud LPU API │
│ - Form & State │ │ - Model Negotiation │ │ - Catalog Lookup │
│ - DOM Canvas │ ◀─── │ - JSON Schema Guard │ ◀─── │ - Fast Completion │
└─────────────────┘ └────────────────────────┘ └──────────────────────┘
│
▼ (GitHub API)
[api.github.com/users/{id}]
code Code

### 1. Dynamic Model Negotiation & Catalog Discovery
Rather than hardcoding fragile model strings, the backend queries Groq's `/v1/models` endpoint at runtime. It prioritizes the highest-quality conversational LLMs available to the API key's current authorization tier, preventing 404 access breakages.

### 2. Deterministic Schema Enforcement
By constraining model outputs with `response_format: { type: 'json_object' }` and markdown stripping guards, non-deterministic language responses are transformed into structured primitives that feed visual progress meters and callout tags.

### 3. Sub-Second Inference Latency
Leverages Groq's LPU architecture, bringing time-to-first-token down to under 400ms for conversational inference.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- A free [Groq Cloud API Key](https://console.groq.com/keys)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/ai-roast-bot.git
   cd ai-roast-bot

    Install dependencies:
    code Bash

    npm install

    Configure Environment Variables:
    Create a .env.local file in the project root:
    code Env

    OPENAI_API_KEY=gsk_your_groq_api_key_here

    Run the local development server:
    code Bash

    npm run dev

    Open http://localhost:3000 to test.

📦 Project Structure
code Code

├── app/
│   ├── api/
│   │   └── roast/
│   │       └── route.ts       # Runtime model discovery & LLM prompt pipeline
│   ├── globals.css            # Dark mode styles & Tailwind primitives
│   ├── layout.tsx             # Root layout with font configuration
│   └── page.tsx               # Reactive UI, GitHub fetcher & Share card canvas
├── public/                    # Static assets
├── .env.local                 # Ignored local environment variables
├── package.json
└── tailwind.config.ts

---

🛡️ License

MIT License. Free to use and modify for learning and showcase purposes.
