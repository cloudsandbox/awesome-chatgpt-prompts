"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActiveFiltersProps {
  categories: Array<{
    id: string;
    name: string;
  }>;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
    color: string;
  }>;
}

export function ActiveFilters({ categories, tags }: ActiveFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();

  const currentType = searchParams?.get("type") || "";
  const currentCategory = searchParams?.get("category") || "";
  const currentTag = searchParams?.get("tag") || "";
  const currentSort = searchParams?.get("sort") || "";

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.delete(key);
    params.delete("page");
    router.push(`/prompts?${params.toString()}`);
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.delete("type");
    params.delete("category");
    params.delete("tag");
    params.delete("sort");
    params.delete("page");
    router.push(`/prompts?${params.toString()}`);
  };

  // Build list of active filters
  const activeFilters: Array<{
    key: string;
    label: string;
    value: string;
    color?: string;
  }> = [];

  if (currentType) {
    activeFilters.push({
      key: "type",
      label: t("prompts.promptType"),
      value: t(`prompts.types.${currentType.toLowerCase()}`),
    });
  }

  if (currentCategory) {
    const category = categories.find((c) => c.id === currentCategory);
    if (category) {
      activeFilters.push({
        key: "category",
        label: t("prompts.promptCategory"),
        value: category.name,
      });
    }
  }

  if (currentTag) {
    const tag = tags.find((t) => t.slug === currentTag);
    if (tag) {
      activeFilters.push({
        key: "tag",
        label: t("prompts.promptTags"),
        value: tag.name,
        color: tag.color,
      });
    }
  }

  if (currentSort && currentSort !== "newest") {
    activeFilters.push({
      key: "sort",
      label: t("search.sortBy"),
      value: t(`search.${currentSort === "oldest" ? "oldest" : "mostUpvoted"}`),
    });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-sm text-muted-foreground">{t("search.activeFilters")}:</span>

        {activeFilters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => removeFilter(filter.key)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-sm rounded-full bg-muted hover:bg-muted/80 transition-colors group"
            style={
              filter.color
                ? { backgroundColor: filter.color + "20", color: filter.color }
                : undefined
            }
          >
            <span className="text-muted-foreground text-xs">{filter.label}:</span>
            <span className="font-medium">{filter.value}</span>
            <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
          </button>
        ))}

        {activeFilters.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
            onClick={clearAll}
          >
            {t("search.clearAll")}
          </Button>
        )}
      </div>
    </div>
  );
}
