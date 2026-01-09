// src/components/prompts/ai-prompt-creator.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  ExternalLink,
  Loader2,
  ArrowLeft,
  X,
  Wand2,
  Check,
  FolderOpen,
  Tags,
  Lock,
  Globe,
  PenLine,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { getPromptUrl } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "@/components/categories/category-icon";

type Step = "input" | "loading" | "review";

interface AnalysisResult {
  title: string;
  description: string;
  categoryId: string | null;
  tagIds: string[];
}

interface AIPromptCreatorProps {
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
}

export function AIPromptCreator({ categories, tags }: AIPromptCreatorProps) {
  const router = useRouter();
  const t = useTranslations("prompts");
  const [step, setStep] = useState<Step>("input");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for review step
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);

  // Get displayable categories - prefer leaf categories (those with parentId) but fallback to all
  const leafCategories = categories.filter((c) => c.parentId !== null);
  const displayCategories = leafCategories.length > 0 ? leafCategories : categories;

  const handleAnalyze = async () => {
    if (!content.trim()) {
      toast.error(t("contentRequired"));
      return;
    }

    setStep("loading");

    try {
      const response = await fetch("/api/prompts/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze");
      }

      const result: AnalysisResult = await response.json();
      setTitle(result.title || "");
      setDescription(result.description || "");
      setCategoryId(result.categoryId || "");
      setTagIds(result.tagIds || []);
      setStep("review");
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error(t("analysisFailed"));
      setStep("input");
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error(t("titleRequired"));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          content,
          type: "TEXT",
          categoryId: categoryId || undefined,
          tagIds,
          isPrivate,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === "rate_limit") {
          toast.error(t("rateLimitError"));
        } else if (result.error === "duplicate_prompt") {
          toast.error(t("duplicatePromptError"));
        } else {
          throw new Error(result.message || "Failed to create prompt");
        }
        return;
      }

      toast.success(t("promptCreated"));
      router.push(getPromptUrl(result.id, result.slug));
    } catch (error) {
      console.error("Submit failed:", error);
      toast.error(t("createFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep("input");
  };

  const toggleTag = (tagId: string) => {
    setTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const toggleCategory = (catId: string) => {
    setCategoryId((prev) => (prev === catId ? "" : catId));
  };

  // Step 1: Input
  if (step === "input") {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Learn to write prompts link */}
        <Link
          href="/how_to_write_effective_prompts"
          target="_blank"
          className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 hover:border-primary/40 transition-all group"
        >
          <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium">{t("learnHowToWritePrompts")}</span>
            <p className="text-xs text-muted-foreground mt-0.5">Tips for creating effective AI prompts</p>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>

        {/* Main textarea with search-bar-like styling */}
        <div className="relative">
          <div className="absolute left-5 top-5 pointer-events-none">
            <PenLine className="h-5 w-5 text-muted-foreground" />
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("contentPlaceholder")}
            className={cn(
              "w-full min-h-[280px] pl-14 pr-5 pt-5 pb-5 text-base",
              "rounded-3xl resize-none",
              "bg-white dark:bg-zinc-900",
              "border-2 border-transparent",
              "shadow-xl shadow-black/5 dark:shadow-black/20",
              "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20",
              "placeholder:text-muted-foreground",
              "transition-all duration-200"
            )}
          />

          {/* Character count */}
          <div className="absolute right-5 bottom-5 text-xs text-muted-foreground">
            {content.length} chars
          </div>
        </div>

        {/* Analyze button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={!content.trim()}
            className={cn(
              "h-14 px-8 text-lg rounded-full gap-3",
              "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30",
              "transition-all duration-200",
              "disabled:shadow-none"
            )}
          >
            <Wand2 className="h-5 w-5" />
            {t("analyzeAndCreate")}
          </Button>
        </div>

        {/* Helper text */}
        <p className="text-center text-sm text-muted-foreground">
          <Sparkles className="inline h-4 w-4 mr-1.5 text-primary" />
          AI will analyze your prompt and suggest title, description, category & tags
        </p>
      </div>
    );
  }

  // Step 2: Loading
  if (step === "loading") {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-8">
        {/* Prompt preview card */}
        <div className="rounded-3xl bg-gradient-to-br from-muted/50 to-muted/30 p-6 border shadow-sm">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <FileText className="h-4 w-4" />
            {t("yourPrompt")}
          </div>
          <p className="text-sm line-clamp-3 font-mono text-foreground/80">{content}</p>
        </div>

        {/* Loading skeleton with animation */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-14 w-full rounded-2xl" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Skeleton className="h-9 w-24 rounded-full" />
              <Skeleton className="h-9 w-32 rounded-full" />
              <Skeleton className="h-9 w-28 rounded-full" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Skeleton className="h-8 w-16 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="flex items-center justify-center gap-3 py-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <div className="relative p-3 rounded-full bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {t("analyzingPrompt")}
          </span>
        </div>
      </div>
    );
  }

  // Step 3: Review
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Prompt preview card */}
      <div className="rounded-3xl bg-gradient-to-br from-muted/50 to-muted/30 p-6 border shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-4 w-4" />
            {t("yourPrompt")}
          </div>
          <button
            onClick={handleBack}
            className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
          >
            <PenLine className="h-3 w-3" />
            {t("edit")}
          </button>
        </div>
        <p className="text-sm line-clamp-3 font-mono text-foreground/80">{content}</p>
      </div>

      {/* Title */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <FileText className="h-3.5 w-3.5 text-primary" />
          </div>
          {t("promptTitle")}
          <Sparkles className="h-3 w-3 text-amber-500" />
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("titlePlaceholder")}
          className={cn(
            "w-full h-14 px-5 text-base font-medium",
            "rounded-2xl",
            "bg-white dark:bg-zinc-900",
            "border-2 border-muted",
            "shadow-sm",
            "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20",
            "placeholder:text-muted-foreground placeholder:font-normal",
            "transition-all duration-200"
          )}
        />
      </div>

      {/* Description */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <PenLine className="h-3.5 w-3.5 text-primary" />
          </div>
          {t("promptDescription")}
          <Sparkles className="h-3 w-3 text-amber-500" />
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("descriptionPlaceholder")}
          rows={3}
          className={cn(
            "w-full px-5 py-4 text-sm",
            "rounded-2xl resize-none",
            "bg-white dark:bg-zinc-900",
            "border-2 border-muted",
            "shadow-sm",
            "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20",
            "placeholder:text-muted-foreground",
            "transition-all duration-200"
          )}
        />
      </div>

      {/* Category chips */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <div className="p-1.5 rounded-lg bg-blue-500/10">
            <FolderOpen className="h-3.5 w-3.5 text-blue-500" />
          </div>
          {t("promptCategory")}
          <Sparkles className="h-3 w-3 text-amber-500" />
        </label>
        <div className="flex flex-wrap gap-2">
          {displayCategories.map((category) => {
            const isSelected = categoryId === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleCategory(category.id)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 text-sm rounded-full border-2 transition-all duration-200",
                  isSelected
                    ? "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/25"
                    : "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-950 dark:hover:bg-blue-900 dark:border-blue-800 dark:text-blue-300"
                )}
              >
                <CategoryIcon slug={category.slug} size={16} />
                {category.name}
                {isSelected && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tag chips */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <div className="p-1.5 rounded-lg bg-purple-500/10">
            <Tags className="h-3.5 w-3.5 text-purple-500" />
          </div>
          {t("promptTags")}
          <Sparkles className="h-3 w-3 text-amber-500" />
        </label>
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 15).map((tag) => {
            const isSelected = tagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border-2 transition-all duration-200"
                )}
                style={
                  isSelected
                    ? {
                        backgroundColor: tag.color,
                        color: "white",
                        borderColor: tag.color,
                        boxShadow: `0 4px 14px ${tag.color}40`,
                      }
                    : {
                        borderColor: `${tag.color}50`,
                        color: tag.color,
                        backgroundColor: `${tag.color}08`,
                      }
                }
              >
                #{tag.name}
                {isSelected && <X className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Privacy toggle */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-xl transition-colors",
            isPrivate ? "bg-amber-500/10" : "bg-green-500/10"
          )}>
            {isPrivate ? (
              <Lock className="h-4 w-4 text-amber-500" />
            ) : (
              <Globe className="h-4 w-4 text-green-500" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">
              {isPrivate ? "Private Prompt" : "Public Prompt"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isPrivate
                ? "Only you can see this prompt"
                : "Anyone can discover and use this prompt"
              }
            </p>
          </div>
        </div>
        <Switch
          checked={isPrivate}
          onCheckedChange={setIsPrivate}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 gap-4">
        <Button
          variant="ghost"
          size="lg"
          onClick={handleBack}
          className="rounded-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("back")}
        </Button>
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={isSubmitting || !title.trim()}
          className={cn(
            "h-12 px-8 rounded-full gap-2",
            "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30",
            "transition-all duration-200",
            "disabled:shadow-none"
          )}
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="h-5 w-5" />
          )}
          {t("createButton")}
        </Button>
      </div>
    </div>
  );
}
