# AI-First Prompt Creation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the complex prompt creation form with a 3-step AI-first flow: input prompt → AI analyzes → review & submit.

**Architecture:** Single page with React state managing 3 steps. New API endpoint `/api/prompts/analyze` extracts metadata from prompt content. Existing prompt creation API unchanged.

**Tech Stack:** Next.js 16, React 19, TypeScript, OpenAI API, Tailwind CSS, shadcn/ui

---

## Task 1: Create the Analyze API Endpoint

**Files:**
- Create: `src/app/api/prompts/analyze/route.ts`

**Step 1: Create the analyze API route**

```typescript
// src/app/api/prompts/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const openai = new OpenAI();
const MODEL = process.env.OPENAI_GENERATIVE_MODEL || "gpt-4o-mini";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content } = await request.json();
  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  // Fetch available categories and tags for context
  const [categories, tags] = await Promise.all([
    db.category.findMany({
      where: { parentId: { not: null } }, // Only leaf categories
      select: { id: true, name: true, slug: true },
    }),
    db.tag.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const systemPrompt = `You are analyzing a prompt to extract metadata. Given the prompt content, generate:
1. A concise title (max 60 chars)
2. A brief description (1-2 sentences, max 200 chars)
3. The best matching category from the list
4. 2-4 relevant tags from the list

Available categories: ${categories.map(c => `${c.name} (${c.id})`).join(", ")}
Available tags: ${tags.map(t => `${t.name} (${t.id})`).join(", ")}

Respond in JSON format:
{
  "title": "string",
  "description": "string",
  "categoryId": "string or null",
  "tagIds": ["string array"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this prompt:\n\n${content}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    // Validate categoryId exists
    if (result.categoryId && !categories.find(c => c.id === result.categoryId)) {
      result.categoryId = null;
    }

    // Filter to valid tagIds only
    const validTagIds = new Set(tags.map(t => t.id));
    result.tagIds = (result.tagIds || []).filter((id: string) => validTagIds.has(id));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analyze prompt error:", error);
    return NextResponse.json(
      { error: "Failed to analyze prompt" },
      { status: 500 }
    );
  }
}
```

**Step 2: Verify the endpoint works**

Run: `curl -X POST http://localhost:3000/api/prompts/analyze -H "Content-Type: application/json" -d '{"content":"Act as a senior engineer"}' -v`

Expected: 401 Unauthorized (since no session) - confirms route exists

**Step 3: Commit**

```bash
git add src/app/api/prompts/analyze/route.ts
git commit -m "feat(api): add /api/prompts/analyze endpoint for AI metadata extraction"
```

---

## Task 2: Create AI Prompt Creator Component - Step 1 (Input)

**Files:**
- Create: `src/components/prompts/ai-prompt-creator.tsx`

**Step 1: Create the component with Step 1 UI**

```typescript
// src/components/prompts/ai-prompt-creator.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Sparkles, BookOpen, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for review step
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);

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
      setAnalysis(result);
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

  // Step 1: Input
  if (step === "input") {
    return (
      <div className="space-y-4">
        {/* Learn to write prompts link */}
        <Link
          href="/how_to_write_effective_prompts"
          target="_blank"
          className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors text-sm text-muted-foreground hover:text-foreground"
        >
          <BookOpen className="h-4 w-4 text-primary" />
          <span>{t("learnHowToWritePrompts")}</span>
          <ExternalLink className="h-3 w-3 ml-auto" />
        </Link>

        {/* Main textarea */}
        <div className="space-y-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("contentPlaceholder")}
            className="min-h-[300px] font-mono text-sm"
          />
        </div>

        {/* Analyze button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={!content.trim()}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {t("analyzeAndCreate")}
          </Button>
        </div>
      </div>
    );
  }

  // Step 2: Loading - will be implemented in Task 3
  if (step === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Step 3: Review - will be implemented in Task 4
  return (
    <div className="text-center py-16 text-muted-foreground">
      Review step (to be implemented)
    </div>
  );
}
```

**Step 2: Add translation keys**

Edit `messages/en.json` and add under "prompts":
```json
"analyzeAndCreate": "Analyze & Create",
"analysisFailed": "Failed to analyze prompt. Please try again.",
```

**Step 3: Commit**

```bash
git add src/components/prompts/ai-prompt-creator.tsx messages/en.json
git commit -m "feat(ui): add AIPromptCreator component with input step"
```

---

## Task 3: Add Loading Step with Skeleton UI

**Files:**
- Modify: `src/components/prompts/ai-prompt-creator.tsx`

**Step 1: Add skeleton loading state**

Replace the loading step section in `ai-prompt-creator.tsx`:

