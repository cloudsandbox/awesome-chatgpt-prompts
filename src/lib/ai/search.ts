/**
 * AI-powered search orchestration
 * Uses pgvector for semantic search and Claude for query expansion
 */

import { db } from "@/lib/db";
import { getConfig } from "@/lib/config";
import { generateVoyageQueryEmbedding, isVoyageConfigured } from "./voyage";
import Anthropic from "@anthropic-ai/sdk";

const SIMILARITY_THRESHOLD = 0.4;
const DEFAULT_LIMIT = 20;

// Question words that indicate natural language queries
const QUESTION_WORDS = [
  "what",
  "how",
  "why",
  "where",
  "when",
  "which",
  "who",
  "find",
  "looking",
  "need",
  "want",
  "help",
  "show",
  "give",
  "can",
  "could",
  "would",
  "should",
];

export interface SearchResult {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  content: string;
  similarity: number;
  author: {
    id: string;
    name: string | null;
    username: string;
    avatar: string | null;
    verified?: boolean;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
      color: string;
    };
  }>;
  voteCount: number;
  type: string;
  structuredFormat: string | null;
  mediaUrl: string | null;
  isPrivate: boolean;
  createdAt: Date;
}

export interface GroupedSearchResults {
  results: SearchResult[];
  grouped: Record<string, SearchResult[]>;
  expanded: boolean;
  expandedQuery?: string;
}

/**
 * Detect if query is natural language (vs keywords)
 */
export function isNaturalLanguageQuery(query: string): boolean {
  const words = query.toLowerCase().split(/\s+/);

  // More than 5 words suggests natural language
  if (words.length > 5) return true;

  // Contains question words
  if (words.some((word) => QUESTION_WORDS.includes(word))) return true;

  // Contains question mark
  if (query.includes("?")) return true;

  return false;
}

/**
 * Expand a query using Claude to extract relevant keywords
 */
export async function expandQueryWithClaude(query: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return query;
  }

  try {
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: `You are a search query expander for an AI prompts database. Given a user's search query, expand it into relevant keywords and synonyms that would help find matching AI prompts.

Return ONLY the expanded keywords, comma-separated, no explanations.

Query: "${query}"

Expanded keywords:`,
        },
      ],
    });

    const expandedText =
      response.content[0].type === "text" ? response.content[0].text : "";
    return expandedText.trim() || query;
  } catch (error) {
    console.error("Query expansion failed:", error);
    return query;
  }
}

/**
 * Format embedding array for pgvector query
 */
