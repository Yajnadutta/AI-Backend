import express from "express";
import cors from "cors";
import Groq from "groq-sdk";

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // Better to use env variable
});

app.post("/chat", async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const chatCompletion = await groq.chat.completions.create({
      messages: req.body.messages,
      model: "openai/gpt-oss-20b",
    });

    res.json(chatCompletion);
  } catch (error) {
    console.error("Groq error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
