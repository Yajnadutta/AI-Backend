import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const response = await fetch("http://127.0.0.1:11434/api/chat", {
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
    console.error("Cause:", error.cause);

    res.status(500).json({
      error: error.message,
      cause: error.cause?.message,
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});