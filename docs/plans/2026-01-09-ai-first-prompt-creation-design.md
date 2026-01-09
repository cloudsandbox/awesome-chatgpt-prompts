# AI-First Prompt Creation UX Design

**Date:** 2026-01-09
**Status:** Approved

## Overview

Redesign the prompt creation page (`/prompts/new`) to be AI-first. Users enter their prompt content, and AI automatically fills metadata fields (title, description, category, tags). Users can review and edit before submitting.

## Design Goals

1. **Reduce friction** - Single input to start, AI handles the rest
2. **Smart defaults** - AI suggestions that are usually correct
3. **User control** - Everything editable before submission
4. **Fast perceived performance** - Skeleton loading shows progress

## User Flow

### Step 1: Prompt Input

Large textarea as the hero element. User pastes or writes their prompt.

```
┌─────────────────────────────────────────────────────────────┐
│  📖 Learn how to write effective prompts           [Link]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Paste or write your prompt here...                         │
│                                                             │
│                                                             │
│  [Variable Toolbar - collapsed]                             │
│                                                             │
│                         [✨ Analyze & Create]               │
└─────────────────────────────────────────────────────────────┘
```

**Elements:**
- Prominent "Learn how to write prompts" link at top
- Large textarea (min 200px height)
- Variable toolbar for power users (can be collapsed)
- Single CTA button: "Analyze & Create"

### Step 2: AI Analysis (Loading State)

Show skeleton with shimmer effect. Fields populate as AI responds.

```
┌─────────────────────────────────────────────────────────────┐
│ Your Prompt                                                 │
│ "Act as a senior software engineer..."                      │
├─────────────────────────────────────────────────────────────┤
│ Title:       [░░░░░░░░░░░░░░░░░░░░░░░░]                     │
│ Description: [░░░░░░░░░░░░░░░░░░░░░░░░]                     │
│ Category:    [░░░░░░░░░░]                                   │
│ Tags:        [░░░░] [░░░░░░] [░░░░]                         │
└─────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Show prompt content at top (truncated if long)
- Skeleton placeholders for each field
- Fields fill in as AI returns data (streaming if possible)
- Smooth transition to editable state

### Step 3: Review & Edit

All fields pre-filled and directly editable. Sparkle icons indicate AI-suggested values.

```
┌─────────────────────────────────────────────────────────────┐
│ Your Prompt                                          [Edit] │
│ "Act as a senior software engineer and review my code..."   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Title:       [Senior Code Review Expert        ] ✨         │
│ Description: [Get expert code review feedback...] ✨        │
│ Category:    [Engineering ▼                    ] ✨         │
│ Tags:        [code-review] [programming] [+]     ✨         │
│                                                             │
│              ○ Public  ○ Private                            │
│                                                             │
│              [← Back]              [Create Prompt →]        │
└─────────────────────────────────────────────────────────────┘
```

**Elements:**
- Prompt content shown with "Edit" button to go back
- Title: Text input, AI-filled
- Description: Textarea, AI-filled
- Category: Dropdown selector, AI-selected
- Tags: Multi-select with existing tags, AI-suggested (2-4 tags)
- Privacy toggle: Defaults to Public
- Back button: Returns to Step 1 with content preserved
- Create button: Submits the prompt

## Fields

### Kept (AI-filled)
| Field | Type | AI Behavior |
|-------|------|-------------|
| Title | Text input | Generate concise, descriptive title |
| Description | Textarea | Write 1-2 sentence summary |
| Category | Dropdown | Select best matching category |
| Tags | Multi-select | Suggest 2-4 relevant existing tags |

### Kept (User-controlled)
| Field | Type | Default |
|-------|------|---------|
| Content | Textarea | User input (required) |
| Private | Toggle | Public (false) |
| Variable Toolbar | Toolbar | Available for power users |

### Removed
| Field | Reason |
|-------|--------|
| Contributors | Rarely used, can add in edit mode |
| Input Type (Text/Structured/Skill) | AI can auto-detect JSON/YAML |
| Structured Format (JSON/YAML) | AI can auto-detect |
| Requires Media Upload | Niche feature, low usage |
| Media Type/Count | Niche feature |
| Output Section | Doesn't provide value |

## API Design

### POST /api/prompts/analyze

Request:
```json
{
  "content": "Act as a senior software engineer..."
}
```

Response:
```json
{
  "title": "Senior Code Review Expert",
  "description": "Get expert code review feedback from an experienced software engineer perspective.",
  "categoryId": "clxxx-engineering",
  "tagIds": ["clxxx-code-review", "clxxx-programming"],
  "detectedFormat": null
}
```

## Error Handling

1. **AI analysis fails**: Show error toast, allow manual entry of all fields
2. **No matching category**: Leave category empty, user selects manually
3. **No matching tags**: Suggest empty, user adds manually
4. **Network error**: Retry button, or proceed with manual entry

## Implementation Notes

1. **Single page, multi-step**: Use React state to manage steps, not URL routing
2. **Preserve content**: Going back should preserve the prompt content
3. **Streaming**: If possible, stream AI responses to fill fields progressively
4. **Fallback**: If AI is disabled, show traditional form with all fields

## Success Metrics

- Reduced time to create prompt
- Higher completion rate (less abandonment)
- Fewer prompts with missing metadata
