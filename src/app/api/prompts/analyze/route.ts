// src/app/api/prompts/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const { content } = await request.json();
  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  // Fetch available categories and tags for context
  // First try leaf categories (with parentId), fallback to all categories
  const [leafCategories, allCategories, tags] = await Promise.all([
    db.category.findMany({
      where: { parentId: { not: null } },
      select: { id: true, name: true, slug: true },
    }),
    db.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
    db.tag.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Use leaf categories if available, otherwise all categories
  const categories = leafCategories.length > 0 ? leafCategories : allCategories;

  const systemPrompt = `You are analyzing a prompt to extract metadata. Given the prompt content, generate:
1. A concise title (max 60 chars)
2. A brief description (1-2 sentences, max 200 chars)
3. The BEST matching category from the list - YOU MUST ALWAYS select one, pick the closest match
4. 3-5 relevant tags from the list

Available categories: ${categories.map(c => `${c.name} (${c.id})`).join(", ")}
Available tags: ${tags.map(t => `${t.name} (${t.id})`).join(", ")}

IMPORTANT RULES:
1. You MUST always select a categoryId. Never return null. Pick the closest matching category.
2. Respond with ONLY the JSON object, no explanations, no markdown, no extra text.

{
  "title": "string",
  "description": "string",
  "categoryId": "string (REQUIRED)",
  "tagIds": ["array of 3-5 tag IDs"]
}`;

  try {
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `${systemPrompt}\n\nAnalyze this prompt:\n\n${content}`,
        },
      ],
    });

    const responseText = response.content[0].type === "text" ? response.content[0].text : "";

    // Parse JSON from response (handle potential markdown code blocks and extra text)
    let jsonStr = responseText.trim();

    // Remove markdown code blocks if present
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```[\s\S]*$/, "");
    }

    // Extract JSON object - find the first { and matching }
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }
    jsonStr = jsonMatch[0];

    const result = JSON.parse(jsonStr);

    // Validate categoryId exists, fallback to first category if invalid or null
    if (!result.categoryId || !categories.find(c => c.id === result.categoryId)) {
      // Pick first category as fallback (should rarely happen with updated prompt)
      result.categoryId = categories[0]?.id || null;
    }

    // Filter to valid tagIds only
    const validTagIds = new Set(tags.map(t => t.id));
    result.tagIds = (result.tagIds || []).filter((id: string) => validTagIds.has(id));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analyze prompt error:", error);
    return NextResponse.json(
      { error: "Failed to analyze prompt" },
      { status: 500 }
    );
  }
}
