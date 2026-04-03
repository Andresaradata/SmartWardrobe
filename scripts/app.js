// ═══════════════════════════════════════════════════
//  app.js — App init, routing, screen rendering, UI
// ═══════════════════════════════════════════════════

// ── State ──────────────────────────────────────────
let currentScreen   = "dashboard";
let currentWeather  = null;
let onboardingStep  = 0;
let styleProfile    = {};

// ── Onboarding steps ──────────────────────────────
const ONBOARDING_STEPS = [
  {
    emoji: "👋",
    title: "Welcome to Smart Wardrobe",
    sub: "Your personal AI style assistant. Let's set up your style profile in a few quick questions.",
    type: "info",
  },
  {
    emoji: "🙋",
    title: "What's your name?",
    sub: "So we can make it feel personal.",
    type: "text",
    key: "name",
    placeholder: "Your first name",
  },
  {
    emoji: "👔",
    title: "What's your everyday style?",
    sub: "Pick the one that feels most like you.",
    type: "single",
    key: "baseStyle",
    options: [
      { val: "casual",   emoji: "🧢", label: "Casual — comfort first" },
      { val: "business", emoji: "💼", label: "Business — polished & sharp" },
      { val: "formal",   emoji: "🎩", label: "Formal — classic & refined" },
      { val: "sport",    emoji: "🏃", label: "Athletic — active lifestyle" },
    ],
  },
  {
    emoji: "🎨",
    title: "Neutral or colorful?",
    sub: "How would you describe your color palette?",
    type: "single",
    key: "colorPref",
    options: [
      { val: "neutral",  emoji: "⚪", label: "Mostly neutrals — black, white, grey, beige" },
      { val: "earthy",   emoji: "🟫", label: "Earthy tones — brown, navy, green" },
      { val: "colorful", emoji: "🌈", label: "I love color!" },
      { val: "mixed",    emoji: "🔀", label: "A bit of everything" },
    ],
  },
  {
    emoji: "🌍",
    title: "Sustainability matters to you?",
    sub: "We'll tailor our shopping advice accordingly.",
    type: "single",
    key: "sustainPref",
    options: [
      { val: "high",    emoji: "♻️",  label: "Yes — I try to buy less and rewear more" },
      { val: "medium",  emoji: "🌱",  label: "Somewhat — I'm mindful but practical" },
      { val: "low",     emoji: "🛍️", label: "Not a priority for me right now" },
    ],
  },
];

// ── Seed icons for demo items that have none ───────
// Runs once at startup — Pollinations URLs load lazily, no blocking
// Clear any stale Unsplash URLs left from a previous version
(function _clearBrokenUrls() {
  wardrobe.getAll().forEach(item => {
    if (item.image && item.image.startsWith("https://source.unsplash")) {
      wardrobe.update(item.id, { image: null });
    }
  });
})();

// ── Boot ───────────────────────────────────────────
window.addEventListener("DOMContentLoaded", async () => {
  // Fetch weather in background immediately
  Weather.fetch().then(ctx => {
    currentWeather = ctx;
    _updateWeatherBadge(ctx);
  });

  // Show splash, then decide: onboarding or app
  setTimeout(() => {
    const splash = document.getElementById("splash");
    splash.classList.add("fade-out");

    setTimeout(() => {
      splash.classList.add("hidden");
      if (Profile.exists()) {
        _showApp();
      } else {
        _showOnboarding();
      }
    }, 500);
  }, 2000);
});

// ── Onboarding ─────────────────────────────────────
function _showOnboarding() {
  document.getElementById("onboarding").classList.remove("hidden");
  _renderOnboardingStep();
  _setupOnboardingNav();
}

function _renderOnboardingStep() {
  const step     = ONBOARDING_STEPS[onboardingStep];
  const total    = ONBOARDING_STEPS.length;
  const progress = Math.round(((onboardingStep + 1) / total) * 100);

  document.getElementById("onboardingProgress").style.width = progress + "%";

  const el = document.getElementById("onboardingStep");
  el.innerHTML = `
    <div class="step-emoji">${step.emoji}</div>
    <h2 class="step-title">${step.title}</h2>
    <p class="step-sub">${step.sub}</p>
    ${step.type === "single" ? `
      <div class="step-options">
        ${step.options.map(o => `
          <button class="step-option ${styleProfile[step.key] === o.val ? "selected" : ""}"
                  data-key="${step.key}" data-val="${o.val}">
            <span class="option-emoji">${o.emoji}</span>
            ${o.label}
          </button>
        `).join("")}
      </div>
    ` : step.type === "text" ? `
      <div class="step-options">
        <input id="onboardingTextInput" type="text" class="onboarding-text-input"
               placeholder="${step.placeholder || ""}"
               value="${styleProfile[step.key] || ""}"
               autocomplete="off" />
      </div>
    ` : ""}
  `;

  // Wire option buttons
  el.querySelectorAll(".step-option").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.key;
      const val = btn.dataset.val;
      styleProfile[key] = val;
      el.querySelectorAll(".step-option").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });

  // Wire text input
  const textInput = el.querySelector("#onboardingTextInput");
  if (textInput) {
    textInput.addEventListener("input", () => {
      styleProfile[step.key] = textInput.value.trim();
    });
    textInput.focus();
  }

  // Show/hide back button
  const backBtn = document.getElementById("onboardingBack");
  backBtn.style.display = onboardingStep === 0 ? "none" : "";

  // Last step label
  const nextBtn = document.getElementById("onboardingNext");
  nextBtn.textContent = onboardingStep === total - 1 ? "Get Started" : "Continue";
}

