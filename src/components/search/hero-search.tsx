"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroSearchProps {
  aiSearchEnabled?: boolean;
}

export function HeroSearch({ aiSearchEnabled = false }: HeroSearchProps) {
  const router = useRouter();
  const t = useTranslations("search");
  const [query, setQuery] = useState("");
  const [expand, setExpand] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim()) return;

      setIsSearching(true);
      const params = new URLSearchParams();
      params.set("q", query.trim());
      if (expand && aiSearchEnabled) {
        params.set("expand", "1");
      }
      router.push(`/prompts?${params.toString()}`);
    },
    [query, expand, aiSearchEnabled, router]
  );

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
                onClick={() => setExpand(!expand)}
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
              disabled={!query.trim() || isSearching}
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
