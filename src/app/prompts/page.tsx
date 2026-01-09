import { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { unstable_cache } from "next/cache";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfinitePromptList } from "@/components/prompts/infinite-prompt-list";
import { SearchLayout } from "@/components/search/search-layout";
import { db } from "@/lib/db";
import { aiSearch, isAISearchAvailable } from "@/lib/ai/search";

export const metadata: Metadata = {
  title: "Prompts",
  description: "Browse and discover AI prompts",
};

// Query for categories (cached)
const getCategories = unstable_cache(
  async () => {
    return db.category.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
      },
    });
  },
  ["categories"],
  { tags: ["categories"] }
);

// Query for pinned categories (cached)
const getPinnedCategories = unstable_cache(
  async () => {
    return db.category.findMany({
      where: { pinned: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
      },
    });
  },
  ["pinned-categories"],
  { tags: ["categories"] }
);

// Query for tags (cached)
const getTags = unstable_cache(
  async () => {
    return db.tag.findMany({
      orderBy: { name: "asc" },
    });
  },
  ["tags"],
  { tags: ["tags"] }
);

// Query for popular tags (most used)
const getPopularTags = unstable_cache(
  async () => {
    const result = await db.promptTag.groupBy({
      by: ["tagId"],
      _count: { tagId: true },
      orderBy: { _count: { tagId: "desc" } },
      take: 8,
    });

    const tagIds = result.map((r) => r.tagId);
    const tags = await db.tag.findMany({
      where: { id: { in: tagIds } },
    });

    // Sort by usage count
    return tagIds
      .map((id) => tags.find((t) => t.id === id))
      .filter((t): t is NonNullable<typeof t> => t !== undefined);
  },
  ["popular-tags"],
  { tags: ["tags"] }
);

// Query for prompts list (cached)
function getCachedPrompts(
  where: Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orderBy: any,
  perPage: number
) {
  const cacheKey = JSON.stringify({ where, orderBy, perPage });

  return unstable_cache(
    async () => {
      const [promptsRaw, totalCount] = await Promise.all([
        db.prompt.findMany({
          where,
          orderBy,
          skip: 0,
          take: perPage,
          include: {
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
              include: {
                parent: {
                  select: { id: true, name: true, slug: true },
                },
              },
            },
            tags: {
              include: {
                tag: true,
              },
            },
            contributors: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true,
              },
            },
            _count: {
              select: { votes: true, contributors: true },
            },
          },
        }),
        db.prompt.count({ where }),
      ]);

      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        prompts: promptsRaw.map((p: any) => ({
          ...p,
          voteCount: p._count.votes,
          contributorCount: p._count.contributors,
          contributors: p.contributors,
        })),
        total: totalCount,
      };
    },
    ["prompts", cacheKey],
    { tags: ["prompts"] }
  )();
}

interface PromptsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    sort?: string;
    page?: string;
    expand?: string;
  }>;
}

export default async function PromptsPage({ searchParams }: PromptsPageProps) {
  const t = await getTranslations("prompts");
  const params = await searchParams;

  const perPage = 24;
  const { available: aiSearchAvailable } = await isAISearchAvailable();
  const useAISearch = aiSearchAvailable && params.q;
  const expandSearch = params.expand === "1";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prompts: any[] = [];
  let total = 0;

  if (useAISearch && params.q) {
    try {
      const searchQuery = params.q
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
        .join(" ");
      const aiResults = await aiSearch(searchQuery, {
        expand: expandSearch,
        limit: perPage,
      });

      prompts = aiResults.results.map((p) => ({
        ...p,
        contributorCount: 0,
      }));
      total = prompts.length;
    } catch {
      // Fallback to regular search on error
    }
  }

  // Regular search if AI search not used or failed
  if (!useAISearch || prompts.length === 0) {
    const where: Record<string, unknown> = {
      isPrivate: false,
      isUnlisted: false,
      deletedAt: null,
    };

    if (params.q) {
      const keywords = params.q
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
      if (keywords.length > 1) {
        where.OR = keywords.flatMap((keyword) => [
          { title: { contains: keyword, mode: "insensitive" } },
          { content: { contains: keyword, mode: "insensitive" } },
          { description: { contains: keyword, mode: "insensitive" } },
        ]);
      } else {
        where.OR = [
          { title: { contains: params.q, mode: "insensitive" } },
          { content: { contains: params.q, mode: "insensitive" } },
          { description: { contains: params.q, mode: "insensitive" } },
        ];
      }
    }

    if (params.category) {
      where.categoryId = params.category;
    }

    if (params.tag) {
      where.tags = {
        some: {
          tag: {
            slug: params.tag,
          },
        },
      };
    }

    const isUpvoteSort = params.sort === "upvotes";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = { createdAt: "desc" };
    if (params.sort === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (isUpvoteSort) {
      orderBy = { votes: { _count: "desc" } };
    }

    const result = await getCachedPrompts(where, orderBy, perPage);
    prompts = result.prompts;
    total = result.total;
  }

  // Fetch all required data
  const [categories, pinnedCategories, tags, popularTags] = await Promise.all([
    getCategories(),
    getPinnedCategories(),
    getTags(),
    getPopularTags(),
  ]);

  return (
    <>
      {/* Fixed Create Button */}
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        <Button size="lg" className="rounded-full shadow-lg h-14 w-14 p-0" asChild>
          <Link href="/prompts/new">
            <Plus className="h-6 w-6" />
            <span className="sr-only">{t("create")}</span>
          </Link>
        </Button>
      </div>

      {/* Desktop Create Button */}
      <div className="hidden lg:block fixed top-20 right-6 z-50">
        <Button asChild>
          <Link href="/prompts/new">
            <Plus className="h-4 w-4 mr-2" />
            {t("create")}
          </Link>
        </Button>
      </div>

      <SearchLayout
        categories={categories}
        pinnedCategories={pinnedCategories}
        tags={tags}
        popularTags={popularTags}
        aiSearchEnabled={aiSearchAvailable}
        totalResults={total}
      >
        <InfinitePromptList
          initialPrompts={prompts}
          initialTotal={total}
          filters={{
            q: params.q,
            category: params.category,
            tag: params.tag,
            sort: params.sort,
          }}
        />
      </SearchLayout>
    </>
  );
}
