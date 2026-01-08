# Volue Homepage Redesign

## Overview

Redesign the prompts.chat homepage for use as an internal Volue employee prompt library. The goal is a simple, clean homepage that helps employees quickly navigate to prompts relevant to their department.

## Context

- **Purpose:** Internal tool for Volue employees
- **Primary action:** Browse prompts by department
- **Branding:** Volue color scheme with placeholder logo

## Design

### Structure

```
┌─────────────────────────────────────────────────────┐
│  Header (existing nav)                              │
├─────────────────────────────────────────────────────┤
│         [Logo Placeholder]                          │
│         AI Prompt Library                           │  ← Hero (dark teal bg)
│     Find prompts for your department                │
├─────────────────────────────────────────────────────┤
│                                                     │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│   │  Sales  │  │Marketing│  │  Dev    │            │
│   │   📊    │  │   📢    │  │   💻    │            │  ← Department Grid
│   │ 24 prompts│ │18 prompts│ │42 prompts│           │     (dynamic from DB)
│   └─────────┘  └─────────┘  └─────────┘            │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│   Featured Prompts                                  │
│   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                  │  ← DiscoveryPrompts
│   └─────┘ └─────┘ └─────┘ └─────┘                  │     (existing component)
│                                                     │
│   Latest Prompts                                    │
│   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                  │
│   └─────┘ └─────┘ └─────┘ └─────┘                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Color Palette (Volue)

| Element | Color | Hex |
|---------|-------|-----|
| Hero background | Dark teal | `#082b33` |
| Cards | White | `#ffffff` |
| Accent/hover | Light blue | `#dcedf5` |
| Text on dark | White | `#ffffff` |
| Text on light | Dark gray | `#1a1a1a` |
| Muted text | Gray | `#6b7280` |

### Hero Section

- Dark teal background (`#082b33`), ~200px height
- Centered layout
- Logo placeholder: white, ~120px wide (path: `/volue-logo.svg`)
- Title: "AI Prompt Library" - white, bold, 32px
- Subtitle: "Find prompts for your department" - light blue (#dcedf5), 18px

### Department Cards

- **Source:** Dynamic from database (all top-level categories)
- **Query:** `db.category.findMany({ where: { parentId: null } })`
- **Card styling:**
  - White background
  - Border radius: 12px
  - Subtle box shadow
  - Hover: light blue border/tint
- **Card content:**
  - Category emoji/icon (from DB)
  - Department name (bold, centered)
  - Prompt count (muted text)
- **Link:** Each card links to `/categories/{slug}`
- **Grid:** 3 columns desktop, 2 tablet, 1 mobile
- **Gap:** 24px
- **Container max-width:** ~1000px

### Discovery Section

- Keep existing `<DiscoveryPrompts isHomepage />` component
- Shows featured and latest prompts

## What Gets Removed

- GitHub stars display and fetching
- Sponsors section
- Achievements section (Forbes, Harvard, etc.)
- Testimonials (OpenAI quotes)
- Video background
- `HeroCategories` animated input
- `AnimatedText` component usage
- Clone branding conditionals (`useCloneBranding`)
- CTA section at bottom

## Files to Modify

| File | Change |
|------|--------|
| `src/app/page.tsx` | Replace with simplified homepage (~100 lines) |
| `public/volue-logo.svg` | Add placeholder logo file |

## Implementation Notes

- Page remains a Server Component (fetches categories server-side)
- Reuse prompt counting logic from categories page
- No new components needed - simple enough to be self-contained
