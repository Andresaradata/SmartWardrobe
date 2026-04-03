# Smart Wardrobe — Master Task List

> Last updated: April 2026
> Deployment: https://omla903.github.io/SmartWardrobe/

---

## PRIORITY 1 — Must ship before demo

### Demo Scenarios (all 3 must work end-to-end, no friction)

- [ ] **Scenario 1 — Digitizing Clothes**
  - Upload a photo → Groq Vision detects type, color, season, warmth
  - User confirms attributes → item saved to wardrobe
  - QA: does it work with different clothing types? Does it fail gracefully if Vision API is slow?

- [ ] **Scenario 2 — Outfit Recommendation**
  - User picks one anchor item ("I want to wear my navy sweater")
  - System builds a full outfit around it, adapted to live weather
  - QA: does changing occasion (casual / formal / sport) produce different outfits?
  - QA: does cold weather trigger outerwear? Does warm weather suppress heavy items?

- [ ] **Scenario 3 — Shopping Advice**
  - User asks "Should I buy black jeans?" in chat
  - AI checks wardrobe for duplicates (hard logic, not just LLM guessing)
  - AI gives structured advice: duplicate warning + how many existing outfits it fits into
  - QA: test with items the user has vs. items they don't

### AI Assistant Improvements

- [ ] **Structured "Should I buy?" response**
  - Add hard duplicate-check logic in `assistant.js` before sending to Groq
  - Inject duplicate count + compatible outfit count into the system prompt as facts
  - Response should always follow: duplicate warning → compatibility → verdict

- [ ] **Friendly API error fallback**
  - Current: raw error string shown in chat
  - Fix: catch API errors and show "I'm having trouble connecting, but here's my best advice…" + mock reply

- [ ] **Weather QA**
  - Confirm live weather pulls correctly in header badge
  - Test IP fallback when location is denied — should show a city name, not crash

### Deployment

- [x] App live on GitHub Pages → https://omla903.github.io/SmartWardrobe/
- [ ] Verify all features work on the live URL (not just localhost)
- [ ] Test on the presentation device (not just your laptop)

---

## PRIORITY 2 — Ship if time allows

- [ ] **Duplicate detection on upload**
  - When a new item is digitized, scan existing wardrobe for similar category + color
  - Warn user before saving: "You already have 2 black bottoms — are you sure?"

- [ ] **Outfit compatibility count for "Should I buy?"**
  - When advising on a purchase, calculate how many existing outfits the item slots into
  - Surface this as a number: "This would work in ~4 outfits you can already build"

- [x] **Sensor simulation panel**
  - Dashboard card showing simulated humidity + temperature with live-updating values and fabric care status

- [ ] **Outfit planner — weekly view**
  - 7 day slots on a screen, tap a slot → generate or pick an outfit → save it
  - Show the week plan on the dashboard

- [x] **Flatlay outfit builder + Saved Looks (Looks tab)**
  - Renamed "Outfits" → "Looks"
  - Flatlay builder: vertical stack of slots (outerwear, top, bottom, shoes), tap slot → swap from wardrobe row below
  - Auto-generates outfit on load, refresh button, occasion pills
  - Save built look → appears in saved looks grid
  - Upload full outfit photo → saved as a look card

- [ ] **Connect onboarding answers to outfit logic**
  - If user selected "business" style → outfit generator defaults to business occasion
  - If user selected "neutral colors" → prioritize black/white/grey/navy in picks
  - Quiz answers are already saved in localStorage — just need to wire them up

---

## PRIORITY 3 — Only if everything else is 100% done

- [x] **Style profile — real data**
  - ~~Pull user's name from onboarding (currently hardcoded as "Omar")~~ — done: name collected in onboarding step, shown in dashboard greeting and profile screen
  - Sustainability score: show which items haven't been worn in 30+ days with a nudge

- [ ] **Wardrobe display view**
  - Full-screen TV/tablet mode showing today's outfit
  - Triggered by "Show on display" button on dashboard

- [ ] **Language option** (French / English toggle)

- [ ] **Dataset of clothes / similar items** (for smarter recommendations)

- [ ] **Sustainability ranking** (rank items by wear frequency, flag unused ones)

- [ ] ~~**3D avatar**~~ — out of scope, do not attempt

---

## Demo Prep Checklist 🎯

- [ ] Run through all 3 scenarios back to back — time it, target under 5 minutes
- [ ] Clear localStorage before the demo — start fresh so onboarding shows
- [ ] Pre-add 3–4 real clothing photos before the live demo (skip waiting for AI live)
- [ ] Prepare a fallback — if Groq API is slow, have a screenshot/recording ready
- [ ] Test on the presentation device

---

## Known Issues 🐛

- [ ] Groq API error shows raw error string in chat (fix is Priority 1)
- [ ] Chat history resets on page refresh (by design — no backend, acceptable)
- [ ] Multi-photo detection items share the same category icon (no bounding boxes available — acceptable)
