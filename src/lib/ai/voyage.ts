/**
 * Voyage AI client for generating embeddings
 * https://docs.voyageai.com/docs/embeddings
 */

const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";
const VOYAGE_MODEL = process.env.VOYAGE_EMBEDDING_MODEL || "voyage-3-lite";
const EMBEDDING_DIMENSIONS = 1024;

interface VoyageEmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    total_tokens: number;
  };
}

function getVoyageApiKey(): string {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) {
    throw new Error("VOYAGE_API_KEY is not set");
  }
  return apiKey;
}

/**
 * Generate embedding for a single text using Voyage AI
 */
export async function generateVoyageEmbedding(text: string): Promise<number[]> {
  const apiKey = getVoyageApiKey();

  const response = await fetch(VOYAGE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: VOYAGE_MODEL,
      input: text,
      input_type: "document",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Voyage AI API error: ${response.status} ${error}`);
  }

  const data: VoyageEmbeddingResponse = await response.json();
  return data.data[0].embedding;
}

/**
 * Generate embedding for a search query using Voyage AI
 * Uses input_type: "query" for better search performance
 */
export async function generateVoyageQueryEmbedding(query: string): Promise<number[]> {
  const apiKey = getVoyageApiKey();

  const response = await fetch(VOYAGE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: VOYAGE_MODEL,
      input: query,
      input_type: "query",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Voyage AI API error: ${response.status} ${error}`);
  }

  const data: VoyageEmbeddingResponse = await response.json();
  return data.data[0].embedding;
}

/**
 * Generate embeddings for multiple texts in a batch
 */
export async function generateVoyageEmbeddingsBatch(
  texts: string[],
  inputType: "document" | "query" = "document"
): Promise<number[][]> {
  const apiKey = getVoyageApiKey();

  const response = await fetch(VOYAGE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: VOYAGE_MODEL,
      input: texts,
      input_type: inputType,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Voyage AI API error: ${response.status} ${error}`);
  }

  const data: VoyageEmbeddingResponse = await response.json();

  // Sort by index to ensure correct order
  return data.data
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);
}

/**
 * Check if Voyage AI is configured
 */
export function isVoyageConfigured(): boolean {
  return !!process.env.VOYAGE_API_KEY;
}

/**
 * Get the embedding dimensions for the current model
 */
export function getEmbeddingDimensions(): number {
  return EMBEDDING_DIMENSIONS;
}
