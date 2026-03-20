// ═══════════════════════════════════════════════════
//  wardrobe.js — Data model, CRUD, localStorage
// ═══════════════════════════════════════════════════

const STORAGE_KEY = "sw_wardrobe_v1";
const PROFILE_KEY = "sw_profile_v1";

// ── Color hex map (for UI rendering) ──────────────
const COLOR_HEX = {
  black:  "#111111",
  white:  "#f5f5f5",
  navy:   "#1a2e5a",
  grey:   "#888888",
  beige:  "#d4b896",
  brown:  "#7b4f2e",
  green:  "#2d6a4f",
  blue:   "#2563eb",
  red:    "#dc2626",
  pink:   "#ec4899",
};

// ── Emoji fallbacks per category ──────────────────
const CATEGORY_EMOJI = {
  tops:        "👕",
  bottoms:     "👖",
  shoes:       "👟",
  outerwear:   "🧥",
  accessories: "💍",
  dresses:     "👗",
};

// ── Demo data (pre-loaded so app never looks empty) ──
const DEMO_ITEMS = [
  {
    id: "demo_1",
    name: "White Linen Shirt",
    brand: "Uniqlo",
    category: "tops",
    color: "white",
    season: ["spring", "summer"],
    warmth: 1,
    style: ["casual", "business"],
    image: null,
    timesWorn: 14,
    lastWorn: "2026-03-18",
    addedAt: "2026-01-10",
  },
  {
    id: "demo_2",
    name: "Black Slim Jeans",
    brand: "Zara",
    category: "bottoms",
    color: "black",
    season: ["spring", "autumn", "winter"],
    warmth: 2,
    style: ["casual", "evening"],
    image: null,
    timesWorn: 22,
    lastWorn: "2026-03-19",
    addedAt: "2026-01-10",
  },
  {
    id: "demo_3",
    name: "Navy Wool Sweater",
    brand: "H&M",
    category: "tops",
    color: "navy",
    season: ["autumn", "winter"],
    warmth: 3,
    style: ["casual", "weekend"],
    image: null,
    timesWorn: 9,
    lastWorn: "2026-03-15",
    addedAt: "2026-01-12",
  },
  {
    id: "demo_4",
    name: "White Sneakers",
    brand: "Nike",
    category: "shoes",
    color: "white",
    season: ["spring", "summer", "autumn"],
    warmth: 1,
    style: ["casual", "sport", "weekend"],
    image: null,
    timesWorn: 30,
    lastWorn: "2026-03-20",
    addedAt: "2026-01-10",
  },
  {
    id: "demo_5",
    name: "Camel Trench Coat",
    brand: "Mango",
    category: "outerwear",
    color: "beige",
    season: ["spring", "autumn"],
    warmth: 2,
    style: ["business", "formal", "casual"],
    image: null,
    timesWorn: 7,
    lastWorn: "2026-03-17",
    addedAt: "2026-01-15",
  },
  {
    id: "demo_6",
    name: "Grey Chinos",
    brand: "Zara",
    category: "bottoms",
    color: "grey",
    season: ["spring", "autumn", "winter"],
    warmth: 2,
    style: ["business", "casual"],
    image: null,
    timesWorn: 11,
    lastWorn: "2026-03-14",
    addedAt: "2026-01-18",
  },
  {
    id: "demo_7",
    name: "Black Leather Jacket",
    brand: "AllSaints",
    category: "outerwear",
    color: "black",
    season: ["spring", "autumn"],
    warmth: 2,
    style: ["casual", "evening"],
    image: null,
    timesWorn: 6,
    lastWorn: "2026-03-12",
    addedAt: "2026-02-01",
  },
  {
    id: "demo_8",
    name: "Brown Chelsea Boots",
    brand: "Clarks",
    category: "shoes",
    color: "brown",
    season: ["autumn", "winter"],
    warmth: 3,
    style: ["business", "casual", "formal"],
    image: null,
    timesWorn: 16,
    lastWorn: "2026-03-16",
    addedAt: "2026-01-20",
  },
  {
    id: "demo_9",
    name: "Striped Linen Tee",
    brand: "COS",
    category: "tops",
    color: "navy",
    season: ["spring", "summer"],
    warmth: 1,
    style: ["casual", "weekend"],
    image: null,
    timesWorn: 5,
    lastWorn: "2026-03-10",
    addedAt: "2026-02-10",
  },
  {
    id: "demo_10",
    name: "Beige Linen Trousers",
    brand: "Uniqlo",
    category: "bottoms",
    color: "beige",
    season: ["spring", "summer"],
    warmth: 1,
    style: ["casual", "weekend", "business"],
    image: null,
    timesWorn: 4,
    lastWorn: "2026-03-08",
    addedAt: "2026-02-14",
  },
  {
    id: "demo_11",
    name: "Slim Suit Jacket",
    brand: "Boss",
    category: "outerwear",
    color: "navy",
    season: ["spring", "autumn", "winter"],
    warmth: 2,
    style: ["formal", "business"],
    image: null,
    timesWorn: 3,
    lastWorn: "2026-03-05",
    addedAt: "2026-02-20",
  },
  {
    id: "demo_12",
    name: "Grey Hoodie",
    brand: "Champion",
    category: "tops",
    color: "grey",
    season: ["autumn", "winter"],
    warmth: 2,
    style: ["casual", "sport", "weekend"],
    image: null,
    timesWorn: 18,
    lastWorn: "2026-03-19",
    addedAt: "2026-01-22",
  },
];

