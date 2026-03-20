// ═══════════════════════════════════════════════════
//  recognition.js — Clothing recognition via Groq Vision
// ═══════════════════════════════════════════════════

const Recognition = (() => {

  /**
   * Analyze a clothing image using Groq's vision model.
   * Returns structured attributes or null on failure.
   * @param {string} base64Image — full data:image/jpeg;base64,... string
   */
  async function analyze(base64Image) {
    if (!CONFIG.GROQ_API_KEY || CONFIG.GROQ_API_KEY === "YOUR_GROQ_API_KEY_HERE") {
      console.warn("Groq API key not set — returning mock recognition");
      return _mockResult();
    }

    const prompt = `You are a fashion expert analyzing a clothing item photo.

Return ONLY a valid JSON object with these exact fields (no markdown, no explanation):
{
  "category": one of ["tops","bottoms","shoes","outerwear","accessories","dresses"],
  "color": one of ["black","white","navy","grey","beige","brown","green","blue","red","pink"],
  "season": array of one or more of ["spring","summer","autumn","winter","all"],
  "warmth": integer 1, 2, or 3 where 1=light, 2=medium, 3=warm,
  "style": array of one or more of ["casual","formal","sport","evening","business","weekend"],
  "name": short descriptive name like "White linen shirt" or "Black slim jeans"
}

Rules:
- Choose the CLOSEST color from the list even if not exact
- warmth 1 = t-shirts/light fabrics, warmth 2 = medium layers/jeans, warmth 3 = coats/heavy knits
- If you cannot analyze the image, still return valid JSON with your best guess`;

    try {
      const response = await fetch(CONFIG.GROQ_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${CONFIG.GROQ_API_KEY}`,
          "Content-Type":  "application/json",
        },
        body: JSON.stringify({
          model: CONFIG.GROQ_VISION_MODEL,
          messages: [
            {
              role: "user",
              content: [
                { type: "text",       text: prompt },
                { type: "image_url",  image_url: { url: base64Image } },
              ],
            },
          ],
          max_tokens: 300,
          temperature: 0.1, // low temp = consistent structured output
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error("Groq Vision error:", err);
        return _mockResult();
      }

      const data   = await response.json();
      const text   = data.choices?.[0]?.message?.content || "";
      const parsed = _parseJSON(text);

      return parsed || _mockResult();

    } catch (err) {
      console.error("Recognition failed:", err);
      return _mockResult();
    }
  }

  // Safely extract JSON from the model's response
  function _parseJSON(text) {
    try {
      // Model sometimes wraps in ```json ... ```
      const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const data  = JSON.parse(clean);

      // Validate required fields exist
      const valid =
        data.category && data.color && Array.isArray(data.season) &&
        data.warmth   && Array.isArray(data.style);

      return valid ? data : null;
    } catch {
      return null;
    }
  }

  // Fallback when no API key or network error
  function _mockResult() {
    return {
      category: "tops",
      color:    "black",
      season:   ["spring", "summer", "autumn"],
      warmth:   1,
      style:    ["casual"],
      name:     "Clothing item",
    };
  }

  return { analyze };
})();
