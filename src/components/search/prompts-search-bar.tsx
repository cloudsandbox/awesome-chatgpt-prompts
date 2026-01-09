"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptsSearchBarProps {
  aiSearchEnabled?: boolean;
}

export function PromptsSearchBar({ aiSearchEnabled = false }: PromptsSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("search");

  const [query, setQuery] = useState(searchParams?.get("q") || "");
  const [expand, setExpand] = useState(searchParams?.get("expand") === "1");
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const updateSearch = useCallback(
    (newQuery: string, newExpand: boolean) => {
      const params = new URLSearchParams(searchParams?.toString() || "");

      if (newQuery.trim()) {
        params.set("q", newQuery.trim());
      } else {
        params.delete("q");
      }

      if (newExpand && aiSearchEnabled) {
        params.set("expand", "1");
      } else {
        params.delete("expand");
      }

      params.delete("page");
      router.push(`/prompts?${params.toString()}`);
    },
    [searchParams, aiSearchEnabled, router]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setIsSearching(true);
      updateSearch(value, expand);
      setTimeout(() => setIsSearching(false), 300);
    }, 300);
  };

  const handleExpandToggle = () => {
    const newExpand = !expand;
    setExpand(newExpand);
    if (query.trim()) {
      updateSearch(query, newExpand);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setIsSearching(true);
    updateSearch(query, expand);
    setTimeout(() => setIsSearching(false), 300);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={t("placeholder")}
          className={cn(
            "w-full h-11 pl-12 pr-4 text-base rounded-full",
            "bg-background",
            "border border-input",
            "shadow-sm",
            "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            "placeholder:text-muted-foreground",
            "transition-all duration-200",
            aiSearchEnabled && "pr-24"
          )}
        />

        {/* Right side buttons */}
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* Expand toggle */}
          {aiSearchEnabled && (
            <button
              type="button"
              onClick={handleExpandToggle}
              className={cn(
                "p-2 rounded-full transition-colors",
                expand
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground"
              )}
              title={t("expandSearch")}
            >
              <Sparkles className="h-4 w-4" />
            </button>
          )}

          {/* Search button */}
          <button
            type="submit"
            disabled={isSearching}
            className={cn(
              "p-2 rounded-full transition-colors",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Helper text */}
      {aiSearchEnabled && (
        <p className="text-center text-xs text-muted-foreground mt-2">
          {expand ? t("expandSearchHint") : t("semanticSearchHint")}
        </p>
      )}
    </form>
  );
}
