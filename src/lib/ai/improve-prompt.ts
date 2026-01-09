import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { generateVoyageQueryEmbedding, isVoyageConfigured } from "@/lib/ai/voyage";
import { loadPrompt, getSystemPrompt, interpolatePrompt } from "@/lib/ai/load-prompt";
import { TYPE_DEFINITIONS } from "@/data/type-definitions";

const IMPROVE_MODEL = process.env.ANTHROPIC_IMPROVE_MODEL || "claude-sonnet-4-20250514";

let anthropic: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }
    anthropic = new Anthropic({ apiKey });
  }
  return anthropic;
}

export type OutputType = "text" | "image" | "video" | "sound";
export type OutputFormat = "text" | "structured_json" | "structured_yaml";

export interface ImprovePromptInput {
  prompt: string;
  outputType?: OutputType;
  outputFormat?: OutputFormat;
}

export interface ImprovePromptResult {
  original: string;
  improved: string;
  outputType: OutputType;
  outputFormat: OutputFormat;
  inspirations: Array<{ id: string; slug: string | null; title: string; similarity: number }>;
  model: string;
}

function mapOutputTypeToDbType(outputType: OutputType): "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | null {
  switch (outputType) {
    case "image": return "IMAGE";
    case "video": return "VIDEO";
    case "sound": return "AUDIO";
    default: return null;
  }
}

async function findSimilarPrompts(
  query: string,
  outputType: OutputType,
  limit: number = 3
): Promise<Array<{ id: string; slug: string | null; title: string; content: string; similarity: number }>> {
  if (!isVoyageConfigured()) {
    console.log("[improve-prompt] Voyage AI is not configured");
    return [];
  }

  try {
    const queryEmbedding = await generateVoyageQueryEmbedding(query);
    const embeddingStr = `[${queryEmbedding.join(",")}]`;
    const dbType = mapOutputTypeToDbType(outputType);
    const SIMILARITY_THRESHOLD = 0.3;

    // Use pgvector for similarity search
    const results = await db.$queryRaw<Array<{
      id: string;
      slug: string | null;
      title: string;
      content: string;
      similarity: number;
    }>>`
      SELECT
        id,
        slug,
        title,
        content,
        1 - (embedding <=> ${embeddingStr}::vector) as similarity
      FROM prompts
      WHERE "isPrivate" = false
        AND "deletedAt" IS NULL
        AND embedding IS NOT NULL
        ${dbType ? db.$queryRaw`AND type = ${dbType}` : db.$queryRaw``}
        AND 1 - (embedding <=> ${embeddingStr}::vector) >= ${SIMILARITY_THRESHOLD}
      ORDER BY embedding <=> ${embeddingStr}::vector
      LIMIT ${limit}
    `;

    console.log(`[improve-prompt] Found ${results.length} similar prompts via pgvector`);

    return results.map(r => ({
      ...r,
      similarity: Number(r.similarity),
    }));
  } catch (error) {
    console.error("[improve-prompt] Error finding similar prompts:", error);
    return [];
  }
}

function formatSimilarPrompts(
  prompts: Array<{ title: string; content: string; similarity: number }>
): string {
  if (prompts.length === 0) {
    return "No similar prompts found for inspiration.";
  }

  return prompts
    .map(
      (p, i) =>
        `### Inspiration ${i + 1}: ${p.title}\n${p.content.slice(0, 500)}${p.content.length > 500 ? "..." : ""}`
    )
    .join("\n\n");
}

export async function improvePrompt(input: ImprovePromptInput): Promise<ImprovePromptResult> {
  const { prompt, outputType = "text", outputFormat = "text" } = input;

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("AI features are not configured");
  }

  // Find similar prompts for inspiration
  const similarPrompts = await findSimilarPrompts(prompt, outputType);
  const similarPromptsText = formatSimilarPrompts(similarPrompts);

  // Load and interpolate the prompt template
  const improvePromptFile = loadPrompt("src/lib/ai/improve-prompt.prompt.yml");

  const systemPrompt = interpolatePrompt(getSystemPrompt(improvePromptFile), {
    similarPrompts: similarPromptsText,
    typeDefinitions: TYPE_DEFINITIONS,
  });

  const userMessage = improvePromptFile.messages.find((m) => m.role === "user");
  const userPrompt = interpolatePrompt(userMessage?.content || "", {
    outputFormat,
    outputType,
    originalPrompt: prompt,
  });

  // Call Anthropic
  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: IMPROVE_MODEL,
    max_tokens: improvePromptFile.modelParameters?.maxTokens ?? 4000,
    system: systemPrompt,
    messages: [
      { role: "user", content: userPrompt },
    ],
  });

  const improvedPrompt = response.content[0].type === "text" ? response.content[0].text.trim() : "";

  if (!improvedPrompt) {
    throw new Error("Failed to generate improved prompt");
  }

  return {
    original: prompt,
    improved: improvedPrompt,
    outputType,
    outputFormat,
    inspirations: similarPrompts.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      similarity: Math.round(p.similarity * 100),
    })),
    model: IMPROVE_MODEL,
  };
}
