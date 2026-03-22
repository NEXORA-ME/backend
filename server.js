import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const API_KEY = process.env.GOOGLE_API_KEY;

// -------------------------
// Health check
// -------------------------
app.get("/", (req, res) => {
  res.send("🚀 Nexora AI Backend Running");
});

// -------------------------
// Chat API
// -------------------------
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.json({ reply: "Please type something." });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: message }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    // 🔍 Debug (important)
    console.log("RAW RESPONSE:", JSON.stringify(data, null, 2));

    let reply = "Hello 👋 I am Nexora AI (fallback reply).";

    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0]
    ) {
      reply = data.candidates[0].content.parts[0].text;
    }

    res.json({ reply });

  } catch (err) {
    console.error("AI ERROR:", err);
    res.json({ reply: "Server error. Try again." });
  }
});

// -------------------------
// Start server
// -------------------------
app.listen(PORT, () => {
  console.log(`🚀 Nexora running on port ${PORT}`);
});