function _setupOnboardingNav() {
  document.getElementById("onboardingNext").addEventListener("click", () => {
    const step = ONBOARDING_STEPS[onboardingStep];

    // Require a selection or name on choice steps
    if (step.type === "single" && !styleProfile[step.key]) {
      showToast("Please pick an option to continue", "error");
      return;
    }
    if (step.type === "text" && !styleProfile[step.key]) {
      showToast("Please enter your name to continue", "error");
      return;
    }

    if (onboardingStep < ONBOARDING_STEPS.length - 1) {
      onboardingStep++;
      _renderOnboardingStep();
    } else {
      // Save profile and launch app
      Profile.save({ ...styleProfile, completedAt: new Date().toISOString() });
      document.getElementById("onboarding").classList.add("hidden");
      _showApp();
    }
  });

  document.getElementById("onboardingBack").addEventListener("click", () => {
    if (onboardingStep > 0) {
      onboardingStep--;
      _renderOnboardingStep();
    }
  });
}

// ── App Shell ──────────────────────────────────────
function _showApp() {
  const app = document.getElementById("app");
  app.classList.remove("hidden");
  lucide.createIcons();
  _setupNav();
  _setupAddModal();
  _setupItemDetailModal();
  _setupScrollShadow();
  navigateTo("dashboard");
}

// Header drop shadow on scroll
function _setupScrollShadow() {
  const main   = document.getElementById("mainContent");
  const header = document.querySelector(".app-header");
  main.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", main.scrollTop > 4);
  }, { passive: true });
}

// ── Navigation ─────────────────────────────────────
function _setupNav() {
  // Tab buttons
  document.querySelectorAll(".nav-btn[data-screen]").forEach(btn => {
    btn.addEventListener("click", () => navigateTo(btn.dataset.screen));
  });

  // Center "+" button opens add modal
  document.getElementById("nav-add").addEventListener("click", openAddModal);

  // Avatar opens profile
  document.getElementById("avatarBtn").addEventListener("click", () => navigateTo("profile"));
}

function navigateTo(screen) {
  currentScreen = screen;

  // Update nav active state
  document.querySelectorAll(".nav-btn[data-screen]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.screen === screen);
  });

  // Render the screen
  const main = document.getElementById("mainContent");
  switch (screen) {
    case "dashboard": main.innerHTML = _renderDashboard(); break;
    case "wardrobe":  main.innerHTML = _renderWardrobe();  break;
    case "outfits":   main.innerHTML = _renderOutfits();   break;
    case "assistant": main.innerHTML = _renderAssistant(); break;
    case "profile":   main.innerHTML = _renderProfile();   break;
  }

  lucide.createIcons();
  _wireScreen(screen);
  _initLazyImages();
}

function _wireScreen(screen) {
  switch (screen) {
    case "wardrobe":  _wireWardrobe();  break;
    case "outfits":   _wireOutfits();   break;
    case "assistant": _wireAssistant(); break;
    case "profile":   _wireProfile();   break;
  }
}

// ── Weather Badge ──────────────────────────────────
function _updateWeatherBadge(ctx) {
  if (!ctx) return;
  document.getElementById("weatherIcon").textContent  = ctx.icon;
  document.getElementById("weatherTemp").textContent  = `${ctx.temp}°C`;
}

// ══════════════════════════════════════════════════
//  SCREENS
// ══════════════════════════════════════════════════

// ── Dashboard ──────────────────────────────────────
function _renderDashboard() {
  const ctx    = currentWeather;
  const stats  = wardrobe.getStats();
  const outfit = OutfitEngine.todaysOutfit();
  const today  = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });

  return `
    <div class="screen">
      <p class="dash-greeting">Good ${_timeOfDay()}, ${Profile.get().name || "there"} 👋</p>
      <p class="dash-date">${today}</p>

      <!-- Weather Card -->
      <div class="weather-card">
        <div class="weather-top">
          <div>
            <div class="weather-temp">${ctx ? ctx.temp + "°" : "--°"}</div>
            <div class="weather-desc">${ctx ? ctx.description : "Loading..."}</div>
            <div class="weather-location">${ctx ? ctx.location : ""}</div>
          </div>
          <div class="weather-icon-big">${ctx ? ctx.icon : "🌡️"}</div>
        </div>
        <div class="weather-meta">
          <div class="weather-meta-item">
            <span class="weather-meta-label">Humidity</span>
            <span class="weather-meta-val">${ctx ? ctx.humidity + "%" : "--"}</span>
          </div>
          <div class="weather-meta-item">
            <span class="weather-meta-label">Wind</span>
            <span class="weather-meta-val">${ctx ? ctx.windSpeed + " km/h" : "--"}</span>
          </div>
          <div class="weather-meta-item">
            <span class="weather-meta-label">Suggestion</span>
            <span class="weather-meta-val" style="font-size:0.7rem">${ctx ? ctx.summary : "—"}</span>
          </div>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-number">${stats.total}</div>
          <div class="stat-label">Items</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.sustainScore ?? 0}%</div>
          <div class="stat-label">Active</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${Object.keys(stats.categories).length}</div>
          <div class="stat-label">Categories</div>
        </div>
      </div>

      <!-- Today's Outfit -->
      <div class="section-header">
        <span class="section-title">Today's Outfit ✨</span>
        <button class="section-link" onclick="navigateTo('outfits')">See more</button>
      </div>

      ${outfit ? `
        <div class="outfit-preview">
          ${_outfitPieceThumb(outfit.tops, "Top")}
          ${_outfitPieceThumb(outfit.bottoms, "Bottom")}
          ${_outfitPieceThumb(outfit.shoes, "Shoes")}
          ${outfit.outerwear ? _outfitPieceThumb(outfit.outerwear, "Outer") : ""}
        </div>
      ` : `
        <div class="card" style="text-align:center;padding:var(--sp-8)">
          <p style="color:var(--clr-text-2)">Add more items to get outfit suggestions ✨</p>
        </div>
      `}

      <!-- Most worn -->
      ${stats.topWorn ? `
        <div class="section-header" style="margin-top:var(--sp-6)">
          <span class="section-title">Your Favourite 💛</span>
        </div>
        <div class="card" style="display:flex;align-items:center;gap:var(--sp-4)">
          <div style="font-size:2.5rem">${CATEGORY_EMOJI[stats.topWorn.category] || "👕"}</div>
          <div>
            <div style="font-weight:700">${stats.topWorn.name || stats.topWorn.category}</div>
            <div style="font-size:var(--text-sm);color:var(--clr-text-2)">Worn ${stats.topWorn.timesWorn} times</div>
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

