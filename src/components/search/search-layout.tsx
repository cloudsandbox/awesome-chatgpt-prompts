"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PromptsSearchBar } from "./prompts-search-bar";
import { FilterDropdown } from "./filter-dropdown";
import { QuickFilters } from "./quick-filters";
import { ActiveFilters } from "./active-filters";
import { FilterProvider } from "@/components/prompts/filter-context";

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
  trendingSearches?: string[];
}

export function SearchLayout({
  children,
  categories,
  pinnedCategories,
  tags,
  popularTags,
  aiSearchEnabled = false,
  totalResults,
  trendingSearches = ["image generation", "code review", "writing assistant"],
}: SearchLayoutProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchParams = useSearchParams();

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchParams?.get("type")) count++;
    if (searchParams?.get("category")) count++;
    if (searchParams?.get("tag")) count++;
    if (searchParams?.get("sort") && searchParams.get("sort") !== "newest") count++;
    return count;
  }, [searchParams]);

  return (
    <FilterProvider>
      <div className="min-h-screen">
        {/* Search Header */}
        <div className="sticky top-14 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container py-4 space-y-3">
            {/* Search Bar */}
            <PromptsSearchBar
              aiSearchEnabled={aiSearchEnabled}
              onToggleFilters={() => setFiltersOpen(!filtersOpen)}
              filtersOpen={filtersOpen}
              activeFilterCount={activeFilterCount}
            />

            {/* Filter Dropdown */}
            <FilterDropdown
              categories={categories}
              tags={tags}
              isOpen={filtersOpen}
              onClose={() => setFiltersOpen(false)}
            />

            {/* Quick Filters - only show when dropdown is closed */}
            {!filtersOpen && (
              <QuickFilters
                pinnedCategories={pinnedCategories}
                popularTags={popularTags}
                trendingSearches={trendingSearches}
              />
            )}

            {/* Active Filters */}
            <ActiveFilters categories={categories} tags={tags} />
          </div>
        </div>

        {/* Results */}
        <div className="container py-6">
          <div className="mb-4 text-sm text-muted-foreground text-center">
            {totalResults} prompts found
          </div>
          {children}
        </div>
      </div>
    </FilterProvider>
  );
}
