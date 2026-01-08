import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { DiscoveryPrompts } from "@/components/prompts/discovery-prompts";
import { DepartmentCard } from "@/components/categories/department-card";

// Volue brand colors
const colors = {
  darkTeal: "#082b33",
  lightBlue: "#dcedf5",
};

// Visible prompt filter
const visiblePromptFilter = {
  isPrivate: false,
  isUnlisted: false,
  deletedAt: null,
};

// Cached categories query with prompt counts
const getDepartments = unstable_cache(
  async () => {
    const categories = await db.category.findMany({
      where: { parentId: null },
      orderBy: { order: "asc" },
    });

    // Count visible prompts per category
    const counts = await db.prompt.groupBy({
      by: ["categoryId"],
      where: {
        categoryId: { in: categories.map((c) => c.id) },
        ...visiblePromptFilter,
      },
      _count: true,
    });

    const countMap = new Map(counts.map((c) => [c.categoryId, c._count]));

    return categories.map((category) => ({
      ...category,
      promptCount: countMap.get(category.id) || 0,
    }));
  },
  ["homepage-departments"],
  { tags: ["categories"] }
);

export default async function HomePage() {
  const t = await getTranslations("homepage");
  const departments = await getDepartments();

  return (
    <div className="flex flex-col">
      {/* Hero Section - Adapts to light/dark mode */}
      <section className="py-16 md:py-24 bg-[#dcedf5] dark:bg-[#082b33]">
        <div className="container">
          <div className="flex flex-col items-center text-center">
            {/* Logo - prominent display */}
            <Image
              src="/volue-logo.avif"
              alt="Volue"
              width={320}
              height={107}
              className="mb-10 dark:invert dark:brightness-200"
              priority
            />

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-[#082b33] dark:text-white">
              AI Prompt Library
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-zinc-600 dark:text-[#dcedf5]">
              Find prompts for your department
            </p>
          </div>
        </div>
      </section>

      {/* Department Grid */}
      <section className="py-12 md:py-16">
        <div className="container max-w-5xl">
          {departments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((dept) => (
                <DepartmentCard
                  key={dept.id}
                  id={dept.id}
                  slug={dept.slug}
                  name={dept.name}
                  description={dept.description}
                  icon={dept.icon}
                  promptCount={dept.promptCount}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-500">
              <p>No departments configured yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured & Latest Prompts */}
      <DiscoveryPrompts isHomepage />
    </div>
  );
}
