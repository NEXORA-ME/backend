import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 10000;
const chats = {};
let MODEL = null;

/* Find Gemini model */
async function findModel() {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`
    );
    const data = await res.json();

    const usable = (data.models || []).find(m =>
      (m.supportedGenerationMethods || []).includes("generateContent")
    );

    if (!usable) {
      console.error("❌ No model found");
      return;
    }

    MODEL = usable.name;
    console.log("✅ Using:", MODEL);
  } catch (err) {
    console.error("Model error:", err);
  }
}

await findModel();

/* Home */
app.get("/", (req, res) => {
  res.send("Nexora running");
});

/* Get chat history */
app.get("/chats/:email", (req, res) => {
  const email = req.params.email;
  res.json(chats[email] || []);
});

/* Chat */
app.post("/chat", async (req, res) => {
  const { email, message } = req.body;

  if (!email || !message) {
    return res.json({ reply: "Invalid request" });
  }

  if (!MODEL) {
    return res.json({ reply: "Model not ready yet..." });
  }

  if (!chats[email]) chats[email] = [];

  chats[email].push({ role: "user", parts: [{ text: message }] });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: chats[email],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500
          }
        })
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Hello 👋 I am Nexora AI";

    chats[email].push({ role: "model", parts: [{ text: reply }] });

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.json({ reply: "Error talking to AI" });
  }
});

app.listen(PORT, () => {
  console.log("🚀 Server running on", PORT);
});
