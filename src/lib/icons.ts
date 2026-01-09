// Available category icons - each maps to a unique LordIcon URL
// These are the icon names that can be used for categories
// 100+ unique icons available for automatic assignment

export const AVAILABLE_ICONS = [
  // Business & Work (10)
  "sales", "briefcase", "meeting", "presentation", "contract",
  "deal", "partnership", "office", "workspace", "career",

  // Marketing & Communication (10)
  "marketing", "email", "newsletter", "social", "broadcast",
  "campaign", "brand", "advertisement", "viral", "influence",

  // Technology & Engineering (15)
  "engineering", "code", "computer", "server", "database",
  "cloud", "api", "devops", "mobile", "terminal",
  "bug", "security", "network", "robot", "chip",

  // Product & Design (10)
  "product", "design", "ux", "prototype", "innovation",
  "creativity", "sketch", "layers", "grid", "typography",

  // Support & Customer Service (10)
  "support", "helpdesk", "ticket", "feedback", "faq",
  "knowledge", "guide", "tutorial", "rating", "satisfaction",

  // People & HR (10)
  "hr", "people", "team", "user", "hiring",
  "training", "onboarding", "benefits", "diversity", "culture",

  // Finance & Accounting (10)
  "finance", "money", "invoice", "budget", "tax",
  "audit", "investment", "banking", "wallet", "expense",

  // Legal & Compliance (8)
  "legal", "document", "compliance", "policy", "privacy",
  "terms", "regulation", "copyright",

  // Analytics & Data (10)
  "analytics", "data", "metrics", "dashboard", "report",
  "statistics", "insights", "forecast", "tracking", "benchmark",

  // Operations & Logistics (10)
  "operations", "logistics", "shipping", "inventory", "warehouse",
  "supply", "process", "workflow", "automation", "efficiency",

  // Productivity & Time (10)
  "productivity", "calendar", "clock", "schedule", "deadline",
  "task", "todo", "focus", "milestone", "goal",

  // Education & Learning (8)
  "education", "learning", "course", "certification", "workshop",
  "webinar", "library", "research",

  // Settings & Admin (6)
  "settings", "config", "admin", "permissions", "preferences", "customize",

  // General Icons (30+)
  "star", "heart", "bell", "search", "filter",
  "share", "download", "upload", "sync", "refresh",
  "link", "bookmark", "archive", "trash", "pin",
  "globe", "location", "home", "folder", "file",
  "image", "video", "audio", "camera", "microphone",
  "play", "success", "warning", "plus", "menu",
  "lock", "unlock", "eye", "edit", "copy",
] as const;

export type IconName = (typeof AVAILABLE_ICONS)[number];

// Subset of icons shown in the admin UI dropdown (most common/useful)
// Full library is used for auto-assignment
export const ADMIN_UI_ICONS: IconName[] = [
  // Most commonly used for categories
  "sales", "marketing", "engineering", "product", "support",
  "hr", "finance", "legal", "analytics", "operations",
  "productivity", "education", "design", "data", "settings",
  // Additional useful ones
  "briefcase", "code", "team", "money", "document",
  "calendar", "star", "globe", "innovation", "workflow",
];

// Icon display names for the admin UI
export const ICON_DISPLAY_NAMES: Partial<Record<IconName, string>> = {
  sales: "Sales (Handshake)",
  marketing: "Marketing (Megaphone)",
  engineering: "Engineering (Code)",
  product: "Product (Rocket)",
  support: "Support (Chat)",
  hr: "HR (Heart)",
  finance: "Finance (Money)",
  legal: "Legal (Scales)",
  analytics: "Analytics (Chart)",
  operations: "Operations (Checklist)",
  productivity: "Productivity (Boost)",
  education: "Education (Graduation)",
  design: "Design (Palette)",
  data: "Data (Database)",
  settings: "Settings (Gear)",
  briefcase: "Business (Briefcase)",
  code: "Code (Terminal)",
  team: "Team (Group)",
  money: "Money (Coin)",
  document: "Document (File)",
  calendar: "Calendar",
  star: "Star",
  globe: "Globe (World)",
  innovation: "Innovation (Lightbulb)",
  workflow: "Workflow (Process)",
};

/**
 * Get the next available icon that isn't already used by existing categories
 * @param usedIcons - Array of icon names already in use
 * @returns The first available icon from the full library
 */
export function getNextAvailableIcon(usedIcons: (string | null)[]): string {
  const usedSet = new Set(usedIcons.filter(Boolean));

  for (const icon of AVAILABLE_ICONS) {
    if (!usedSet.has(icon)) {
      return icon;
    }
  }

  // If all 100+ icons are used (extremely unlikely), generate a unique fallback
  // by appending a number to a base icon
  const baseIcon = AVAILABLE_ICONS[0];
  let counter = 1;
  while (usedSet.has(`${baseIcon}-${counter}`)) {
    counter++;
  }
  return `${baseIcon}-${counter}`;
}

/**
 * Check if an icon is already used by another category
 * @param icon - The icon to check
 * @param usedIcons - Array of icons already in use
 * @param excludeIcon - Optional icon to exclude from check (for edit operations)
 * @returns true if the icon is already used
 */
export function isIconUsed(icon: string, usedIcons: (string | null)[], excludeIcon?: string | null): boolean {
  const usedSet = new Set(usedIcons.filter(Boolean));
  if (excludeIcon) {
    usedSet.delete(excludeIcon);
  }
  return usedSet.has(icon);
}

/**
 * Check if an icon name is valid (exists in the library)
 */
export function isValidIcon(icon: string): boolean {
  return AVAILABLE_ICONS.includes(icon as IconName) || icon === "default";
}

/**
 * Get all available icons that are not currently in use
 * @param usedIcons - Array of icons already in use
 * @returns Array of available icon names
 */
export function getAvailableIcons(usedIcons: (string | null)[]): string[] {
  const usedSet = new Set(usedIcons.filter(Boolean));
  return AVAILABLE_ICONS.filter(icon => !usedSet.has(icon));
}
