# Smart Wardrobe — Project Context

## What This Is
A front-end browser prototype for a Smart Wardrobe concept. Built for a MIBA Prototyping class (Term 2, Final Presentation). The prototype simulates a connected wardrobe with sensors and an app interface.

## Professor Brief
> "You are a startup imagining a connected wardrobe with sensors and a display. People have clothes but lack intelligent tools to manage styling, usage and care — current apps are disconnected from physical context. Build a prototype that combines sensor inputs, an app and an interface to suggest outfits, track wear, help plan outfits and support sustainable choices."

## 3 Demo Scenarios (must nail all three)
1. **Digitizing Clothes** — Upload a photo, system detects attributes (type, color, season, warmth), user confirms, item saved to wardrobe
2. **Outfit Recommendation** — User picks one item ("I want to wear my red sweater") → system builds a full outfit adapted to live weather
3. **Shopping Advice** — User asks "Should I buy black jeans?" → AI checks wardrobe, warns about duplicates, suggests compatibility

## Screens to Build
| Screen | Description |
|---|---|
| Splash | App loading screen |
| Onboarding / Style Quiz | First-time user style preference setup |
| Dashboard | Weather widget + today's outfit suggestion + wardrobe stats |
| Wardrobe Grid | Browse all items, filter by category/color |
| Add Item | Photo upload + attribute tagging (category, color, season, warmth, style tags) |
| Outfit Generator | Pick an item → get a full outfit suggestion |
| AI Chat Assistant | Conversational interface connected to wardrobe data + weather |
| Style Profile | Personal style stats and preferences |

## Tech Stack
- **HTML5** — app shell in `index.html`
- **Vanilla CSS** — full design system in `styles/main.css`
- **Vanilla JavaScript (ES6+)** — modular scripts, no frameworks
- **Lucide Icons** — via CDN
- **Google Fonts** — Inter
- **Open-Meteo API** — free weather API, no key required
- **localStorage** — wardrobe data persistence (no backend)

## Folder Structure
```
SmartWardrobe/
├── CLAUDE.md               ← you are here
├── TODO.md                 ← master task list (keep updated)
├── config.js               ← API keys — blank key committed, add real key locally only
├── index.html              ← app shell + all screen templates
├── styles/
│   └── main.css            ← design system + all component styles
├── scripts/
│   ├── app.js              ← routing, navigation, initialization
│   ├── wardrobe.js         ← wardrobe data, CRUD, localStorage
│   ├── outfits.js          ← outfit generation engine (rule-based)
│   ├── weather.js          ← weather fetching + context rules
│   ├── assistant.js        ← AI chat logic (wardrobe-aware responses)
│   └── recognition.js      ← clothing photo recognition via Groq Vision
└── Smart Wardrobe.docx     ← original project document (keep, do not delete)
```

## Architecture Decisions
- **No backend, no build step** — open `index.html` directly in browser
- **localStorage** for wardrobe data — survives page refresh, good enough for demo
- **Rule-based outfit engine** — simulates AI logic without actual ML
- **Pre-loaded demo data** — wardrobe starts populated so it never looks empty on presentation day
- **Modular JS files** — each file owns one concern, easy for teammates to work on independently

## GitHub
- Repo: https://github.com/Omla903/SmartWardrobe.git
- Branch strategy: work on `main` for now, teammates can branch if needed

## Team
- MIBA cohort, Term 2
- Omar Trabelsi (primary dev contact via Claude Code)
- Other teammates may contribute later

## Current Status
- [x] Folder cleaned up
- [x] Git initialized and connected to GitHub
- [x] CLAUDE.md created
- [x] index.html
- [x] styles/main.css
- [x] scripts/wardrobe.js
- [x] scripts/weather.js
- [x] scripts/outfits.js
- [x] scripts/assistant.js
- [x] scripts/app.js
- [x] scripts/recognition.js
- [x] Pre-load demo data
- [x] Push to GitHub
- [x] Deployed on GitHub Pages → https://omla903.github.io/SmartWardrobe/

## What "Good" Looks Like
- Feels like a real mobile app (not a webpage)
- Demo data pre-loaded — never looks empty
- All 3 professor scenarios are clickable and smooth
- Weather widget shows real live data
- Chat assistant gives wardrobe-aware responses
- Polished animations and transitions