// ── Wardrobe class ─────────────────────────────────
class Wardrobe {
  constructor() {
    this._items = this._load();
  }

  // Load from localStorage, seed with demo if empty
  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("Failed to load wardrobe from storage", e);
    }
    // First time — seed with demo data
    this._save(DEMO_ITEMS);
    return [...DEMO_ITEMS];
  }

  _save(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to save wardrobe", e);
    }
  }

  // ── Read ────────────────────────────────────────
  getAll() {
    return [...this._items];
  }

  getById(id) {
    return this._items.find(i => i.id === id) || null;
  }

  getByCategory(category) {
    if (category === "all") return this.getAll();
    return this._items.filter(i => i.category === category);
  }

  // ── Create ──────────────────────────────────────
  add(itemData) {
    const item = {
      id:        `item_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
      name:      itemData.name      || "",
      brand:     itemData.brand     || "",
      category:  itemData.category  || "tops",
      color:     itemData.color     || "black",
      season:    itemData.season    || ["all"],
      warmth:    itemData.warmth    || 1,
      style:     itemData.style     || [],
      image:     itemData.image     || null, // base64 thumbnail or null
      timesWorn: Number(itemData.timesWorn) || 0,
      lastWorn:  itemData.lastWorn  || null,
      addedAt:   new Date().toISOString().split("T")[0],
    };
    this._items.unshift(item); // newest first
    this._save(this._items);
    return item;
  }

  // ── Update ──────────────────────────────────────
  update(id, changes) {
    const idx = this._items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    this._items[idx] = { ...this._items[idx], ...changes };
    this._save(this._items);
    return this._items[idx];
  }

  // Mark an item as worn today
  markWorn(id) {
    const today = new Date().toISOString().split("T")[0];
    return this.update(id, {
      timesWorn: (this.getById(id)?.timesWorn || 0) + 1,
      lastWorn:  today,
    });
  }

  // ── Delete ──────────────────────────────────────
  remove(id) {
    const before = this._items.length;
    this._items = this._items.filter(i => i.id !== id);
    if (this._items.length < before) {
      this._save(this._items);
      return true;
    }
    return false;
  }

  // ── Stats (used by Dashboard & Profile) ─────────
  getStats() {
    const items = this.getAll();
    if (!items.length) return { total: 0, categories: {}, colors: {}, styles: {}, topWorn: null };

    // Category breakdown
    const categories = {};
    items.forEach(i => {
      categories[i.category] = (categories[i.category] || 0) + 1;
    });

    // Color breakdown
    const colors = {};
    items.forEach(i => {
      colors[i.color] = (colors[i.color] || 0) + 1;
    });

    // Style breakdown
    const styles = {};
    items.forEach(i => {
      (i.style || []).forEach(s => {
        styles[s] = (styles[s] || 0) + 1;
      });
    });

    // Most worn item
    const topWorn = [...items].sort((a, b) => (b.timesWorn || 0) - (a.timesWorn || 0))[0];

    // Sustainability score: ratio of items worn in last 30 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const recentlyWorn = items.filter(i => {
      if (!i.lastWorn) return false;
      return new Date(i.lastWorn) >= cutoff;
    }).length;
    const sustainScore = Math.round((recentlyWorn / items.length) * 100);

    return {
      total:        items.length,
      categories,
      colors,
      styles,
      topWorn,
      sustainScore,
    };
  }
}

// ── Profile (style preferences from onboarding) ───
const Profile = {
  get() {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  save(data) {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to save profile", e);
    }
  },
  exists() {
    return !!this.get();
  },
};

// ── Helpers ────────────────────────────────────────

// Compress an image file to a base64 thumbnail (max 400px)
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 400;
        let w = img.width;
        let h = img.height;
        if (w > h && w > MAX) { h = (h * MAX) / w; w = MAX; }
        else if (h > MAX)     { w = (w * MAX) / h; h = MAX; }

        const canvas = document.createElement("canvas");
        canvas.width  = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Generate a unique id (used outside Wardrobe class if needed)
function generateId() {
  return `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// Singleton
const wardrobe = new Wardrobe();