function _outfitPieceThumb(item, label) {
  if (!item) return "";
  return `
    <div class="outfit-item-card" onclick="openItemDetail('${item.id}')">
      ${_itemIcon(item, { size: "100%", radius: "0" })}
      <div class="outfit-item-label">${label} · ${item.name || item.category}</div>
    </div>
  `;
}

function _timeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

// ── Wardrobe Grid ──────────────────────────────────
function _renderWardrobe(activeFilter = "all") {
  const items = wardrobe.getByCategory(activeFilter);
  const cats  = ["all", "tops", "bottoms", "shoes", "outerwear", "dresses", "accessories"];

  return `
    <div class="screen">
      <p class="screen-title">My Wardrobe</p>
      <p class="screen-subtitle">${wardrobe.getAll().length} items</p>

      <div class="filter-bar">
        ${cats.map(c => `
          <button class="filter-chip ${activeFilter === c ? "active" : ""}"
                  data-cat="${c}">
            ${c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        `).join("")}
      </div>

      <div class="wardrobe-grid" id="wardrobeGrid">
        ${items.length ? items.map(item => `
          <div class="wardrobe-item" data-id="${item.id}" onclick="openItemDetail('${item.id}')">
            ${_itemIcon(item, { size: "100%", radius: "0" })}
            <div class="item-color-dot" style="background:${COLOR_HEX[item.color] || "#888"};${item.color === "white" ? "border:2px solid #ddd" : ""}"></div>
            <div class="item-badge">${item.name || item.category}</div>
          </div>
        `).join("") : `
          <div class="empty-wardrobe">
            <div class="empty-icon">👗</div>
            <p>No items in this category yet.<br/>Tap + to add your first piece.</p>
          </div>
        `}
      </div>
    </div>
  `;
}

function _wireWardrobe() {
  document.querySelectorAll(".filter-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.getElementById("mainContent").innerHTML = _renderWardrobe(chip.dataset.cat);
      lucide.createIcons();
      _wireWardrobe();
    });
  });
}

// ── Outfit Generator ───────────────────────────────
function _renderOutfits() {
  const ctx      = currentWeather;
  const occasions = ["casual", "business", "formal", "sport", "evening", "weekend"];
  const items    = wardrobe.getAll();

  return `
    <div class="screen">
      <p class="screen-title">Outfit Ideas</p>
      <p class="screen-subtitle">AI-powered looks from your wardrobe</p>

      <!-- Weather context bar -->
      <div class="outfit-context-bar">
        <div class="context-weather">
          <span>${ctx ? ctx.icon : "🌡️"}</span>
          <span>${ctx ? `${ctx.temp}°C · ${ctx.summary}` : "Loading weather..."}</span>
        </div>
      </div>

      <!-- Occasion selector -->
      <p style="font-size:var(--text-sm);font-weight:600;margin-bottom:var(--sp-3)">Occasion</p>
      <div class="occasion-pills" id="occasionPills">
        ${occasions.map((o, i) => `
          <button class="occasion-pill ${i === 0 ? "active" : ""}" data-occasion="${o}">
            ${o.charAt(0).toUpperCase() + o.slice(1)}
          </button>
        `).join("")}
      </div>

      <!-- Anchor selector: start with an item -->
      <div class="section-header">
        <span class="section-title">Start with an item</span>
        <span style="font-size:var(--text-xs);color:var(--clr-text-3)">optional</span>
      </div>
      <div style="display:flex;gap:var(--sp-3);overflow-x:auto;padding-bottom:var(--sp-3);margin-bottom:var(--sp-5);scrollbar-width:none">
        <button class="filter-chip active" data-anchor="null" id="anchorNone">Surprise me</button>
        ${items.slice(0, 10).map(i => `
          <button class="filter-chip" data-anchor="${i.id}" style="flex-shrink:0">
            ${CATEGORY_EMOJI[i.category]} ${i.name || i.category}
          </button>
        `).join("")}
      </div>

      <!-- Generate button -->
      <button class="btn-primary" id="generateOutfitBtn" style="margin-top:0;margin-bottom:var(--sp-5)">
        <i data-lucide="sparkles"></i>
        Generate Outfit
      </button>

      <!-- Result -->
      <div id="outfitResult"></div>
    </div>
  `;
}