```typescript
// Add import at top
import { Skeleton } from "@/components/ui/skeleton";

// Replace the loading step (around line 95)
if (step === "loading") {
  return (
    <div className="space-y-6">
      {/* Prompt preview */}
      <div className="rounded-lg border bg-muted/20 p-4">
        <div className="text-xs text-muted-foreground mb-2">{t("yourPrompt")}</div>
        <p className="text-sm line-clamp-3">{content}</p>
      </div>

      {/* Skeleton fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("analyzingPrompt")}
      </div>
    </div>
  );
}
```

**Step 2: Add translation key**

Edit `messages/en.json`:
```json
"yourPrompt": "Your Prompt",
"analyzingPrompt": "Analyzing your prompt..."
```

**Step 3: Commit**

```bash
git add src/components/prompts/ai-prompt-creator.tsx messages/en.json
git commit -m "feat(ui): add skeleton loading state for prompt analysis"
```

---

## Task 4: Add Review Step with Editable Fields

**Files:**
- Modify: `src/components/prompts/ai-prompt-creator.tsx`

**Step 1: Add review step with editable form**

Replace the review step section and add submission logic:

```typescript
// Add imports at top
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, X } from "lucide-react";
import { getPromptUrl } from "@/lib/urls";

// Add handleSubmit function before the return statements
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

// Replace the review step return (the last return statement)
// Step 3: Review
return (
  <div className="space-y-6">
    {/* Prompt preview */}
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{t("yourPrompt")}</span>
        <Button variant="ghost" size="sm" onClick={handleBack}>
          {t("edit")}
        </Button>
      </div>
      <p className="text-sm line-clamp-3 font-mono">{content}</p>
    </div>

    {/* Editable fields */}
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          {t("promptTitle")}
          <Sparkles className="h-3 w-3 text-primary" />
        </Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("titlePlaceholder")}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          {t("promptDescription")}
          <Sparkles className="h-3 w-3 text-primary" />
        </Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("descriptionPlaceholder")}
          rows={2}
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          {t("promptCategory")}
          <Sparkles className="h-3 w-3 text-primary" />
        </Label>
        <Select value={categoryId || "__none__"} onValueChange={(v) => setCategoryId(v === "__none__" ? "" : v)}>
          <SelectTrigger>
            <SelectValue placeholder={t("selectCategory")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">{t("noCategory")}</SelectItem>
            {categories
              .filter((c) => !c.parentId)
              .map((parent) => (
                <div key={parent.id}>
                  <SelectItem value={parent.id} className="font-medium">
                    {parent.name}
                  </SelectItem>
                  {categories
                    .filter((c) => c.parentId === parent.id)
                    .map((child) => (
                      <SelectItem key={child.id} value={child.id} className="pl-6">
                        {child.name}
                      </SelectItem>
                    ))}
                </div>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          {t("promptTags")}
          <Sparkles className="h-3 w-3 text-primary" />
        </Label>
        <div className="flex flex-wrap gap-2">
          {tagIds.map((tagId) => {
            const tag = tags.find((t) => t.id === tagId);
            if (!tag) return null;
            return (
              <Badge
                key={tag.id}
                style={{ backgroundColor: tag.color }}
                className="text-white pr-1"
              >
                {tag.name}
                <button
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          <Select onValueChange={(v) => toggleTag(v)}>
            <SelectTrigger className="w-auto h-6 text-xs">
              <span>+ {t("addTag")}</span>
            </SelectTrigger>
            <SelectContent>
              {tags
                .filter((t) => !tagIds.includes(t.id))
                .map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </span>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Privacy toggle */}
      <div className="flex items-center gap-3 pt-2">
        <Switch
          checked={isPrivate}
          onCheckedChange={setIsPrivate}
        />
        <Label>{t("promptPrivate")}</Label>
      </div>
    </div>

    {/* Actions */}
    <div className="flex justify-between pt-4">
      <Button variant="outline" onClick={handleBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t("back")}
      </Button>
      <Button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {t("createButton")} Prompt
      </Button>
    </div>
  </div>
);
```

**Step 2: Add translation keys**

Edit `messages/en.json`:
```json
"edit": "Edit",
"addTag": "Add tag",
"back": "Back",
"createFailed": "Failed to create prompt. Please try again."
```

**Step 3: Commit**

```bash
git add src/components/prompts/ai-prompt-creator.tsx messages/en.json
git commit -m "feat(ui): add review step with editable fields"
```

---

## Task 5: Wire Up the New Page

**Files:**
- Modify: `src/app/prompts/new/page.tsx`

**Step 1: Update page to use AIPromptCreator**

