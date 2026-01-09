import { NextRequest, NextResponse } from "next/server";
import { aiSearch, isAISearchAvailable } from "@/lib/ai/search";

/**
 * Legacy AI search endpoint - redirects to new unified search
 * Kept for backwards compatibility
 */
export async function GET(request: NextRequest) {
  try {
    const { available, error } = await isAISearchAvailable();
    if (!available) {
      return NextResponse.json(
        { error: error || "AI Search is not enabled" },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const expand = searchParams.get("expand") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const { results, grouped, expanded, expandedQuery } = await aiSearch(query, { expand, limit });

    return NextResponse.json({
      results,
      grouped,
      query,
      count: results.length,
      expanded,
      expandedQuery,
    });
  } catch (error) {
    console.error("AI Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
