import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();

// Enable CORS for your frontend
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, model } = req.body;
    console.log("📩 Prompt:", prompt, "Model:", model);

    const API_KEY = process.env.OPENROUTER_API_KEY;
    if (!API_KEY) {
      console.error("❌ Missing OPENROUTER_API_KEY in .env");
      return res.status(500).json({ error: "Missing OPENROUTER_API_KEY" });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: model || "google/gemini-2.5-flash-image-preview:free",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch (err) {
      const html = await response.text();
      console.error("❌ Non-JSON response:", html);
      return res.status(500).json({ error: "Non-JSON response from OpenRouter", raw: html });
    }

    if (!response.ok) {
      console.error("❌ OpenRouter error:", data);
      return res.status(response.status).json({ error: "OpenRouter request failed", info: data });
    }

    const choices = data.choices?.[0];
    const imageEntry = choices?.message?.images?.[0]?.image_url?.url;

    if (!imageEntry) {
      return res.status(500).json({ error: "Model did not return an image", raw: data });
    }

    res.json({ image: imageEntry });
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
