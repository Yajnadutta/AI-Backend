import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const OLLAMA_URL = process.env.OLLAMA_URL;

app.post("/chat", async (req, res) => {
  try {
    if (!OLLAMA_URL) {
      return res.status(500).json({
        error: "OLLAMA_URL not set in environment variables",
      });
    }

    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.2:1b",
        messages: req.body.messages,
        stream: false,
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Fetch error:", error);

    res.status(500).json({
      error: error.message,
      cause: error.cause?.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