function _wireOutfits() {
  let selectedOccasion = "casual";
  let selectedAnchorId = null;

  // Occasion pills
  document.querySelectorAll(".occasion-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".occasion-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      selectedOccasion = pill.dataset.occasion;
    });
  });

  // Anchor chips
  document.querySelectorAll("[data-anchor]").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("[data-anchor]").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      selectedAnchorId = chip.dataset.anchor === "null" ? null : chip.dataset.anchor;
    });
  });

  // Generate
  document.getElementById("generateOutfitBtn").addEventListener("click", () => {
    const anchor  = selectedAnchorId ? wardrobe.getById(selectedAnchorId) : null;
    const outfit  = OutfitEngine.generate(anchor, currentWeather, selectedOccasion);
    const resultEl = document.getElementById("outfitResult");

    if (!outfit) {
      resultEl.innerHTML = `<div class="card" style="text-align:center;padding:var(--sp-8)"><p style="color:var(--clr-text-2)">Add more items to get outfit suggestions!</p></div>`;
      return;
    }

    const pieces = [
      { role: "Top",      item: outfit.tops },
      { role: "Bottom",   item: outfit.bottoms },
      { role: "Shoes",    item: outfit.shoes },
      { role: "Outerwear",item: outfit.outerwear },
    ].filter(p => p.item);

    resultEl.innerHTML = `
      <div class="outfit-result-card">
        <div class="outfit-result-header">
          <span class="outfit-result-title">✨ Your ${selectedOccasion} look</span>
          <button class="btn-secondary" id="refreshOutfitBtn" style="padding:var(--sp-2) var(--sp-3);font-size:var(--text-xs)">
            <i data-lucide="refresh-cw"></i> Refresh
          </button>
        </div>
        <div class="outfit-result-items">
          ${pieces.map(p => `
            <div class="outfit-piece" onclick="openItemDetail('${p.item.id}')">
              <div class="outfit-piece-img">
                ${_itemIcon(p.item, { size: "56px", radius: "var(--radius-sm)" })}
              </div>
              <div class="outfit-piece-info">
                <div class="outfit-piece-role">${p.role}</div>
                <div class="outfit-piece-name">${p.item.name || p.item.category}</div>
                ${p.item.brand ? `<div style="font-size:var(--text-xs);color:var(--clr-text-3)">${p.item.brand}</div>` : ""}
              </div>
            </div>
          `).join("")}
        </div>
        <div class="outfit-actions">
          <button class="btn-wear" id="wearOutfitBtn" style="flex:1">
            <i data-lucide="check-circle"></i> Wear this today
          </button>
        </div>
      </div>
    `;
    lucide.createIcons();

    // Refresh
    document.getElementById("refreshOutfitBtn").addEventListener("click", () => {
      const newAnchor = selectedAnchorId ? wardrobe.getById(selectedAnchorId) : null;
      const newOutfit = OutfitEngine.generate(newAnchor, currentWeather, selectedOccasion);
      if (newOutfit) {
        // Re-render result by clicking generate again
        document.getElementById("generateOutfitBtn").click();
      }
    });

    // Mark all pieces as worn
    document.getElementById("wearOutfitBtn").addEventListener("click", () => {
      pieces.forEach(p => wardrobe.markWorn(p.item.id));
      showToast("Outfit logged! Wear count updated 👗", "success");
    });
  });
}

// ── AI Assistant ───────────────────────────────────
function _renderAssistant() {
  return `
    <div class="chat-container">
      <div class="chat-messages" id="chatMessages">
        <div class="chat-bubble ai">
          Hey! I'm Wardi, your AI wardrobe assistant 👋<br/><br/>
          Ask me anything — outfit ideas, whether to buy something new, or what to wear for a specific occasion.
        </div>
      </div>

      <div class="chat-quick-replies">
        <button class="quick-reply" data-msg="What should I wear today?">What to wear today?</button>
        <button class="quick-reply" data-msg="I'm thinking about buying black jeans. What do you think?">Buy black jeans?</button>
        <button class="quick-reply" data-msg="What outfit would work for a business meeting?">Business outfit?</button>
        <button class="quick-reply" data-msg="Which of my clothes haven't I worn in a while?">Neglected items?</button>
      </div>

      <div class="chat-input-bar">
        <input type="text" id="chatInput" class="chat-input" placeholder="Ask me anything..." />
        <button class="chat-send-btn" id="chatSendBtn">
          <i data-lucide="send"></i>
        </button>
      </div>
    </div>
  `;
}

function _wireAssistant() {
  const input   = document.getElementById("chatInput");
  const sendBtn = document.getElementById("chatSendBtn");
  const messages = document.getElementById("chatMessages");

  async function sendMessage(text) {
    if (!text.trim()) return;
    input.value = "";

    // User bubble
    messages.insertAdjacentHTML("beforeend", `<div class="chat-bubble user">${_escapeHtml(text)}</div>`);

    // Typing indicator
    messages.insertAdjacentHTML("beforeend", `
      <div class="chat-bubble typing" id="typingIndicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `);
    messages.scrollTop = messages.scrollHeight;

    // Get reply
    const reply = await Assistant.send(text);

    // Remove typing indicator
    document.getElementById("typingIndicator")?.remove();

    // AI bubble — escape HTML then convert newlines to <br> for formatting
    messages.insertAdjacentHTML("beforeend", `<div class="chat-bubble ai">${_escapeHtml(reply).replace(/\n/g, "<br>")}</div>`);
    messages.scrollTop = messages.scrollHeight;
  }

  sendBtn.addEventListener("click", () => sendMessage(input.value));
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") sendMessage(input.value); });

  // Quick replies
  document.querySelectorAll(".quick-reply").forEach(btn => {
    btn.addEventListener("click", () => sendMessage(btn.dataset.msg));
  });
}

