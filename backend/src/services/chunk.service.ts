
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

export async function splitTranscriptIntoChunks(
  transcript: string
): Promise<string[]> {
  if (!transcript.trim()) {
    throw new Error("Transcript cannot be empty.");
  }

  const chunks = await textSplitter.splitText(transcript);

  return chunks;
}
