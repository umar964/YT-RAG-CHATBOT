import { IndexFlatL2 } from "faiss-node";

interface VideoVectorStore {
  index: IndexFlatL2;
  chunks: string[];
  dimension: number;
}

const videoStores = new Map<string, VideoVectorStore>();

/**
 * Creates and stores a separate FAISS index for each video.
 */
export function createVectorStore(
  videoId: string,
  chunks: string[],
  embeddings: number[][]
): void {
  if (!videoId.trim()) {
    throw new Error("Video ID cannot be empty.");
  }

  if (chunks.length === 0) {
    throw new Error("Cannot create a vector store without chunks.");
  }

  if (chunks.length !== embeddings.length) {
    throw new Error(
      "The number of chunks must match the number of embeddings."
    );
  }

  const dimension = embeddings[0]?.length;

  if (!dimension) {
    throw new Error("Embedding vectors cannot be empty.");
  }

  for (const embedding of embeddings) {
    if (embedding.length !== dimension) {
      throw new Error(
        "All embedding vectors must have the same dimension."
      );
    }
  }

  const index = new IndexFlatL2(dimension);

  index.add(embeddings.flat()); // store  just only embedded vector  in FAISS no metadata

  videoStores.set(videoId, { // our map that storing videoId -> index,original text
    index,
    chunks: [...chunks],
    dimension,
  });
}

/**
 * Checks whether a video's vector index exists in memory.
 */
export function hasVectorStore(videoId: string): boolean {
  return videoStores.has(videoId);
}

/**
 * Searches for chunks relevant to the user's query.
 */
export function searchSimilarChunks(
  videoId: string,
  queryEmbedding: number[],
  k = 4
): string[] {
  const store = videoStores.get(videoId); // just fetch the details like index (it has all the vectors of that video, like 3 vectors or 100 vectors), original text (chunks), and dimension

  if (!store) {
    throw new Error(
      "The vector store for this video has not been created."
    );
  }

  if (queryEmbedding.length !== store.dimension) {
    throw new Error("The query embedding has an incorrect dimension.");
  }

  if (!Number.isInteger(k) || k < 1) {
    throw new Error("The number of results must be a positive integer.");
  }

  const resultCount = Math.min(k, store.chunks.length);
  const results = store.index.search(queryEmbedding, resultCount); // store.index has all the vectors of this video, so search the user query against them. FAISS will compare the user query embedding with the stored vectors and return the indexes of the top k matching vectors. With these indexes, we can get the original text from our Map.

  return Array.from(results.labels)
    .filter(
      (label) => label >= 0 && label < store.chunks.length
    )
    .map((label) => store.chunks[label]!); // fetch the original text from store.chunks using the indexes returned by FAISS
}