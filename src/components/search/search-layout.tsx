"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { PromptsSearchBar } from "./prompts-search-bar";
import { FilterProvider } from "@/components/prompts/filter-context";
import { CategoryIcon } from "@/components/categories/category-icon";
import { cn } from "@/lib/utils";
import { Clock, TrendingUp } from "lucide-react";

interface SearchLayoutProps {
  children: React.ReactNode;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
  }>;
  pinnedCategories: Array<{
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
  }>;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
    color: string;
  }>;
  popularTags: Array<{
    id: string;
    name: string;
    slug: string;
    color: string;
  }>;
  aiSearchEnabled?: boolean;
  totalResults: number;
}

const sortOptions = [
  { value: "", label: "Newest", icon: Clock },
  { value: "oldest", label: "Oldest", icon: Clock },
  { value: "upvotes", label: "Top", icon: TrendingUp },
];

export function SearchLayout({
  children,
  pinnedCategories,
  popularTags,
  aiSearchEnabled = false,
  totalResults,
}: SearchLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();

  const currentCategory = searchParams?.get("category") || "";
  const currentTag = searchParams?.get("tag") || "";
  const currentSort = searchParams?.get("sort") || "";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/prompts?${params.toString()}`);
  };

  const toggleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`/prompts?${params.toString()}`);
  };

  return (
    <FilterProvider>
      <div className="min-h-screen">
        {/* Search Header */}
        <div className="sticky top-14 z-40 bg-muted/50 backdrop-blur supports-[backdrop-filter]:bg-muted/40 border-b">
          <div className="container py-4 space-y-3">
            {/* Search Bar */}
            <PromptsSearchBar aiSearchEnabled={aiSearchEnabled} />

            {/* Sort Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {sortOptions.map((sort) => {
                const Icon = sort.icon;
                const isActive = currentSort === sort.value;
                return (
                  <button
                    key={sort.value || "newest"}
                    onClick={() => updateFilter("sort", sort.value)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-all",
                      isActive
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background hover:bg-muted border-input text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {sort.label}
                  </button>
                );
              })}
            </div>

            {/* Categories Row */}
            {pinnedCategories.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <span className="text-xs text-muted-foreground mr-1">Categories:</span>
                {pinnedCategories.map((category) => {
                  const isActive = currentCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => toggleFilter("category", category.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 text-sm rounded-full border transition-all",
                        isActive
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-950 dark:hover:bg-blue-900 dark:border-blue-800 dark:text-blue-300"
                      )}
                    >
                      <CategoryIcon slug={category.slug} icon={category.icon} size={14} />
                      {category.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Tags Row */}
            {popularTags.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <span className="text-xs text-muted-foreground mr-1">Tags:</span>
                {popularTags.slice(0, 6).map((tag) => {
                  const isActive = currentTag === tag.slug;
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleFilter("tag", tag.slug)}
                      className={cn(
                        "px-3 py-1 text-sm rounded-full border transition-all"
                      )}
                      style={
                        isActive
                          ? {
                              backgroundColor: tag.color,
                              color: "white",
                              borderColor: tag.color,
                            }
                          : {
                              borderColor: tag.color + "50",
                              color: tag.color,
                            }
                      }
                    >
                      #{tag.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="container py-6">
          <div className="mb-4 text-sm text-muted-foreground text-center">
            {totalResults} {t("search.found", { count: totalResults }).replace(/^\d+\s*/, "")}
          </div>
          {children}
        </div>
      </div>
    </FilterProvider>
  );
}
