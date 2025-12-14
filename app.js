import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const GOOGLE_KEY = process.env.GOOGLE_KEY;

// Chat route
app.post("/api/chat", async (req, res) => {
  const userMsg = req.body.message;
  console.log("User:", userMsg);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMsg }] }]
        })
      }
    );

    const data = await response.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I could not generate a reply.";

    res.json({ reply });
  } catch (err) {
    console.error("Chat Error:", err);
    res.json({ reply: "AI ERROR" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log("Backend running on PORT " + PORT + " (Gemini 2.5 Flash)")
);