// ── Profile ────────────────────────────────────────
function _renderProfile() {
  const stats   = wardrobe.getStats();
  const profile = Profile.get() || {};

  // Style breakdown from wardrobe
  const totalStyleTags = Object.values(stats.styles || {}).reduce((s, v) => s + v, 0) || 1;
  const styleRows = Object.entries(stats.styles || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([style, count]) => ({
      label: style.charAt(0).toUpperCase() + style.slice(1),
      pct:   Math.round((count / totalStyleTags) * 100),
    }));

  // Top colors
  const topColors = Object.entries(stats.colors || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Sustainability ring (SVG)
  const score = stats.sustainScore ?? 0;
  const circumference = 2 * Math.PI * 28; // r=28
  const dashOffset = circumference - (score / 100) * circumference;

  return `
    <div class="screen">
      <div class="profile-header">
        <div class="profile-avatar">${(profile.name || "?")[0].toUpperCase()}</div>
        <div class="profile-name">${profile.name || "You"}</div>
        <div class="profile-style-tag">✦ ${_styleLabel(profile.baseStyle)}</div>
      </div>

      <!-- Wardrobe stats -->
      <div class="stats-row" style="margin-bottom:var(--sp-5)">
        <div class="stat-card">
          <div class="stat-number">${stats.total}</div>
          <div class="stat-label">Total Items</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.topWorn?.timesWorn || 0}</div>
          <div class="stat-label">Max Wears</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${Object.keys(stats.categories || {}).length}</div>
          <div class="stat-label">Categories</div>
        </div>
      </div>

      <!-- Style Breakdown -->
      <div class="card" style="margin-bottom:var(--sp-4)">
        <div class="section-header" style="margin-bottom:var(--sp-4)">
          <span class="section-title">Style DNA</span>
        </div>
        <div class="style-breakdown">
          ${styleRows.length ? styleRows.map(row => `
            <div class="style-row">
              <span class="style-label">${row.label}</span>
              <div class="style-bar-track">
                <div class="style-bar-fill" style="width:${row.pct}%"></div>
              </div>
              <span class="style-pct">${row.pct}%</span>
            </div>
          `).join("") : `<p style="color:var(--clr-text-3);font-size:var(--text-sm)">Add items to see your style DNA</p>`}
        </div>
      </div>

      <!-- Color Palette -->
      <div class="card" style="margin-bottom:var(--sp-4)">
        <div class="section-header" style="margin-bottom:var(--sp-4)">
          <span class="section-title">Your Palette</span>
        </div>
        <div class="color-palette">
          ${topColors.map(([color]) => `
            <div class="palette-swatch">
              <div class="swatch-circle" style="background:${COLOR_HEX[color] || "#ccc"};${color === "white" ? "border:2px solid #ddd" : ""}"></div>
              <span class="swatch-label">${color}</span>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Sustainability -->
      <div class="card">
        <div class="section-header" style="margin-bottom:var(--sp-4)">
          <span class="section-title">Sustainability Score</span>
        </div>
        <div class="sustain-score">
          <svg class="score-ring" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="var(--clr-surface-2)" stroke-width="6"/>
            <circle cx="32" cy="32" r="28" fill="none" stroke="var(--clr-primary)" stroke-width="6"
              stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"
              stroke-linecap="round" transform="rotate(-90 32 32)"/>
            <text x="32" y="37" text-anchor="middle" class="score-ring-text">${score}%</text>
          </svg>
          <div class="score-details">
            <div class="score-title">${_sustainTitle(score)}</div>
            <div class="score-desc">${_sustainDesc(score, stats.total)}</div>
          </div>
        </div>
      </div>

    </div>
  `;
}

function _wireProfile() {
  // Animate bars after render
  setTimeout(() => {
    document.querySelectorAll(".style-bar-fill").forEach(bar => {
      const target = bar.style.width;
      bar.style.width = "0%";
      requestAnimationFrame(() => { bar.style.width = target; });
    });
  }, 50);
}

function _styleLabel(base) {
  const labels = { casual: "Casual Style", business: "Business Style", formal: "Formal Style", sport: "Athletic Style" };
  return labels[base] || "Personal Style";
}

function _sustainTitle(score) {
  if (score >= 70) return "Sustainable Champion 🌿";
  if (score >= 40) return "Mindful Dresser 🌱";
  return "Room to Improve ♻️";
}

function _sustainDesc(score, total) {
  if (score >= 70) return `You've worn ${score}% of your wardrobe in the last 30 days. Excellent rotation!`;
  if (score >= 40) return `${score}% of your items worn recently. Try revisiting pieces you haven't worn in a while.`;
  return `Only ${score}% of your ${total} items worn in the last 30 days. Consider rewearing more before buying new.`;
}

// ══════════════════════════════════════════════════
//  ADD ITEM MODAL — supports multi-item detection
// ══════════════════════════════════════════════════

let _pendingImage  = null;  // base64 compressed photo
let _detectedItems = [];    // array of items detected by AI (may be >1)

function openAddModal() {
  _pendingImage  = null;
  _detectedItems = [];
  _showUploadStep();
  document.getElementById("addModal").classList.remove("hidden");
  lucide.createIcons();
}

function closeAddModal() {
  document.getElementById("addModal").classList.add("hidden");
}

function _setupAddModal() {
  document.getElementById("addModalBackdrop").addEventListener("click", closeAddModal);
  document.getElementById("cancelAddBtn").addEventListener("click", closeAddModal);

  document.getElementById("uploadZone").addEventListener("click", (e) => {
    if (e.target.closest(".detecting-overlay")) return;
    document.getElementById("fileInput").click();
  });

  document.getElementById("fileInput").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const compressed = await compressImage(file);
    _pendingImage = compressed;
    _showImagePreview(compressed);

    // Show detecting overlay
    document.getElementById("detectingOverlay").classList.remove("hidden");

    // Detect all items in photo
    const items = await Recognition.analyzeMultiple(compressed);
    document.getElementById("detectingOverlay").classList.add("hidden");

    _detectedItems = items;

    if (items.length > 1) {
      // Multiple items — switch to review mode
      _showMultiItemReview(items, compressed);
    } else {
      // Single item — fill the standard form, pre-generate icon as fallback
      const detected = items[0];
      _applyRecognitionResult(detected);
      // Store the generated icon URL; will be overridden by real photo if user uploaded one
      if (!_pendingImage) {
        _pendingImage = Recognition.generateIcon(detected);
      }
      document.getElementById("itemForm").classList.remove("hidden");
      document.getElementById("saveItemBtn").classList.remove("hidden");
      document.getElementById("cancelAddBtn").classList.remove("hidden");
    }

    e.target.value = "";
  });

  document.getElementById("saveItemBtn").addEventListener("click", _saveSingleItem);

  _setupSelectionGrid("categorySelect", false);
  _setupSelectionGrid("colorSelect",    false);
  _setupSelectionGrid("seasonSelect",   true);
  _setupSelectionGrid("warmthSelect",   false);
  _setupTagGrid();
}

