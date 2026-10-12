
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from the backend .env file.");
}

const ai = new GoogleGenAI({ apiKey });

const EMBEDDING_MODEL = "gemini-embedding-001";

export async function generateEmbeddings(
  chunks: string[]
): Promise<number[][]> {
  if (chunks.length === 0) {
    throw new Error("Cannot generate embeddings for empty chunks.");
  }

  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: chunks,
  });

  const embeddings = response.embeddings?.map(
    (item) => item.values ?? []
  );

  if (!embeddings || embeddings.length !== chunks.length) {
    throw new Error("Failed to generate embeddings for all chunks.");
  }

  return embeddings;
}
