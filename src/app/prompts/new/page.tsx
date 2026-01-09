import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AIPromptCreator } from "@/components/prompts/ai-prompt-creator";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Create Prompt",
  description: "Create a new prompt",
};

interface PageProps {
  searchParams: Promise<{
    prompt?: string;
    title?: string;
    content?: string;
    type?: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO";
    format?: "JSON" | "YAML";
    classic?: string;
  }>;
}

export default async function NewPromptPage({ searchParams }: PageProps) {
  const session = await auth();
  const params = await searchParams;

  if (!session?.user) {
    redirect("/login");
  }

  // Redirect to classic form if explicitly requested or if there are URL params for prefill
  if (params.classic || params.prompt || params.title || params.content || params.type || params.format) {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([k, v]) => v !== undefined && k !== "classic") as [string, string][]
    ).toString();
    redirect(`/prompts/new/classic${queryString ? `?${queryString}` : ""}`);
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