// ── Upload step (initial state) ────────────────────
function _showUploadStep() {
  const zone = document.getElementById("uploadZone");
  zone.classList.remove("has-image");
  document.getElementById("uploadContent").classList.remove("hidden");
  document.getElementById("detectingOverlay").classList.add("hidden");
  zone.querySelectorAll("img.preview-img").forEach(el => el.remove());

  // Reset form to defaults
  _setActive("categorySelect", "tops");
  _setActive("colorSelect",    "black");
  _setActive("warmthSelect",   "1");
  document.querySelectorAll("#seasonSelect .sel-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll("#tagSelect .tag-btn").forEach(b => b.classList.remove("active"));
  ["itemName","itemBrand","itemTimesWorn","itemLastWorn"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  // Show/hide correct sections
  document.getElementById("itemForm").classList.add("hidden");
  document.getElementById("saveItemBtn").classList.add("hidden");

  // Remove any multi-item review if present
  document.getElementById("multiItemReview")?.remove();
}

function _showImagePreview(base64) {
  const zone = document.getElementById("uploadZone");
  zone.classList.add("has-image");
  document.getElementById("uploadContent").classList.add("hidden");
  zone.querySelectorAll("img.preview-img").forEach(el => el.remove());

  const img = document.createElement("img");
  img.src = base64;
  img.className = "preview-img";
  img.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:calc(var(--radius-lg) - 2px)";
  zone.insertBefore(img, zone.querySelector(".detecting-overlay"));
}

// ── Multi-item review UI ───────────────────────────
function _showMultiItemReview(items, photoBase64) {
  document.getElementById("itemForm").classList.add("hidden");
  document.getElementById("saveItemBtn").classList.add("hidden");
  document.getElementById("cancelAddBtn").classList.add("hidden");
  document.getElementById("multiItemReview")?.remove();

  // Generate icon URLs for all items immediately (Pollinations builds lazily)
  items.forEach(item => {
    if (!item._iconUrl) item._iconUrl = Recognition.generateIcon(item);
  });

  const reviewHtml = `
    <div id="multiItemReview">
      <p style="font-size:var(--text-sm);color:var(--clr-text-2);margin-bottom:var(--sp-4)">
        ✦ AI detected <strong>${items.length} items</strong> — icons are generating.
        Review and save.
      </p>

      <div id="detectedItemsList">
        ${items.map((item, i) => _renderDetectedItemCard(item, i)).join("")}
      </div>

      <div style="border-top:1px solid var(--clr-border);padding-top:var(--sp-4);margin-top:var(--sp-2)">
        <p style="font-size:var(--text-xs);color:var(--clr-text-3);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:var(--sp-3)">Apply to all items (optional)</p>
        <input type="text"   id="batchBrand"      class="text-input"    placeholder="Brand (e.g. Zara)"       style="margin-bottom:var(--sp-3)" />
        <input type="number" id="batchTimesWorn"  class="number-input"  placeholder="Times worn (e.g. 5)"     style="margin-bottom:var(--sp-3)" min="0" />
        <input type="date"   id="batchLastWorn"   class="text-input" />
      </div>

      <button class="btn-primary" id="saveAllItemsBtn" style="margin-top:var(--sp-5)">
        <i data-lucide="check"></i>
        Save all ${items.length} items to Wardrobe
      </button>
      <button class="btn-ghost" id="cancelMultiBtn">Cancel</button>
    </div>
  `;

  document.getElementById("uploadZone").insertAdjacentHTML("afterend", reviewHtml);
  lucide.createIcons();

  document.querySelectorAll(".remove-detected-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.idx);
      _detectedItems.splice(idx, 1);
      if (_detectedItems.length === 0) { closeAddModal(); return; }
      _showMultiItemReview(_detectedItems, photoBase64);
    });
  });

  document.getElementById("saveAllItemsBtn").addEventListener("click", () => _saveAllDetectedItems());
  document.getElementById("cancelMultiBtn").addEventListener("click", closeAddModal);
}

