"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state with URL params when they change (e.g., from navigation)
  useEffect(() => {
    setQuery(searchParams?.get("q") || "");
    setExpand(searchParams?.get("expand") === "1");
  }, [searchParams]);

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
      <div className="relative flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder={t("placeholder")}
            className={cn(
              "w-full h-14 pl-12 pr-4 text-lg rounded-full",
              "bg-white dark:bg-zinc-900",
              "border-2 border-transparent",
              "shadow-lg shadow-black/5 dark:shadow-black/20",
              "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20",
              "placeholder:text-muted-foreground",
              "transition-all duration-200",
              aiSearchEnabled && "pr-24"
            )}
          />

          {/* Right side buttons */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
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
                <Sparkles className="h-5 w-5" />
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
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Helper text */}
      {aiSearchEnabled && (
        <p className="text-center text-sm text-muted-foreground mt-3">
          {expand ? t("expandSearchHint") : t("semanticSearchHint")}
        </p>
      )}
    </form>
  );
}
