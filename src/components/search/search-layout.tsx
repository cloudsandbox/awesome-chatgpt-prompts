"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { PromptsSearchBar } from "./prompts-search-bar";
import { FilterProvider } from "@/components/prompts/filter-context";
import { cn } from "@/lib/utils";
import {
  FileText,
  Image,
  Video,
  Music,
  LayoutGrid,
  Clock,
  TrendingUp,
  ArrowUpDown,
} from "lucide-react";

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

const promptTypes = [
  { value: "", label: "All", icon: LayoutGrid },
  { value: "TEXT", label: "Text", icon: FileText },
  { value: "IMAGE", label: "Image", icon: Image },
  { value: "VIDEO", label: "Video", icon: Video },
  { value: "AUDIO", label: "Audio", icon: Music },
];

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

  const currentType = searchParams?.get("type") || "";
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
        <div className="sticky top-14 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container py-4 space-y-3">
            {/* Search Bar */}
            <PromptsSearchBar aiSearchEnabled={aiSearchEnabled} />

            {/* Type + Sort Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {/* Type chips */}
              {promptTypes.map((type) => {
                const Icon = type.icon;
                const isActive = currentType === type.value;
                return (
                  <button
                    key={type.value || "all"}
                    onClick={() => updateFilter("type", type.value)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted border-input text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {type.label}
                  </button>
                );
              })}

              <div className="w-px h-5 bg-border mx-1" />

              {/* Sort chips */}
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

            {/* Category + Tag Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {/* Pinned Categories */}
              {pinnedCategories.map((category) => {
                const isActive = currentCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleFilter("category", category.id)}
                    className={cn(
                      "px-3 py-1 text-sm rounded-full border transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted border-input"
                    )}
                  >
                    {category.name}
                  </button>
                );
              })}

              {pinnedCategories.length > 0 && popularTags.length > 0 && (
                <div className="w-px h-5 bg-border mx-1" />
              )}

              {/* Popular Tags */}
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
                    {tag.name}
                  </button>
                );
              })}
            </div>
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
