// ─────────────────────────────────────────────
//  Smart Wardrobe — API Configuration
//  API key is stored in localStorage (never committed to git)
// ─────────────────────────────────────────────

const CONFIG = {
  // Reads key from localStorage — set it once in the Profile screen
  get GROQ_API_KEY() {
    return localStorage.getItem("groq_api_key") || "";
  },

  // Models
  GROQ_VISION_MODEL: "meta-llama/llama-4-scout-17b-16e-instruct",
  GROQ_CHAT_MODEL:   "llama-3.3-70b-versatile",

  // Endpoints
  GROQ_API_URL: "https://api.groq.com/openai/v1/chat/completions",

  // IP Geolocation fallback
  IPAPI_KEY: "",
};