```typescript
// src/app/prompts/new/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AIPromptCreator } from "@/components/prompts/ai-prompt-creator";
import { db } from "@/lib/db";
import { isAIGenerationEnabled } from "@/lib/ai/generation";

export const metadata: Metadata = {
  title: "Create Prompt",
  description: "Create a new prompt",
};

export default async function NewPromptPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Check if AI generation is enabled
  const aiEnabled = await isAIGenerationEnabled();

  if (!aiEnabled) {
    // Fallback to old form if AI is disabled
    redirect("/prompts/new/classic");
  }

  // Fetch categories and tags
  const [categories, tags] = await Promise.all([
    db.category.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
      },
    }),
    db.tag.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="container max-w-2xl py-8">
      <AIPromptCreator categories={categories} tags={tags} />
    </div>
  );
}
```

**Step 2: Create classic form fallback route**

Create `src/app/prompts/new/classic/page.tsx`:

```typescript
// src/app/prompts/new/classic/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Info } from "lucide-react";
import { auth } from "@/lib/auth";
import { PromptForm } from "@/components/prompts/prompt-form";
import { db } from "@/lib/db";
import { isAIGenerationEnabled, getAIModelName } from "@/lib/ai/generation";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Create Prompt (Classic)",
  description: "Create a new prompt using the classic form",
};

export default async function ClassicNewPromptPage() {
  const session = await auth();
  const t = await getTranslations("prompts");

  if (!session?.user) {
    redirect("/login");
  }

  const [categories, tags] = await Promise.all([
    db.category.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
      },
    }),
    db.tag.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  const aiGenerationEnabled = await isAIGenerationEnabled();
  const aiModelName = getAIModelName();

  return (
    <div className="container max-w-3xl py-8">
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          {t("createInfo")}
        </AlertDescription>
      </Alert>
      <PromptForm
        categories={categories}
        tags={tags}
        aiGenerationEnabled={aiGenerationEnabled}
        aiModelName={aiModelName}
      />
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/app/prompts/new/page.tsx src/app/prompts/new/classic/page.tsx
git commit -m "feat(page): wire up AIPromptCreator on /prompts/new"
```

---

## Task 6: Clean Up Old Form Fields

**Files:**
- Modify: `src/components/prompts/prompt-form.tsx`

**Step 1: Remove unused fields from PromptForm**

Remove from `prompt-form.tsx`:
1. Contributors section (lines ~882-891)
2. Input Type selector section (lines ~900-951)
3. Media upload toggle and related fields (lines ~941-990)
4. Output section (lines ~1082-1095)

Keep the form functional for `/prompts/new/classic` and edit mode, but simplify:

```typescript
// In the schema, remove media-related fields:
const createPromptSchema = (t: (key: string) => string) => z.object({
  title: z.string().min(1, t("titleRequired")).max(200),
  description: z.string().max(500).optional(),
  content: z.string().min(1, t("contentRequired")),
  type: z.enum(["TEXT", "IMAGE", "VIDEO", "AUDIO", "SKILL"]),
  structuredFormat: z.enum(["JSON", "YAML"]).optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()),
  isPrivate: z.boolean(),
});
```

This is a large refactor - the key changes are:
- Remove `MediaField` component usage
- Remove Contributors section
- Remove Input Type section (keep structured format detection via warnings)
- Remove Output section
- Simplify defaultValues

**Step 2: Commit**

```bash
git add src/components/prompts/prompt-form.tsx
git commit -m "refactor(form): simplify PromptForm by removing unused fields"
```

---

## Task 7: Test End-to-End Flow

**Files:** None (testing only)

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Test the new flow**

1. Navigate to `http://localhost:3000/prompts/new`
2. Enter a sample prompt: "Act as a senior software engineer reviewing code. Analyze the code for bugs, performance issues, and best practices."
3. Click "Analyze & Create"
4. Verify loading skeleton appears
5. Verify fields populate with AI suggestions
6. Edit the title
7. Add/remove a tag
8. Click "Create Prompt"
9. Verify redirect to prompt page

**Step 3: Test fallback**

1. Disable AI in config (if possible) or access `/prompts/new/classic`
2. Verify classic form works

**Step 4: Final commit**

```bash
git add -A
git commit -m "test: verify AI-first prompt creation flow"
```

---

## Summary of Files

| File | Action |
|------|--------|
| `src/app/api/prompts/analyze/route.ts` | Create |
| `src/components/prompts/ai-prompt-creator.tsx` | Create |
| `src/app/prompts/new/page.tsx` | Modify |
| `src/app/prompts/new/classic/page.tsx` | Create |
| `src/components/prompts/prompt-form.tsx` | Modify (simplify) |
| `messages/en.json` | Modify (add keys) |

## Dependencies

- OpenAI API key configured
- AI generation enabled in config
- Existing categories and tags in database
