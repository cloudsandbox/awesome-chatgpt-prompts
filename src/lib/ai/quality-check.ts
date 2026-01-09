import Anthropic from "@anthropic-ai/sdk";
import { loadPrompt, getSystemPrompt } from "./load-prompt";

const qualityCheckPrompt = loadPrompt("src/lib/ai/quality-check.prompt.yml");

// DelistReason enum values (matches Prisma schema)
export type DelistReason = "TOO_SHORT" | "NOT_ENGLISH" | "LOW_QUALITY" | "NOT_LLM_INSTRUCTION" | "MANUAL";

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

// Minimum character count for prompt content
const MIN_CONTENT_LENGTH = 50;

// Minimum word count for prompt content
const MIN_WORD_COUNT = 10;

export interface QualityCheckResult {
  shouldDelist: boolean;
  reason: DelistReason | null;
  confidence: number;
  details: string;
}

/**
 * Performs basic length checks on prompt content
 */
function checkLength(content: string): QualityCheckResult | null {
  const trimmed = content.trim();
  const wordCount = trimmed.split(/\s+/).filter(w => w.length > 0).length;

  if (trimmed.length < MIN_CONTENT_LENGTH) {
    return {
      shouldDelist: true,
      reason: "TOO_SHORT",
      confidence: 1.0,
      details: `Content is too short (${trimmed.length} chars, minimum ${MIN_CONTENT_LENGTH})`,
    };
  }

  if (wordCount < MIN_WORD_COUNT) {
    return {
      shouldDelist: true,
      reason: "TOO_SHORT",
      confidence: 1.0,
      details: `Content has too few words (${wordCount} words, minimum ${MIN_WORD_COUNT})`,
    };
  }

  return null;
}

/**
 * AI-powered quality check for prompt content
 * Returns quality assessment with high precision to avoid false positives
 */
export async function checkPromptQuality(
  title: string,
  content: string,
  description?: string | null
): Promise<QualityCheckResult> {
  console.log(`[Quality Check] Checking: "${title}" (${content.length} chars)`);

  // First, run basic length checks (no AI needed)
  const lengthCheck = checkLength(content);
  if (lengthCheck) {
    console.log(`[Quality Check] Length check failed:`, lengthCheck);
    return lengthCheck;
  }

  // Check if Anthropic is available
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log(`[Quality Check] No Anthropic API key - skipping AI check`);
    // If no AI available, pass the check (avoid false positives)
    return {
      shouldDelist: false,
      reason: null,
      confidence: 0,
      details: "AI quality check skipped - no API key configured",
    };
  }

  console.log(`[Quality Check] Running AI check...`);

  try {
    const client = getAnthropicClient();

    const systemPrompt = getSystemPrompt(qualityCheckPrompt);

    const userMessage = `Title: ${title}
${description ? `Description: ${description}\n` : ""}
Content:
${content}`;

    const response = await client.messages.create({
      model: GENERATIVE_MODEL,
      max_tokens: 300,
      system: systemPrompt + "\n\nRespond with JSON only, no markdown formatting.",
      messages: [
        { role: "user", content: userMessage }
      ],
    });

    const responseText = response.content[0].type === "text" ? response.content[0].text : "{}";
    console.log(`[Quality Check] AI response:`, responseText);

    try {
      // Parse JSON from response (handle potential markdown code blocks)
      let jsonStr = responseText.trim();
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      const result = JSON.parse(jsonStr);

      // Extra safety: only delist if confidence is high enough
      if (result.shouldDelist && result.confidence < 0.85) {
        return {
          shouldDelist: false,
          reason: null,
          confidence: result.confidence,
          details: `Below confidence threshold: ${result.details}`,
        };
      }

      return {
        shouldDelist: !!result.shouldDelist,
        reason: result.reason as DelistReason | null,
        confidence: result.confidence || 0,
        details: result.details || "Quality check completed",
      };
    } catch {
      console.error("Failed to parse AI quality check response:", responseText);
      // On parse error, don't delist (avoid false positives)
      return {
        shouldDelist: false,
        reason: null,
        confidence: 0,
        details: "Failed to parse AI response - defaulting to approve",
      };
    }
  } catch (error) {
    console.error("AI quality check error:", error);
    // On error, don't delist (avoid false positives)
    return {
      shouldDelist: false,
      reason: null,
      confidence: 0,
      details: "AI quality check failed - defaulting to approve",
    };
  }
}

/**
 * Check if auto-delist feature is enabled
 */
export async function isAutoDelistEnabled(): Promise<boolean> {
  // Auto-delist requires Anthropic API key for AI checks
  // Basic length checks will still work without it
  return true;
}
