"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickFiltersProps {
  pinnedCategories: Array<{
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
  }>;
  popularTags: Array<{
    id: string;
    name: string;
    slug: string;
    color: string;
  }>;
  trendingSearches?: string[];
}

export function QuickFilters({
  pinnedCategories,
  popularTags,
  trendingSearches = [],
}: QuickFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("search");

  const currentCategory = searchParams?.get("category") || "";
  const currentTag = searchParams?.get("tag") || "";
  const currentQuery = searchParams?.get("q") || "";

  const toggleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    const currentValue = params.get(key);

    if (currentValue === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`/prompts?${params.toString()}`);
  };

  const setSearchQuery = (query: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (currentQuery === query) {
      params.delete("q");
    } else {
      params.set("q", query);
    }
    params.delete("page");
    router.push(`/prompts?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {/* Pinned Categories */}
        {pinnedCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => toggleFilter("category", category.id)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-full border transition-all",
              "hover:shadow-sm",
              currentCategory === category.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-muted border-input"
            )}
          >
            {category.name}
          </button>
        ))}

        {/* Separator */}
        {pinnedCategories.length > 0 && popularTags.length > 0 && (
          <div className="w-px h-6 bg-border mx-1" />
        )}

        {/* Popular Tags */}
        {popularTags.slice(0, 5).map((tag) => (
          <button
            key={tag.id}
            onClick={() => toggleFilter("tag", tag.slug)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-full border transition-all",
              "hover:shadow-sm"
            )}
            style={
              currentTag === tag.slug
                ? { backgroundColor: tag.color, color: "white", borderColor: tag.color }
                : { borderColor: tag.color + "60", color: tag.color }
            }
          >
            {tag.name}
          </button>
        ))}

        {/* Separator */}
        {(pinnedCategories.length > 0 || popularTags.length > 0) &&
          trendingSearches.length > 0 && (
            <div className="w-px h-6 bg-border mx-1" />
          )}

        {/* Trending Searches */}
        {trendingSearches.slice(0, 3).map((search) => (
          <button
            key={search}
            onClick={() => setSearchQuery(search)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-full border transition-all",
              "hover:shadow-sm flex items-center gap-1.5",
              currentQuery === search
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-background hover:bg-muted border-input text-muted-foreground"
            )}
          >
            <TrendingUp className="h-3 w-3" />
            {search}
          </button>
        ))}
      </div>
    </div>
  );
}
