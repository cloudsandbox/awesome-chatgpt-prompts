import { NextRequest, NextResponse } from "next/server";
import { aiSearch, isAISearchAvailable } from "@/lib/ai/search";
import { db } from "@/lib/db";

/**
 * Unified search endpoint
 * Supports both AI-powered semantic search and basic text search fallback
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const expand = searchParams.get("expand") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Check if AI search is available
    const { available, error } = await isAISearchAvailable();

    if (available) {
      // Use AI-powered search
      const results = await aiSearch(query, { expand, limit });

      return NextResponse.json({
        ...results,
        query,
        count: results.results.length,
        mode: "ai",
      });
    } else {
      // Fallback to basic text search
      const results = await basicTextSearch(query, limit);
      const grouped = groupByCategory(results);

      return NextResponse.json({
        results,
        grouped,
        query,
        count: results.length,
        mode: "text",
        aiError: error,
      });
    }
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

/**
 * Basic text search fallback when AI search is not available
 */
async function basicTextSearch(query: string, limit: number) {
  const results = await db.prompt.findMany({
    where: {
      isPrivate: false,
      deletedAt: null,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
      ],
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      content: true,
      type: true,
      structuredFormat: true,
      mediaUrl: true,
      isPrivate: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          verified: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      _count: {
        select: { votes: true },
      },
    },
  });

  return results.map((r) => ({
    ...r,
    voteCount: r._count.votes,
    similarity: 1, // Not applicable for text search
  }));
}

/**
 * Group results by category
 */
function groupByCategory(
  results: Array<{ category: { name: string } | null; [key: string]: unknown }>
) {
  const grouped: Record<string, typeof results> = {};

  for (const result of results) {
    const categoryName = result.category?.name || "Uncategorized";
    if (!grouped[categoryName]) {
      grouped[categoryName] = [];
    }
    grouped[categoryName].push(result);
  }

  // Sort by count
  const sorted: Record<string, typeof results> = {};
  const keys = Object.keys(grouped).sort(
    (a, b) => grouped[b].length - grouped[a].length
  );
  for (const key of keys) {
    sorted[key] = grouped[key];
  }

  return sorted;
}