function formatEmbeddingForPgvector(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

/**
 * Perform semantic search using pgvector
 */
export async function semanticSearchWithPgvector(
  query: string,
  limit: number = DEFAULT_LIMIT
): Promise<SearchResult[]> {
  // Generate embedding for the query
  const queryEmbedding = await generateVoyageQueryEmbedding(query);
  const embeddingStr = formatEmbeddingForPgvector(queryEmbedding);

  // Use raw SQL for pgvector similarity search
  const results = await db.$queryRaw<
    Array<{
      id: string;
      title: string;
      slug: string | null;
      description: string | null;
      content: string;
      type: string;
      structuredFormat: string | null;
      mediaUrl: string | null;
      isPrivate: boolean;
      createdAt: Date;
      similarity: number;
      authorId: string;
      authorName: string | null;
      authorUsername: string;
      authorAvatar: string | null;
      authorVerified: boolean;
      categoryId: string | null;
      categoryName: string | null;
      categorySlug: string | null;
      voteCount: bigint;
    }>
  >`
    SELECT
      p.id,
      p.title,
      p.slug,
      p.description,
      p.content,
      p.type,
      p."structuredFormat",
      p."mediaUrl",
      p."isPrivate",
      p."createdAt",
      1 - (p.embedding <=> ${embeddingStr}::vector) as similarity,
      u.id as "authorId",
      u.name as "authorName",
      u.username as "authorUsername",
      u.avatar as "authorAvatar",
      u.verified as "authorVerified",
      c.id as "categoryId",
      c.name as "categoryName",
      c.slug as "categorySlug",
      COALESCE(v.vote_count, 0) as "voteCount"
    FROM prompts p
    INNER JOIN users u ON p."authorId" = u.id
    LEFT JOIN categories c ON p."categoryId" = c.id
    LEFT JOIN (
      SELECT "promptId", COUNT(*) as vote_count
      FROM prompt_votes
      GROUP BY "promptId"
    ) v ON p.id = v."promptId"
    WHERE p."isPrivate" = false
      AND p."deletedAt" IS NULL
      AND p.embedding IS NOT NULL
      AND 1 - (p.embedding <=> ${embeddingStr}::vector) >= ${SIMILARITY_THRESHOLD}
    ORDER BY p.embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `;

  // Fetch tags for each prompt
  const promptIds = results.map((r) => r.id);
  const tags = await db.promptTag.findMany({
    where: { promptId: { in: promptIds } },
    include: { tag: true },
  });

  const tagsByPromptId = tags.reduce(
    (acc, pt) => {
      if (!acc[pt.promptId]) acc[pt.promptId] = [];
      acc[pt.promptId].push({ tag: pt.tag });
      return acc;
    },
    {} as Record<string, Array<{ tag: typeof tags[0]["tag"] }>>
  );

  return results.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    description: r.description,
    content: r.content,
    type: r.type,
    structuredFormat: r.structuredFormat,
    mediaUrl: r.mediaUrl,
    isPrivate: r.isPrivate,
    createdAt: r.createdAt,
    similarity: Number(r.similarity),
    voteCount: Number(r.voteCount),
    author: {
      id: r.authorId,
      name: r.authorName,
      username: r.authorUsername,
      avatar: r.authorAvatar,
      verified: r.authorVerified,
    },
    category: r.categoryId
      ? {
          id: r.categoryId,
          name: r.categoryName!,
          slug: r.categorySlug!,
        }
      : null,
    tags: tagsByPromptId[r.id] || [],
  }));
}

/**
 * Group search results by category
 */
export function groupResultsByCategory(
  results: SearchResult[]
): Record<string, SearchResult[]> {
  const grouped: Record<string, SearchResult[]> = {};

  for (const result of results) {
    const categoryName = result.category?.name || "Uncategorized";
    if (!grouped[categoryName]) {
      grouped[categoryName] = [];
    }
    grouped[categoryName].push(result);
  }

  // Sort categories by number of results (descending)
  const sortedGrouped: Record<string, SearchResult[]> = {};
  const sortedKeys = Object.keys(grouped).sort(
    (a, b) => grouped[b].length - grouped[a].length
  );
  for (const key of sortedKeys) {
    sortedGrouped[key] = grouped[key];
  }

  return sortedGrouped;
}

/**
 * Main search function with optional query expansion
 */
export async function aiSearch(
  query: string,
  options: {
    expand?: boolean;
    limit?: number;
  } = {}
): Promise<GroupedSearchResults> {
  const { expand = false, limit = DEFAULT_LIMIT } = options;

  // Auto-detect if expansion should be enabled
  const shouldExpand = expand || isNaturalLanguageQuery(query);

  let searchQuery = query;
  let expandedQuery: string | undefined;

  if (shouldExpand) {
    expandedQuery = await expandQueryWithClaude(query);
    searchQuery = expandedQuery;
  }

  const results = await semanticSearchWithPgvector(searchQuery, limit);
  const grouped = groupResultsByCategory(results);

  return {
    results,
    grouped,
    expanded: shouldExpand,
    expandedQuery,
  };
}

/**
 * Check if AI search is available
 */
export async function isAISearchAvailable(): Promise<{
  available: boolean;
  error?: string;
}> {
  const config = await getConfig();

  if (!config.features.aiSearch) {
    return { available: false, error: "AI Search is disabled in configuration" };
  }

  if (!isVoyageConfigured()) {
    return { available: false, error: "VOYAGE_API_KEY is not configured" };
  }

  return { available: true };
}
