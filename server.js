import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import csvParser from "csv-parser";
import Groq from "groq-sdk";

const app = express();

app.use(cors());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const upload = multer({
  dest: "uploads/",
});

async function readCSV(path) {
  return new Promise((resolve) => {
    const rows = [];

    fs.createReadStream(path)
      .pipe(csvParser())
      .on("data", (row) => rows.push(row))
      .on("end", () => {
        resolve(JSON.stringify(rows, null, 2));
      });
  });
}

app.post("/chat", upload.single("file"), async (req, res) => {
  try {
    const messages = JSON.parse(req.body.messages);

    let fileContent = "";

    if (req.file) {
      const ext = req.file.originalname
        .split(".")
        .pop()
        .toLowerCase();

      switch (ext) {
        case "pdf":
          const pdfData = await pdf(
            fs.readFileSync(req.file.path)
          );
          fileContent = pdfData.text;
          break;

        case "docx":
          const doc = await mammoth.extractRawText({
            path: req.file.path,
          });

          fileContent = doc.value;
          break;

        case "txt":
          fileContent = fs.readFileSync(
            req.file.path,
            "utf8"
          );
          break;

        case "csv":
          fileContent = await readCSV(req.file.path);
          break;

        case "png":
        case "jpg":
        case "jpeg":
        case "webp":
          fileContent =
            "User uploaded an image. (Vision model required)";
          break;

        default:
          fileContent = "Unsupported file.";
      }

      fs.unlinkSync(req.file.path);
    }

    const finalMessages = [...messages];

    if (fileContent) {
      finalMessages.push({
        role: "system",
        content:
          "Uploaded File Content:\n\n" +
          fileContent,
      });
    }

    const completion =
      await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: finalMessages,
      });

    res.json(completion);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server Started");
});