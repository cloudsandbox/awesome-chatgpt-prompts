"use client";

import { LordIcon, ICON_THEMES } from "@/components/ui/lord-icon";

// Fallback mapping for categories without an icon field set
// Used when icon prop is not provided
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

// Get icon name from slug (fallback)
function getIconNameFromSlug(slug: string): string {
  const normalized = slug.toLowerCase().replace(/[_-]/g, "-");
  return SLUG_TO_ICON[normalized] || "default";
}

// Get colors for an icon
function getIconColors(iconName: string) {
  return ICON_THEMES[iconName as keyof typeof ICON_THEMES] || ICON_THEMES.default;
}

interface CategoryIconProps {
  slug: string;
  icon?: string | null; // The icon field from the database
  size?: number;
  trigger?: "hover" | "click" | "loop" | "loop-on-hover" | "morph" | "boomerang" | "in";
  className?: string;
}

export function CategoryIcon({
  slug,
  icon,
  size = 24,
  trigger = "hover",
  className,
}: CategoryIconProps) {
  // Use database icon if available, otherwise fall back to slug-based mapping
  const iconName = icon || getIconNameFromSlug(slug);
  const colors = getIconColors(iconName);

  return (
    <LordIcon
      icon={iconName}
      size={size}
      trigger={trigger}
      colors={colors}
      className={className}
    />
  );
}
