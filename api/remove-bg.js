// Vercel serverless function — Photoroom background removal proxy
// Keeps PHOTOROOM_API_KEY server-side; never exposed to the client.
//
// POST /api/remove-bg
// Body: multipart/form-data with field "image_file" (the uploaded photo)
// Returns: the Photoroom response (PNG with transparent background) or JSON error

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.PHOTOROOM_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Background removal not configured on server." });
  }

  try {
    // Forward the raw body to Photoroom as-is (multipart/form-data)
    const upstream = await fetch("https://sdk.photoroom.com/v1/segment", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "content-type": req.headers["content-type"],
      },
      body: req, // Vercel streams the request body directly
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return res.status(upstream.status).json({ error: text });
    }

    // Stream the PNG back to the client
    const buffer = await upstream.arrayBuffer();
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(Buffer.from(buffer));

  } catch (err) {
    return res.status(500).json({ error: "Background removal failed: " + err.message });
  }
}