function _renderDetectedItemCard(item, idx) {
  const iconUrl = item._iconUrl || "";

  return `
    <div class="detected-item-card" id="detectedCard_${idx}" style="
      background:var(--clr-surface-2);
      border:1.5px solid var(--clr-border);
      border-radius:var(--radius-lg);
      padding:var(--sp-4);
      margin-bottom:var(--sp-3);
    ">
      <div style="display:flex;align-items:flex-start;gap:var(--sp-3);margin-bottom:var(--sp-3)">

        <!-- Product icon -->
        <div style="width:72px;height:72px;flex-shrink:0;border-radius:var(--radius-md);overflow:hidden">
          ${_itemIcon(item, { size: "72px", radius: "var(--radius-md)" })}
        </div>

        <div style="flex:1">
          <div style="font-weight:700;font-size:var(--text-sm);margin-bottom:2px">${item.name || item.category}</div>
          <div style="font-size:var(--text-xs);color:var(--clr-text-2);text-transform:capitalize;margin-bottom:var(--sp-2)">
            ${item.color} · ${item.category}
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:4px">
            ${(item.season||[]).map(s => `<span class="item-tag">${s}</span>`).join("")}
            ${(item.style||[]).slice(0,2).map(s => `<span class="item-tag">${s}</span>`).join("")}
          </div>
        </div>

        <button class="remove-detected-btn" data-idx="${idx}" style="
          width:28px;height:28px;border-radius:50%;background:#fee2e2;
          color:var(--clr-error);font-size:1.1rem;font-weight:700;
          display:flex;align-items:center;justify-content:center;flex-shrink:0;
        ">×</button>
      </div>

      <!-- Editable name -->
      <input type="text" class="text-input detected-name" data-idx="${idx}"
        placeholder="Item name (optional)" value="${item.name || ""}"
        style="font-size:var(--text-sm)" />
    </div>
  `;
}

function _saveAllDetectedItems() {
  const brand     = document.getElementById("batchBrand")?.value.trim() || "";
  const timesWorn = document.getElementById("batchTimesWorn")?.value    || 0;
  const lastWorn  = document.getElementById("batchLastWorn")?.value     || null;

  // Sync edited names back to _detectedItems
  document.querySelectorAll(".detected-name").forEach(input => {
    const idx = parseInt(input.dataset.idx);
    if (_detectedItems[idx]) _detectedItems[idx].name = input.value.trim();
  });

  _detectedItems.forEach(item => {
    wardrobe.add({
      ...item,
      brand,
      timesWorn,
      lastWorn,
      image: item._iconUrl || null, // generated product icon URL
    });
  });

  closeAddModal();
  showToast(`${_detectedItems.length} items added to wardrobe ✓`, "success");

  if (currentScreen === "wardrobe")  navigateTo("wardrobe");
  if (currentScreen === "dashboard") navigateTo("dashboard");
}

// ── Single item helpers ────────────────────────────
function _applyRecognitionResult(result) {
  if (!result) return;
  if (result.category) _setActive("categorySelect", result.category);
  if (result.color)    _setActive("colorSelect",    result.color);
  if (result.warmth)   _setActive("warmthSelect",   String(result.warmth));

  if (result.season) {
    document.querySelectorAll("#seasonSelect .sel-btn").forEach(b => {
      b.classList.toggle("active", result.season.includes(b.dataset.val));
    });
  }
  if (result.style) {
    document.querySelectorAll("#tagSelect .tag-btn").forEach(b => {
      b.classList.toggle("active", result.style.includes(b.dataset.val));
    });
  }
  if (result.name) document.getElementById("itemName").value = result.name;
}

function _setupSelectionGrid(containerId, multiSelect) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll("[data-val]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (multiSelect) {
        btn.classList.toggle("active");
      } else {
        container.querySelectorAll("[data-val]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      }
    });
  });
}

function _setupTagGrid() {
  document.querySelectorAll("#tagSelect .tag-btn").forEach(btn => {
    btn.addEventListener("click", () => btn.classList.toggle("active"));
  });
}

function _setActive(containerId, val) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll("[data-val]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.val === val);
  });
}

function _getSelected(containerId) {
  const active = document.querySelector(`#${containerId} [data-val].active`);
  return active ? active.dataset.val : null;
}

function _getMultiSelected(containerId) {
  return [...document.querySelectorAll(`#${containerId} [data-val].active`)].map(b => b.dataset.val);
}

function _saveSingleItem() {
  const category = _getSelected("categorySelect");
  const color    = _getSelected("colorSelect");
  const warmth   = parseInt(_getSelected("warmthSelect") || "1");
  const season   = _getMultiSelected("seasonSelect");
  const style    = _getMultiSelected("tagSelect");

  if (!category) { showToast("Please select a category", "error"); return; }
  if (!color)    { showToast("Please select a color",    "error"); return; }
  if (!season.length) { showToast("Please select at least one season", "error"); return; }

  const item = wardrobe.add({
    name:      document.getElementById("itemName").value.trim(),
    brand:     document.getElementById("itemBrand").value.trim(),
    timesWorn: document.getElementById("itemTimesWorn").value || 0,
    lastWorn:  document.getElementById("itemLastWorn").value  || null,
    category, color, warmth, season, style,
    image: _pendingImage,
  });

  closeAddModal();
  showToast(`${item.name || "Item"} added to wardrobe ✓`, "success");

  if (currentScreen === "wardrobe")  navigateTo("wardrobe");
  if (currentScreen === "dashboard") navigateTo("dashboard");
}

