"use client";

import { LordIcon, ICON_THEMES } from "@/components/ui/lord-icon";

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

interface CategoryIconProps {
  slug: string;
  size?: number;
  trigger?: "hover" | "click" | "loop" | "loop-on-hover" | "morph" | "boomerang" | "in";
  className?: string;
}

export function CategoryIcon({
  slug,
  size = 24,
  trigger = "hover",
  className,
}: CategoryIconProps) {
  const iconName = getIconName(slug);
  const colors = getIconColors(slug);

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
