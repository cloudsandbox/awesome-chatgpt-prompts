import Anthropic from "@anthropic-ai/sdk";
import { getConfig } from "@/lib/config";
import { loadPrompt, getSystemPrompt, interpolatePrompt } from "./load-prompt";

const translatePrompt = loadPrompt("src/lib/ai/translate.prompt.yml");
const sqlGenerationPrompt = loadPrompt("src/lib/ai/sql-generation.prompt.yml");

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

const GENERATIVE_MODEL = process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022";

export function getAIModelName(): string {
  return GENERATIVE_MODEL;
}

export async function isAIGenerationEnabled(): Promise<boolean> {
  const config = await getConfig();
  return !!(config.features.aiGeneration && process.env.ANTHROPIC_API_KEY);
}

export async function translateContent(content: string, targetLanguage: string): Promise<string> {
  const client = getAnthropicClient();

  const systemPrompt = interpolatePrompt(
    getSystemPrompt(translatePrompt),
    { targetLanguage }
  );

  const response = await client.messages.create({
    model: GENERATIVE_MODEL,
    max_tokens: 4000,
    system: systemPrompt,
    messages: [
      { role: "user", content }
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text.trim() : "";
}

export async function generateSQL(prompt: string): Promise<string> {
  const config = await getConfig();
  if (!config.features.aiGeneration) {
    throw new Error("AI Generation is not enabled");
  }

  const client = getAnthropicClient();

  const systemPrompt = getSystemPrompt(sqlGenerationPrompt);

  const response = await client.messages.create({
    model: GENERATIVE_MODEL,
    max_tokens: 500,
    system: systemPrompt,
    messages: [
      { role: "user", content: prompt }
    ],
  });

  const content = response.content[0].type === "text" ? response.content[0].text : "";

  // Clean up the response - remove markdown code blocks if present
  return content
    .replace(/^```sql\n?/i, "")
    .replace(/^```\n?/i, "")
    .replace(/\n?```$/i, "")
    .trim();
}
