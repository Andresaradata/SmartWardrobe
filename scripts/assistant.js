// ═══════════════════════════════════════════════════
//  assistant.js — AI chat via Groq, wardrobe-aware
// ═══════════════════════════════════════════════════

const Assistant = (() => {
  const _history = []; // conversation history for this session

  /**
   * Send a message to the AI assistant.
   * Builds a rich system prompt from wardrobe + weather context.
   * @param {string} userMessage
   * @returns {string} assistant reply
   */
  async function send(userMessage) {
    if (!CONFIG.GROQ_API_KEY || CONFIG.GROQ_API_KEY === "YOUR_GROQ_API_KEY_HERE") {
      return _mockReply(userMessage);
    }

    const systemPrompt = _buildSystemPrompt();

    // Add user message to history
    _history.push({ role: "user", content: userMessage });

    // Keep history to last 10 turns to avoid token overflow
    const recentHistory = _history.slice(-10);

    try {
      const response = await fetch(CONFIG.GROQ_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${CONFIG.GROQ_API_KEY}`,
          "Content-Type":  "application/json",
        },
        body: JSON.stringify({
          model: CONFIG.GROQ_CHAT_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            ...recentHistory,
          ],
          max_tokens:  400,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error("Groq chat error:", err);
        return "Sorry, I couldn't reach the AI right now. Try again in a moment.";
      }

      const data  = await response.json();
      const reply = data.choices?.[0]?.message?.content || "I didn't get a response. Please try again.";

      // Add assistant reply to history
      _history.push({ role: "assistant", content: reply });

      return reply;

    } catch (err) {
      console.error("Assistant error:", err);
      return "Something went wrong. Check your connection and try again.";
    }
  }

  // Build context-rich system prompt
  function _buildSystemPrompt() {
    const items      = wardrobe.getAll();
    const stats      = wardrobe.getStats();
    const weatherCtx = Weather.getCurrent();

    // Summarize wardrobe for the prompt (avoid huge token counts)
    const wardrobeSummary = items.slice(0, 30).map(i =>
      `- ${i.name || i.category} (${i.color} ${i.category}, worn ${i.timesWorn}x, style: ${(i.style||[]).join("/")})`
    ).join("\n");

    const weatherLine = weatherCtx
      ? `Current weather: ${weatherCtx.temp}°C, ${weatherCtx.description}. ${weatherCtx.summary}.`
      : "Weather data unavailable.";

    return `You are a personal AI wardrobe assistant called Wardi. You are friendly, concise, and fashion-savvy.

USER'S WARDROBE (${items.length} items):
${wardrobeSummary}

WARDROBE STATS:
- Total items: ${stats.total}
- Most worn: ${stats.topWorn ? `${stats.topWorn.name || stats.topWorn.category} (${stats.topWorn.timesWorn}x)` : "N/A"}
- Sustainability score: ${stats.sustainScore}%

${weatherLine}

YOUR CAPABILITIES:
1. Suggest outfits using items from their wardrobe
2. Advise on new purchases (check for duplicates, compatibility)
3. Help plan outfits for occasions or trips
4. Encourage sustainable choices (rewear, avoid redundant buys)
5. Answer general style questions

RULES:
- Keep replies short and conversational (2-4 sentences max unless a list is useful)
- When suggesting outfits, reference specific items from the wardrobe by name
- When advising on a purchase, explicitly check if something similar already exists
- Be honest: if they have enough of something, say so
- Never be preachy about sustainability — mention it once, naturally`;
  }

  // Fallback replies when no API key is set
  function _mockReply(message) {
    const lower = message.toLowerCase();

    if (lower.includes("buy") || lower.includes("purchase")) {
      return "Before buying, check if you already have something similar! Looking at your wardrobe, you have solid basics covered. Make sure the new item can pair with at least 3 things you already own.";
    }
    if (lower.includes("wear") || lower.includes("outfit")) {
      return "Based on your wardrobe, I'd suggest pairing your White Linen Shirt with Black Slim Jeans and White Sneakers — a clean, versatile look that works for most occasions.";
    }
    if (lower.includes("weather") || lower.includes("cold") || lower.includes("warm")) {
      return "For today's weather, I'd recommend layering — your Navy Wool Sweater with Grey Chinos and Brown Chelsea Boots would be both warm and stylish.";
    }
    if (lower.includes("sustain") || lower.includes("eco")) {
      return "You're doing well! Try to rotate your less-worn pieces more often. Your Striped Linen Tee and Beige Linen Trousers haven't been worn much recently — great candidates for your next outfit.";
    }

    return "I'm your wardrobe assistant! Ask me to suggest an outfit, help plan what to wear for an occasion, or advise on a potential purchase.";
  }

  function clearHistory() {
    _history.length = 0;
  }

  return { send, clearHistory };
})();
