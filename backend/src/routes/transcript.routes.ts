
import { Router, Request, Response } from "express";
import {
  getYouTubeTranscript,
  extractYouTubeVideoId,
} from "../services/transcript.service.js";
import { splitTranscriptIntoChunks } from "../services/chunk.service.js";
import { generateEmbeddings } from "../services/embedding.service.js";
import {
  createVectorStore,
  hasVectorStore,
  searchSimilarChunks,
} from "../services/vectorstore.service.js";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

interface ChatRequestBody {
  videoUrl?: string;
  query?: string;
}

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from the backend .env file.");
}

const ai = new GoogleGenAI({ apiKey });

const CHAT_MODEL = "gemini-3.5-flash";

router.post(
  "/",
  async (
    req: Request<{}, {}, ChatRequestBody>,
    res: Response
  ) => {
    const { videoUrl, query } = req.body;

    if (!videoUrl || typeof videoUrl !== "string") {
      res.status(400).json({
        success: false,
        message: "Please provide a YouTube video URL.",
      });
      return;
    }

    if (!query || typeof query !== "string" || !query.trim()) {
      res.status(400).json({
        success: false,
        message: "Please enter your question.",
      });
      return;
    }

    try {
      // Step 1: Extract the video ID.
      const videoId = extractYouTubeVideoId(videoUrl);

      let chunks: string[];

      // Step 2: Process the video only if its index is not cached.
      if (!hasVectorStore(videoId)) {
        const transcript = await getYouTubeTranscript(videoUrl);

        chunks = await splitTranscriptIntoChunks(transcript);

        const chunkEmbeddings = await generateEmbeddings(chunks);

        createVectorStore(videoId, chunks, chunkEmbeddings);
      }

      // Step 3: Generate an embedding for the user's question.
      const [queryEmbedding] = await generateEmbeddings([query.trim()]);

      if (!queryEmbedding) {
        throw new Error("Failed to generate an embedding for your question.");
      }

      // Step 4: Search only the requested video's index.
      const relevantChunks = searchSimilarChunks(videoId, queryEmbedding, 4);

      if (relevantChunks.length === 0) {
        throw new Error("No relevant transcript content was found.");
      }

      // Step 5: Build context from the retrieved chunks.
      const context = relevantChunks
        .map((chunk, index) => `Context ${index + 1}:\n${chunk}`)
        .join("\n\n");

      // Step 6: Generate an answer grounded in the video context.
      
const completion = await ai.models.generateContent({
  model: CHAT_MODEL,
  contents: `Video transcript context:
${context}

Question: ${query.trim()}`,
  config: {
    systemInstruction: `You are a friendly and engaging YouTube video assistant.

    Follow these rules:
    - Answer in simple, natural language that anyone can understand.
    - Make answers interesting and conversational, not boring or textbook-like.
    - Explain the main point directly without unnecessary details.
    - Use short paragraphs and bullet points when they make the answer easier to read.
    - Use a few relevant emojis when they add personality, but don't overuse them.
    - For questions about people, explain their actions and reasons clearly.
    - For simple questions, give short and direct answers. For complex questions, explain a little more.
    - Add a light, relatable touch or a catchy closing line when it fits naturally.
    - Use only the provided transcript context. Never invent facts.
    - If the context doesn't contain enough information, honestly say so.
    - Always answer the user's actual question.

    Your goal is to make users feel like they're talking to a smart, friendly person rather than reading a textbook.`,
    temperature: 0.5,
  },
});


      const answer = completion.text?.trim();

      if (!answer) {
        throw new Error("The AI model did not return an answer.");
      }

      // Step 7: Return the answer.
      res.status(200).json({
        success: true,
        message: "Your question was answered successfully.",
        data: {
          answer,
          retrievedChunkCount: relevantChunks.length,
        },
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to process your question.";

      res.status(500).json({
        success: false,
        message,
      });
    }
  }
);

export default router;
