"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterDropdownProps {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
  }>;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
    color: string;
  }>;
  isOpen: boolean;
  onClose: () => void;
}

const promptTypes = ["TEXT", "STRUCTURED", "IMAGE", "VIDEO", "AUDIO"];

export function FilterDropdown({
  categories,
  tags,
  isOpen,
  onClose,
}: FilterDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const [tagSearch, setTagSearch] = useState("");

  const currentFilters = {
    type: searchParams?.get("type") || "",
    category: searchParams?.get("category") || "",
    sort: searchParams?.get("sort") || "newest",
    tag: searchParams?.get("tag") || "",
  };

  const filteredTags = useMemo(() => {
    if (!tagSearch.trim()) return tags.slice(0, 20);
    const search = tagSearch.toLowerCase();
    return tags.filter((tag) => tag.name.toLowerCase().includes(search));
  }, [tags, tagSearch]);

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/prompts?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.delete("type");
    params.delete("category");
    params.delete("sort");
    params.delete("tag");
    params.delete("page");
    router.push(`/prompts?${params.toString()}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mt-2 animate-in slide-in-from-top-2 duration-200">
      <div className="bg-background border rounded-xl shadow-lg p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">{t("search.advancedFilters")}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={clearAllFilters}
            >
              <X className="h-3 w-3 mr-1" />
              {t("search.clearAll")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {/* Type filter */}
          <div className="space-y-1.5">
            <Label className="text-xs">{t("prompts.promptType")}</Label>
            <Select
              value={currentFilters.type || "all"}
              onValueChange={(value) => updateFilter("type", value === "all" ? null : value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder={t("common.all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                {promptTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`prompts.types.${type.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category filter */}
          <div className="space-y-1.5">
            <Label className="text-xs">{t("prompts.promptCategory")}</Label>
            <Select
              value={currentFilters.category || "all"}
              onValueChange={(value) => updateFilter("category", value === "all" ? null : value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder={t("common.all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                {categories
                  .filter((c) => c.id && !c.parentId)
                  .map((parent) => (
                    <div key={parent.id}>
                      <SelectItem value={parent.id} className="font-medium">
                        {parent.name}
                      </SelectItem>
                      {categories
                        .filter((c) => c.parentId === parent.id)
                        .map((child) => (
                          <SelectItem
                            key={child.id}
                            value={child.id}
                            className="pl-6 text-muted-foreground"
                          >
                            {child.name}
                          </SelectItem>
                        ))}
                    </div>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="space-y-1.5">
            <Label className="text-xs">{t("search.sortBy")}</Label>
            <Select
              value={currentFilters.sort}
              onValueChange={(value) => updateFilter("sort", value === "newest" ? null : value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("search.newest")}</SelectItem>
                <SelectItem value="oldest">{t("search.oldest")}</SelectItem>
                <SelectItem value="upvotes">{t("search.mostUpvoted")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tags Section */}
        {tags.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs">{t("prompts.promptTags")}</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder={t("search.searchTags")}
                className="h-8 text-sm pl-8"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto py-1">
              {filteredTags.map((tag) => (
                <button
                  key={tag.id}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-full border transition-colors",
                    currentFilters.tag === tag.slug
                      ? "border-transparent"
                      : "hover:bg-muted"
                  )}
                  style={
                    currentFilters.tag === tag.slug
                      ? { backgroundColor: tag.color, color: "white", borderColor: tag.color }
                      : { borderColor: tag.color + "40", color: tag.color }
                  }
                  onClick={() =>
                    updateFilter("tag", currentFilters.tag === tag.slug ? null : tag.slug)
                  }
                >
                  {tag.name}
                </button>
              ))}
              {filteredTags.length === 0 && tagSearch && (
                <span className="text-xs text-muted-foreground py-2">
                  {t("search.noResults")}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
