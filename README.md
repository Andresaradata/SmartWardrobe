# Smart Wardrobe — AI Prototype

> MIBA · Prototyping Class · Term 2 · Final Presentation

---

## What is this?

Smart Wardrobe is a front-end prototype for a connected wardrobe concept. It combines sensor simulation, an AI assistant, and a mobile app interface to help users manage their clothes, discover outfit combinations, and make smarter shopping decisions.

Built in 3 weeks as a proof-of-concept — not a production app.

---

## The 3 Demo Scenarios

| # | Scenario | How to demo it |
|---|---|---|
| 1 | **Digitize clothes** | Tap `+` → upload a photo → AI detects item(s) → confirm & save |
| 2 | **Outfit recommendation** | Go to Outfits → pick an occasion → Generate Outfit → Wear today |
| 3 | **Shopping advice** | Go to Ask AI → "Should I buy black jeans?" → get wardrobe-aware advice |

---

## Features

- **AI clothing recognition** — upload one photo, AI detects all items in it (multi-item support)
- **Digital wardrobe** — browse your catalog by category, with SVG product icons per item
- **Weather-aware outfit generator** — live weather from Open-Meteo influences suggestions
- **AI chat assistant** — powered by Groq/Llama, connected to your wardrobe + weather data
- **Style profile** — personal style DNA, color palette, sustainability score
- **Wear tracking** — log wears, track last worn, see your most-used items
- **Onboarding quiz** — sets your style preferences on first launch

---

## Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | Vanilla CSS (custom design system) |
| Logic | Vanilla JavaScript ES6+ |
| Icons | Lucide Icons (CDN) |
| Fonts | Google Fonts — Inter |
| AI Recognition | Groq Vision — Llama 4 Scout |
| AI Chat | Groq — Llama 3.3 70B |
| Weather | Open-Meteo (free, no key) |
| Geolocation | Browser GPS → IP fallback (ipapi.co) |
| Storage | localStorage (no backend) |

---

## Running Locally

No build step required.

**1. Clone the repo**
```bash
git clone https://github.com/Omla903/SmartWardrobe.git
cd SmartWardrobe
```

**2. Add your API key**

Create a `config.js` file in the root (this file is gitignored — never commit it):
```js
const CONFIG = {
  GROQ_API_KEY: "your_groq_api_key_here",
  GROQ_VISION_MODEL: "meta-llama/llama-4-scout-17b-16e-instruct",
  GROQ_CHAT_MODEL:   "llama-3.3-70b-versatile",
  GROQ_API_URL: "https://api.groq.com/openai/v1/chat/completions",
  IPAPI_KEY: "",
};
```

Get a free Groq API key at: https://console.groq.com

**3. Start a local server**

The app must be served over HTTP (not opened as a file) for API calls to work.

```bash
python3 -m http.server 8181
```

Then open: **http://localhost:8181**

> Note: the first time you open it, you'll go through a 3-step style quiz. Your preferences and wardrobe data are saved in your browser's localStorage.

---

## Project Structure

```
SmartWardrobe/
├── index.html              # App shell + all screen templates
├── config.js               # API keys — GITIGNORED, create locally
├── styles/
│   └── main.css            # Full design system + component styles
├── scripts/
│   ├── app.js              # Routing, screen rendering, all UI logic
│   ├── wardrobe.js         # Data model, CRUD, localStorage, demo data
│   ├── outfits.js          # Rule-based outfit generation engine
│   ├── weather.js          # Open-Meteo + IP geolocation fallback
│   ├── recognition.js      # Groq Vision — multi-item clothing detection
│   └── assistant.js        # Groq chat — wardrobe-aware AI assistant
├── assets/
│   └── demo/               # Reserved for demo assets
├── CLAUDE.md               # AI context file (for Claude Code sessions)
└── Smart Wardrobe.docx     # Original project brief
```

---

## Team

MIBA cohort — Term 2 Prototyping Class

---

## Notes for teammates

- **Do not commit `config.js`** — share the Groq API key privately (WhatsApp, etc.)
- The app seeds 12 demo wardrobe items on first load so it never looks empty
- All AI features degrade gracefully if no API key is present (mock responses)
- Clothing recognition works best with clear, well-lit photos on a neutral background
