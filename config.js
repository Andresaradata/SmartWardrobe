// ─────────────────────────────────────────────
//  Smart Wardrobe — API Configuration
//  Drop your keys here. This file is gitignored.
// ─────────────────────────────────────────────

const CONFIG = {
  GROQ_API_KEY: "", // Add your Groq API key here for local use — do not commit a real key

  // Models
  GROQ_VISION_MODEL: "meta-llama/llama-4-scout-17b-16e-instruct",
  GROQ_CHAT_MODEL:   "llama-3.3-70b-versatile",

  // Endpoints
  GROQ_API_URL: "https://api.groq.com/openai/v1/chat/completions",

  // IP Geolocation — used as fallback when browser location is denied
  // Get a free key at: https://ipapi.co/  (leave empty string to use free tier)
  IPAPI_KEY: "",
};
