import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import { getConfig } from "@/lib/config";
import {
  PROMPT_BUILDER_TOOLS,
  executeToolCall,
  type PromptBuilderState,
} from "@/lib/ai/prompt-builder-tools";
import { loadPrompt, getSystemPrompt } from "@/lib/ai/load-prompt";

const promptBuilderAgentPrompt = loadPrompt("src/app/api/prompt-builder/chat/prompt-builder-agent.prompt.yml");

const GENERATIVE_MODEL = process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022";

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per user

// In-memory rate limit store (resets on server restart)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    // Reset or initialize
    rateLimitStore.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetIn: userLimit.resetAt - now };
  }

  userLimit.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - userLimit.count, resetIn: userLimit.resetAt - now };
}

const SYSTEM_PROMPT = getSystemPrompt(promptBuilderAgentPrompt);

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: string;
  }>;
  toolResults?: Array<{
    id: string;
    result: unknown;
  }>;
}

interface RequestBody {
  messages: ChatMessage[];
  currentState: PromptBuilderState;
  availableTags: Array<{ id: string; name: string; slug: string; color: string }>;
  availableCategories: Array<{ id: string; name: string; slug: string; parentId: string | null }>;
}

// Convert tools to Anthropic format
function convertToolsToAnthropic(): Anthropic.Tool[] {
  return PROMPT_BUILDER_TOOLS.map(tool => ({
    name: tool.function.name,
    description: tool.function.description || "",
    input_schema: tool.function.parameters as Anthropic.Tool.InputSchema,
  }));
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Check rate limit
  const userId = session.user.id || session.user.email || "anonymous";
  const rateLimit = checkRateLimit(userId);
  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({
      error: "Rate limit exceeded. Please try again later.",
      resetIn: Math.ceil(rateLimit.resetIn / 1000)
    }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetIn / 1000)),
      },
    });
  }

  const config = await getConfig();
  if (!config.features.aiGeneration) {
    return new Response(JSON.stringify({ error: "AI generation is not enabled" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Anthropic API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body: RequestBody = await request.json();
  const { messages, currentState, availableTags, availableCategories } = body;

  // Create a streaming response using TransformStream for better Node.js compatibility
  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  const send = async (data: object) => {
    await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };

  // Start processing in background
  (async () => {
    try {
      const anthropic = new Anthropic({ apiKey });

      // Build available tags and categories context
      const tagNames = availableTags.map(t => t.name).join(", ");
      const categoryNames = availableCategories.map(c => c.name).join(", ");

      const availableContext = `

AVAILABLE TAGS (use exact names with set_tags):
${tagNames || "(none)"}

AVAILABLE CATEGORIES (use exact names with set_category):
${categoryNames || "(none)"}`;

      // Build system message with current state context
      const hasContent = currentState.title || currentState.content || currentState.description;
      const selectedTagNames = currentState.tagIds
        .map(id => availableTags.find(t => t.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      const selectedCategoryName = availableCategories.find(c => c.id === currentState.categoryId)?.name;

      const stateContext = hasContent ? `

CURRENT PROMPT STATE:
- Title: ${currentState.title || "(not set)"}
- Description: ${currentState.description || "(not set)"}
- Content (FULL - DO NOT SHORTEN):
${currentState.content || "(not set)"}
- Type: ${currentState.type}
- Tags: ${selectedTagNames || "(none)"}
- Category: ${selectedCategoryName || "(none)"}
- Private: ${currentState.isPrivate}

CRITICAL: When editing content, you MUST preserve the FULL content above. Do NOT shorten, summarize, or truncate it. Only make the specific changes the user requested while keeping everything else exactly the same.` : "";

      // Convert messages to Anthropic format
      const anthropicMessages: Anthropic.MessageParam[] = [];

      for (const msg of messages) {
        if (msg.role === "user") {
          anthropicMessages.push({ role: "user", content: msg.content });
        } else if (msg.role === "assistant") {
          if (msg.toolCalls && msg.toolCalls.length > 0) {
            // Assistant message with tool use
            const contentBlocks: (Anthropic.TextBlockParam | Anthropic.ToolUseBlockParam)[] = [];
            if (msg.content) {
              contentBlocks.push({ type: "text", text: msg.content });
            }
            for (const tc of msg.toolCalls) {
              contentBlocks.push({
                type: "tool_use",
                id: tc.id,
                name: tc.name,
                input: JSON.parse(tc.arguments),
              });
            }
            anthropicMessages.push({ role: "assistant", content: contentBlocks });

            // Add tool results as user message
            if (msg.toolResults && msg.toolResults.length > 0) {
              const toolResultBlocks: Anthropic.ToolResultBlockParam[] = msg.toolResults.map(tr => ({
                type: "tool_result" as const,
                tool_use_id: tr.id,
                content: JSON.stringify(tr.result),
              }));
              anthropicMessages.push({ role: "user", content: toolResultBlocks });
            }
          } else {
            anthropicMessages.push({ role: "assistant", content: msg.content });
          }
        }
      }

      // Agentic loop with streaming
      let state = { ...currentState };
      let loopCount = 0;
      const maxLoops = 10;

      const anthropicTools = convertToolsToAnthropic();

      while (loopCount < maxLoops) {
        loopCount++;

        // Use streaming
        const stream = await anthropic.messages.stream({
          model: GENERATIVE_MODEL,
          max_tokens: 2000,
          system: SYSTEM_PROMPT + availableContext + stateContext,
          messages: anthropicMessages,
          tools: anthropicTools,
        });

        let fullContent = "";
        const toolUseBlocks: Array<{ id: string; name: string; input: unknown }> = [];

        for await (const event of stream) {
          if (event.type === "content_block_delta") {
            const delta = event.delta;
            if (delta.type === "text_delta") {
              fullContent += delta.text;
              await send({ type: "text", content: delta.text });
            } else if (delta.type === "input_json_delta") {
              // Tool input is being streamed - we'll get the full input at content_block_stop
            }
          } else if (event.type === "content_block_stop") {
            // Check if we have accumulated tool use blocks
            const message = await stream.finalMessage();
            for (const block of message.content) {
              if (block.type === "tool_use" && !toolUseBlocks.find(t => t.id === block.id)) {
                toolUseBlocks.push({
                  id: block.id,
                  name: block.name,
                  input: block.input,
                });
              }
            }
          }
        }

        // Get final message to ensure we have all tool use blocks
        const finalMessage = await stream.finalMessage();
        for (const block of finalMessage.content) {
          if (block.type === "tool_use" && !toolUseBlocks.find(t => t.id === block.id)) {
            toolUseBlocks.push({
              id: block.id,
              name: block.name,
              input: block.input,
            });
          }
        }

        // If no tool calls, we're done
        if (toolUseBlocks.length === 0) {
          await send({ type: "state", state });
          await send({ type: "done" });
          await writer.write(encoder.encode("data: [DONE]\n\n"));
          await writer.close();
          return;
        }

        // Process tool calls
        const toolResults: Array<{ id: string; name: string; result: unknown }> = [];

        for (const toolUse of toolUseBlocks) {
          try {
            const { result, newState } = await executeToolCall(
              toolUse.name,
              toolUse.input as Record<string, unknown>,
              state,
              availableTags,
              availableCategories
            );
            state = newState;

            const toolCallResult = {
              id: toolUse.id,
              name: toolUse.name,
              arguments: JSON.stringify(toolUse.input),
              result,
            };

            toolResults.push({
              id: toolUse.id,
              name: toolUse.name,
              result,
            });

            // Stream tool call result
            await send({ type: "tool_call", toolCall: toolCallResult });
          } catch (e) {
            console.error("Tool call error:", e);
          }
        }

        // Add assistant message with tool use to conversation
        const assistantContent: (Anthropic.TextBlockParam | Anthropic.ToolUseBlockParam)[] = [];
        if (fullContent) {
          assistantContent.push({ type: "text", text: fullContent });
        }
        for (const toolUse of toolUseBlocks) {
          assistantContent.push({
            type: "tool_use",
            id: toolUse.id,
            name: toolUse.name,
            input: toolUse.input as Record<string, unknown>,
          });
        }
        anthropicMessages.push({ role: "assistant", content: assistantContent });

        // Add tool results as user message
        const toolResultBlocks: Anthropic.ToolResultBlockParam[] = toolResults.map(tr => ({
          type: "tool_result" as const,
          tool_use_id: tr.id,
          content: JSON.stringify(tr.result),
        }));
        anthropicMessages.push({ role: "user", content: toolResultBlocks });
      }

      // Max loops reached
      await send({ type: "text", content: "I've made several changes. Let me know if you need anything else!" });
      await send({ type: "state", state });
      await send({ type: "done" });
      await writer.write(encoder.encode("data: [DONE]\n\n"));
      await writer.close();
    } catch (error) {
      console.error("Prompt builder chat error:", error);
      await send({ type: "error", error: "Failed to process request" });
      await writer.close();
    }
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