// ══════════════════════════════════════════════════
//  ITEM DETAIL MODAL
// ══════════════════════════════════════════════════

function openItemDetail(id) {
  const item = wardrobe.getById(id);
  if (!item) return;

  const modal   = document.getElementById("itemDetailModal");
  const content = document.getElementById("itemDetailContent");

  content.innerHTML = `
    <div style="margin-bottom:var(--sp-4);border-radius:var(--radius-lg);overflow:hidden;aspect-ratio:1">
      ${_itemIcon(item, { size: "100%", radius: "var(--radius-lg)", fontSize: "5rem" })}
    </div>

    <div class="item-detail-name">${item.name || item.category}</div>
    ${item.brand ? `<div class="item-detail-brand">${item.brand}</div>` : ""}

    <div class="item-stats-row">
      <div class="item-stat">
        <div class="item-stat-val">${item.timesWorn || 0}</div>
        <div class="item-stat-label">Times worn</div>
      </div>
      <div class="item-stat">
        <div class="item-stat-val" style="font-size:var(--text-sm)">${item.lastWorn || "—"}</div>
        <div class="item-stat-label">Last worn</div>
      </div>
      <div class="item-stat">
        <div class="item-stat-val" style="font-size:var(--text-sm)">${item.addedAt}</div>
        <div class="item-stat-label">Added</div>
      </div>
    </div>

    <div class="item-detail-tags">
      <span class="item-tag" style="background:${COLOR_HEX[item.color]};color:${item.color === 'white' || item.color === 'beige' ? '#333' : '#fff'}">
        ${item.color}
      </span>
      <span class="item-tag">${item.category}</span>
      ${(item.season || []).map(s => `<span class="item-tag">${s}</span>`).join("")}
      ${(item.style  || []).map(s => `<span class="item-tag">${s}</span>`).join("")}
    </div>

    <div class="item-detail-actions">
      <button class="btn-wear" id="wearItemBtn">
        <i data-lucide="check-circle"></i> Wear today
      </button>
      <button class="btn-delete" id="deleteItemBtn">
        <i data-lucide="trash-2"></i> Remove
      </button>
    </div>
  `;

  modal.classList.remove("hidden");
  lucide.createIcons();

  document.getElementById("wearItemBtn").addEventListener("click", () => {
    wardrobe.markWorn(id);
    showToast("Outfit logged! Wear count updated ✓", "success");
    closeItemDetail();
    if (currentScreen === "wardrobe")   navigateTo("wardrobe");
    if (currentScreen === "dashboard")  navigateTo("dashboard");
  });

  document.getElementById("deleteItemBtn").addEventListener("click", () => {
    if (confirm(`Remove "${item.name || item.category}" from your wardrobe?`)) {
      wardrobe.remove(id);
      closeItemDetail();
      showToast("Item removed", "");
      if (currentScreen === "wardrobe")   navigateTo("wardrobe");
      if (currentScreen === "dashboard")  navigateTo("dashboard");
    }
  });
}

function closeItemDetail() {
  document.getElementById("itemDetailModal").classList.add("hidden");
}

function _setupItemDetailModal() {
  document.getElementById("itemDetailBackdrop").addEventListener("click", closeItemDetail);
}

// ══════════════════════════════════════════════════
//  UTILITIES
// ══════════════════════════════════════════════════

// ── Item icon renderer ─────────────────────────────
// If item has a real photo → show it. Otherwise → SVG clothing silhouette.
function _itemIcon(item, { size = "100%", radius = "var(--radius-md)", fontSize = "1.4rem" } = {}) {
  if (item.image && !item.image.startsWith("https://source.unsplash")) {
    // Real uploaded photo
    return `<img src="${item.image}" alt="${item.name || item.category}"
      style="width:${size};height:${size};object-fit:cover;border-radius:${radius}"
      onload="this.classList.add('loaded')" onerror="this.style.display='none'"
      class="lazy" />`;
  }

  // SVG icon card
  const tint     = COLOR_TINT[item.color]  || "#f0f0f5";
  const iconClr  = COLOR_ICON[item.color]  || "#333";
  const svgPath  = CATEGORY_SVG[item.category] || CATEGORY_SVG.tops;

  return `
    <div style="
      width:${size};height:${size};
      background:${tint};
      border-radius:${radius};
      display:flex;align-items:center;justify-content:center;
      overflow:hidden;position:relative;
    ">
      <svg viewBox="0 0 24 24" style="width:65%;height:65%;color:${iconClr}"
        xmlns="http://www.w3.org/2000/svg">
        ${svgPath}
      </svg>
    </div>`;
}

// ── Lazy image fade-in ─────────────────────────────
function _initLazyImages() {
  document.querySelectorAll("img:not(.lazy-init)").forEach(img => {
    img.classList.add("lazy", "lazy-init");
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add("loaded");
    } else {
      img.addEventListener("load",  () => img.classList.add("loaded"), { once: true });
      img.addEventListener("error", () => img.classList.add("loaded"), { once: true });
    }
  });

  // Add skeleton class to wardrobe items while image is loading
  document.querySelectorAll(".wardrobe-item").forEach(card => {
    const img = card.querySelector("img");
    if (!img) return;
    if (!img.complete || img.naturalWidth === 0) {
      card.classList.add("loading");
      img.addEventListener("load",  () => card.classList.remove("loading"), { once: true });
      img.addEventListener("error", () => card.classList.remove("loading"), { once: true });
    }
  });
}

function showToast(message, type = "") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className   = `toast ${type} show`;
  setTimeout(() => { toast.classList.remove("show"); }, 3000);
}

function _escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
