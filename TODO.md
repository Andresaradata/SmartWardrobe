# Smart Wardrobe — What's Left

> Last updated: March 2026
> Week 1 is complete. Below is everything remaining for Week 2 and Week 3.

---

## Week 2 — Outfit Generator + Weather ⛅

### Must do
- [ ] **QA the outfit generator end-to-end**
  - Does changing occasion (casual / formal / sport) actually produce different outfits?
  - Does cold weather trigger outerwear suggestions?
  - Does warm weather suppress heavy items?

- [ ] **Sensor simulation panel**
  - The professor brief specifically mentions "sensor inputs" — we need to simulate this
  - Ideas: a small dashboard panel showing "wardrobe sensors" (humidity, temperature inside wardrobe, item last detected)
  - Could be a card on the dashboard or a dedicated screen

- [ ] **Outfit planner — weekly view**
  - Let the user plan outfits for each day of the upcoming week
  - Simple: 7 day slots, tap a slot → generate or pick an outfit → save it
  - Show the week plan on the dashboard

- [ ] **Saved looks**
  - After generating an outfit, user can "save" it as a named look
  - Saved looks appear in the Outfits tab alongside generated ones

- [ ] **Weather QA**
  - Test that live weather is pulling correctly (check the badge in the header)
  - If location is denied, confirm IP fallback works and shows a city

---

## Week 3 — Personalization + AI Chat 🤖

### Must do
- [ ] **Connect onboarding answers to outfit logic**
  - If user said "business" style → outfit generator should default to business occasion
  - If user said "neutral colors" → prioritize black/white/grey/navy in outfit picks
  - Currently the quiz answers are saved but not used anywhere

- [ ] **AI chat — test all 3 professor scenarios**
  - Scenario 1: "What should I wear today?" → outfit suggestion referencing real wardrobe items
  - Scenario 2: "I want to wear my navy sweater" → full outfit built around that piece
  - Scenario 3: "Should I buy black jeans?" → checks wardrobe for duplicates, gives advice
  - Each of these must work smoothly on demo day

- [ ] **Shopping advice flow**
  - Make the "Should I buy X?" scenario feel more structured in the chat
  - Assistant should clearly say: "You already have Y similar items" or "This would pair well with X, Y, Z in your wardrobe"

- [ ] **Style profile — use real data**
  - Profile screen exists but "Omar" is hardcoded
  - Pull the user's name from onboarding (or add a name field there)
  - Make sustainability score more meaningful — show which items haven't been worn in 30+ days with a nudge

- [ ] **Wardrobe display view (stretch goal)**
  - The professor mentioned "a display" on the wardrobe itself
  - A second full-screen view (TV/tablet mode) showing today's outfit suggestion
  - Could be triggered from the dashboard with a "Show on display" button

---

## Demo Prep 🎯

- [ ] **Run through all 3 scenarios back to back** — time it, should be under 5 minutes total
- [ ] **Clear localStorage before the demo** — start fresh so onboarding shows
- [ ] **Pre-add 3–4 real clothing photos** before the live demo (avoids waiting for AI detection live)
- [ ] **Prepare a fallback** — if Groq API is slow, have a screenshot/recording ready
- [ ] **Test on the presentation device** — not just your laptop

---

## Known Issues 🐛

- [ ] Wardrobe items from multi-photo detection all share the same category icon (expected — no bounding boxes available)
- [ ] Chat history resets on page refresh (by design — no backend)
- [ ] If Groq API is unavailable, chat shows a raw error message (should be a friendlier fallback)

---

## How to contribute

1. Pull the latest: `git pull origin main`
2. Create your `config.js` locally (see README — never commit this)
3. Run: `python3 -m http.server 8181` → open `http://localhost:8181`
4. Pick a task above, build it, push to a branch, let the team know
