"use client";

import Link from "next/link";
import { LordIcon, ICON_THEMES } from "@/components/ui/lord-icon";

interface DepartmentCardProps {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  promptCount: number;
}

// Map category slugs to lordicon icon names
const SLUG_TO_ICON: Record<string, string> = {
  "sales": "sales",
  "marketing": "marketing",
  "engineering": "engineering",
  "product-management": "product",
  "customer-support": "support",
  "human-resources": "hr",
  "finance": "finance",
  "legal": "legal",
  "analytics": "analytics",
  "data": "data",
  "design": "design",
  "creative": "creative",
  "operations": "operations",
  "it": "engineering",
  "technology": "engineering",
  "development": "code",
  "research": "analytics",
};

// Get icon name from slug
function getIconName(slug: string): string {
  const normalized = slug.toLowerCase().replace(/[_-]/g, "-");
  return SLUG_TO_ICON[normalized] || "default";
}

// Get colors for a category
function getIconColors(slug: string) {
  const iconName = getIconName(slug);
  return ICON_THEMES[iconName as keyof typeof ICON_THEMES] || ICON_THEMES.default;
}

export function DepartmentCard({
  id,
  slug,
  name,
  description,
  icon,
  promptCount,
}: DepartmentCardProps) {
  const iconName = getIconName(slug);
  const colors = getIconColors(slug);

  return (
    <Link
      href={`/categories/${slug}`}
      className="group block p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-[#dcedf5] dark:hover:border-[#dcedf5] hover:shadow-md transition-all"
    >
      {/* Animated Icon */}
      <div className="mb-3">
        <LordIcon
          icon={iconName}
          size={48}
          trigger="hover"
          colors={colors}
        />
      </div>

      {/* Name */}
      <h2 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 group-hover:text-[#082b33] dark:group-hover:text-[#dcedf5] transition-colors">
        {name}
      </h2>

      {/* Description */}
      {description && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
          {description}
        </p>
      )}

      {/* Prompt count */}
      <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-3">
        {promptCount} {promptCount === 1 ? "prompt" : "prompts"}
      </p>
    </Link>
  );
}
