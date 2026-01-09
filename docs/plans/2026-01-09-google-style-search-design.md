# Google-Style Search Redesign

## Overview

Redesign the `/prompts` page to have a Google-like search experience with a prominent centered search bar, clean minimal UI, and advanced filters hidden in a dropdown panel.

## Current State

- Sidebar with search box, filters (type, category, sort, tags)
- Pinned categories as chips at top
- AI expansion toggle in sidebar
- Results in main area with infinite scroll

## New Design

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]                                    [+ Create Prompt] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│            ┌─────────────────────────────────┐              │
│            │ 🔍 Search prompts...        ✨ │  [Filters ▼]  │
│            └─────────────────────────────────┘              │
│                                                             │
│   [Sales] [Marketing] [Engineering] [Code Review] [Writing] │
│   [Trending: X] [Popular: Y]                                │
│                                                             │
│   Active: [Category: Engineering ✕] [Sort: Upvotes ✕]       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Dropdown Filter Panel (hidden by default)               ││
│  │                                                         ││
│  │ Type: [All ▼]   Category: [All ▼]   Sort: [Newest ▼]   ││
│  │                                                         ││
│  │ Tags: [Search tags...]                                  ││
│  │ [Tag1] [Tag2] [Tag3] [Tag4] ...                        ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Found 245 prompts                                         │
│                                                             │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│   │ Prompt  │  │ Prompt  │  │ Prompt  │  │ Prompt  │       │
│   │ Card    │  │ Card    │  │ Card    │  │ Card    │       │
│   └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                             │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│   │ Prompt  │  │ Prompt  │  │ Prompt  │  │ Prompt  │       │
│   │ Card    │  │ Card    │  │ Card    │  │ Card    │       │
│   └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                             │
│                    [Loading more...]                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Components

#### 1. Search Bar (Hero Style)

- Large, rounded input matching home page hero search
- Search icon on left
- Sparkle toggle on right (AI expansion) - same behavior as home page
- Placeholder: "Search prompts..."
- Debounced search (300ms)

#### 2. Filters Button

- Located next to search bar
- Shows badge with active filter count
- Toggles dropdown panel visibility

#### 3. Quick Filter Chips

Row of clickable chips below search bar:

**Pinned Categories:**
- Sales, Marketing, Engineering, Product, etc.
- From existing pinned categories in database

**Popular Tags:**
- Top 5-8 most used tags
- Query: tags with most prompt associations

**Smart/Trending Suggestions:**
- Recently popular searches
- Could be static initially, dynamic later

**Behavior:**
- Click to apply filter (chip highlights)
- Click again to remove filter
- Multiple chips can be active

#### 4. Active Filter Chips

- Shown below quick filters when any filter is active
- Each chip shows: "[Filter Type]: [Value] ✕"
- Click ✕ to remove that filter
- "Clear all" link when multiple active

#### 5. Dropdown Filter Panel

Revealed when "Filters" button clicked:

**Layout:** Horizontal grid of filter controls

| Type | Category | Sort |
|------|----------|------|
| Dropdown | Dropdown | Dropdown |

**Tags Section:**
- Search input for tags
- Scrollable list of tag chips
- Click to toggle tag filter

#### 6. Results Area

- Full-width grid (no sidebar)
- 4 columns on desktop, 2 on tablet, 1 on mobile
- Result count shown: "Found X prompts"
- Infinite scroll (existing behavior)

### Removed Elements

- Sidebar completely removed
- Footer links in sidebar → move to page footer or remove
- DeepWiki link → move to footer

### Component Files

**New:**
- `src/components/search/prompts-search-bar.tsx` - Main search bar component
- `src/components/search/filter-dropdown.tsx` - Dropdown filter panel
- `src/components/search/quick-filters.tsx` - Quick filter chips
- `src/components/search/active-filters.tsx` - Active filter display

**Modified:**
- `src/app/prompts/page.tsx` - New layout without sidebar
- Remove or deprecate: `src/components/prompts/prompt-filters.tsx`

### Data Requirements

**Popular Tags Query:**
```sql
SELECT t.*, COUNT(pt.promptId) as usage_count
FROM tags t
JOIN prompt_tags pt ON t.id = pt.tagId
GROUP BY t.id
ORDER BY usage_count DESC
LIMIT 8
```

**Trending/Smart Suggestions:**
- Initially: Static list of common searches
- Future: Track search queries and surface popular ones

### Mobile Considerations

- Search bar remains prominent
- Quick filter chips horizontally scrollable
- Filter dropdown becomes full-width
- Results in single column

### Accessibility

- All interactive elements keyboard accessible
- ARIA labels for filter toggles
- Focus management when dropdown opens/closes
- Screen reader announcements for filter changes

## Implementation Steps

1. Create new search bar component (reuse hero-search styling)
2. Create filter dropdown component
3. Create quick filters component
4. Create active filters component
5. Update prompts page layout (remove sidebar)
6. Add popular tags query
7. Wire up all filter interactions
8. Test responsive behavior
9. Remove old prompt-filters component (or keep for reference)
