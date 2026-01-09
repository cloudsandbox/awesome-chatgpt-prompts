import { db } from "@/lib/db";
import { getConfig } from "@/lib/config";
import { generateVoyageEmbedding, isVoyageConfigured } from "./voyage";

/**
 * Format embedding array for pgvector storage
 */
function formatEmbeddingForPgvector(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

/**
 * Generate embedding using Voyage AI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  return generateVoyageEmbedding(text);
}

/**
 * Generate and store embedding for a prompt using pgvector
 */
export async function generatePromptEmbedding(promptId: string): Promise<void> {
  const config = await getConfig();
  if (!config.features.aiSearch) return;

  const prompt = await db.prompt.findUnique({
    where: { id: promptId },
    select: { title: true, description: true, content: true, isPrivate: true },
  });

  if (!prompt) return;

  // Never generate embeddings for private prompts
  if (prompt.isPrivate) return;

  // Combine title, description, and content for embedding
  const textToEmbed = [prompt.title, prompt.description || "", prompt.content]
    .join("\n\n")
    .trim();

  const embedding = await generateEmbedding(textToEmbed);
  const embeddingStr = formatEmbeddingForPgvector(embedding);

  // Use raw SQL to store the vector
  await db.$executeRaw`
    UPDATE prompts
    SET embedding = ${embeddingStr}::vector
    WHERE id = ${promptId}
  `;
}

// Delay helper to avoid rate limits
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate embeddings for all prompts that don't have one
 */
export async function generateAllEmbeddings(
  onProgress?: (
    current: number,
    total: number,
    success: number,
    failed: number
  ) => void,
  regenerate: boolean = false
): Promise<{ success: number; failed: number; total: number }> {
  const config = await getConfig();
  if (!config.features.aiSearch) {
    throw new Error("AI Search is not enabled");
  }

  // Find prompts without embeddings (or all if regenerating)
  const prompts = await db.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM prompts
    WHERE "isPrivate" = false
      AND "deletedAt" IS NULL
      ${regenerate ? db.$queryRaw`` : db.$queryRaw`AND embedding IS NULL`}
  `;

  const total = prompts.length;
  let success = 0;
  let failed = 0;

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    try {
      await generatePromptEmbedding(prompt.id);
      success++;
    } catch (error) {
      console.error(`Failed to generate embedding for ${prompt.id}:`, error);
      failed++;
    }

    // Report progress
    if (onProgress) {
      onProgress(i + 1, total, success, failed);
    }

    // Rate limit: wait 500ms between requests
    if (i < prompts.length - 1) {
      await delay(500);
    }
  }

  return { success, failed, total };
}

/**
 * Check if AI Search is enabled and configured
 */
export async function isAISearchEnabled(): Promise<boolean> {
  const config = await getConfig();
  return config.features.aiSearch === true && isVoyageConfigured();
}

/**
 * Find and save 4 related prompts based on embedding similarity using pgvector
 */
export async function findAndSaveRelatedPrompts(
  promptId: string
): Promise<void> {
  const config = await getConfig();
  if (!config.features.aiSearch) return;

  const prompt = await db.prompt.findUnique({
    where: { id: promptId },
    select: { isPrivate: true, type: true },
  });

  if (!prompt || prompt.isPrivate) return;

  // Use pgvector to find similar prompts
  const SIMILARITY_THRESHOLD = 0.5;

  const similarPrompts = await db.$queryRaw<Array<{ id: string }>>`
    SELECT p2.id
    FROM prompts p1
    CROSS JOIN LATERAL (
      SELECT p2.id, 1 - (p1.embedding <=> p2.embedding) as similarity
      FROM prompts p2
      WHERE p2.id != p1.id
        AND p2."isPrivate" = false
        AND p2."isUnlisted" = false
        AND p2."deletedAt" IS NULL
        AND p2.embedding IS NOT NULL
        AND p2.type = p1.type
        AND 1 - (p1.embedding <=> p2.embedding) >= ${SIMILARITY_THRESHOLD}
      ORDER BY p1.embedding <=> p2.embedding
      LIMIT 4
    ) p2
    WHERE p1.id = ${promptId}
      AND p1.embedding IS NOT NULL
  `;

  if (similarPrompts.length === 0) return;

  // Delete existing related connections for this prompt
  await db.promptConnection.deleteMany({
    where: {
      sourceId: promptId,
      label: "related",
    },
  });

  // Create new related connections
  await db.promptConnection.createMany({
    data: similarPrompts.map((p, index) => ({
      sourceId: promptId,
      targetId: p.id,
      label: "related",
      order: index,
    })),
    skipDuplicates: true,
  });
}
