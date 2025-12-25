import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_API_KEY;

// Chat route
app.post("/api/chat", async (req, res) => {
  const userMsg = req.body.message;
  console.log("User:", userMsg);

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // fast + cheap
          messages: [
            { role: "user", content: userMsg }
          ]
        })
      }
    );

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content ||
      "Sorry, I could not generate a reply.";

    res.json({ reply });

  } catch (err) {
    console.error("Chat Error:", err);
    res.json({ reply: "AI ERROR" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log("Backend running on PORT " + PORT + " (OpenAI)")
);
