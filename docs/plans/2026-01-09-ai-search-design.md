# AI-Powered Search Design

> Semantic search for prompts using Voyage AI embeddings, pgvector, and Claude query expansion.

## Overview

Replace the current basic text search with AI-powered semantic search that understands user intent and finds relevant prompts even when exact keywords don't match.

**Key Features:**
- Semantic search using vector embeddings (Voyage AI)
- Vector storage and similarity search via pgvector (PostgreSQL)
- Optional query expansion using Claude for natural language queries
- Category-grouped results
- < 500ms response time target

## Architecture

### Search Flow

1. User types query in search bar
2. Frontend sends query to `/api/search` endpoint
3. Backend generates embedding via Voyage AI
4. pgvector performs similarity search against stored prompt embeddings
5. Results returned immediately (< 500ms target)

### Query Expansion (Async)

- Triggered when sparkle toggle is ON, or natural language is auto-detected
- Claude expands query in parallel (non-blocking)
- When expansion completes, re-query and merge/re-rank results
- Frontend updates results seamlessly

### Component Diagram

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Search Bar    │────▶│  /api/search     │────▶│    pgvector     │
│ (sparkle toggle)│     │  (orchestrator)  │     │  (similarity)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               │ async (if expansion enabled)
                               ▼
                        ┌──────────────────┐
                        │     Claude       │
                        │ (query expansion)│
                        └──────────────────┘
```

## Implementation Details

### Voyage AI Embeddings

- **Model:** `voyage-3-lite` (fast, cost-effective) or `voyage-3` (higher quality)
- **Dimension:** 1024 vectors
- **Content:** Generate embeddings for prompt title + description + content (concatenated)
- **Storage:** `embedding` column on Prompt table

### Database Changes (pgvector)

```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column
ALTER TABLE "Prompt" ADD COLUMN embedding vector(1024);

-- Create HNSW index for fast similarity search
CREATE INDEX ON "Prompt" USING hnsw (embedding vector_cosine_ops);
```

### Prisma Schema Update

```prisma
model Prompt {
  // ... existing fields
  embedding Unsupported("vector(1024)")?
}
```

### API Endpoints

#### `POST /api/search`

Main search endpoint.

**Input:**
```typescript
{
  query: string;
  expand?: boolean;  // force expansion on/off
}
```

**Output:**
```typescript
{
  results: Prompt[];
  grouped: Record<string, Prompt[]>;  // grouped by category
  expanded?: boolean;  // whether expansion was used
}
```

#### `POST /api/embeddings/generate`

Admin endpoint to backfill embeddings for existing prompts.

### Query Expansion with Claude

**Auto-Detection Rules:**
- Query contains > 5 words
- Query contains question words: what, how, why, where, when, which, find, looking, need, want

**Claude Prompt:**
```
Expand this search query into relevant keywords and synonyms for an AI prompts database.
Return only the expanded keywords, comma-separated.
Query: {query}
```

**Flow:**
1. Return initial semantic results immediately
2. If expansion enabled, call Claude in parallel
3. When Claude responds, generate new embedding from expanded query
4. Re-search and merge/re-rank results
5. Update frontend via streaming or polling

### Environment Variables

```env
# Required for AI search
VOYAGE_API_KEY=your-voyage-api-key

# Required for query expansion (may already exist)
ANTHROPIC_API_KEY=your-anthropic-api-key
```

## UI/UX Design

### Search Bar

- Single search input (same location as current)
- Sparkle icon toggle button on the right side of input
- Toggle states:
  - **OFF:** Pure semantic search
  - **ON:** Semantic search + Claude query expansion
- Subtle loading indicator during search

### Auto-Detection Indicator

- When natural language is auto-detected, show subtle indicator
- Example: Small sparkle animation or "AI-enhanced" badge

### Results Display

- **Grouped by category** with collapsible headers
- Show relevance score as subtle indicator (optional)
- Smooth transition when async expansion results arrive
- Update current search page to use same category grouping

### Error States

| Condition | Behavior |
|-----------|----------|
| No API key configured | Show error banner, fall back to basic text search |
| API rate limit | Graceful degradation to text search with message |
| No results | Helpful suggestions to broaden query |

### Loading States

- **Initial results:** Skeleton loaders (< 500ms)
- **Expansion update:** Subtle "refining results..." indicator, no jarring re-render

## Migration Plan

### Step 1: Database Migration

1. Add pgvector extension to PostgreSQL
2. Run Prisma migration to add `embedding` column
3. Create HNSW index for similarity search

### Step 2: Backfill Existing Prompts

1. Create admin script/endpoint to generate embeddings
2. Process prompts in batches (respect Voyage API rate limits)
3. Log progress and handle failures gracefully

### Step 3: Update Prompt Workflows

1. Generate embedding on prompt creation
2. Regenerate embedding on prompt edit (title/description/content changes)
3. Handle embedding generation failures gracefully (don't block save)

### Step 4: Deploy Search UI

1. Update search bar component with sparkle toggle
2. Implement category-grouped results
3. Add loading and error states

### Step 5: Documentation

1. Update README with new environment variables:
   - `VOYAGE_API_KEY` - Required for AI search
   - `ANTHROPIC_API_KEY` - Used for query expansion
2. Add note about pgvector requirement for PostgreSQL
3. Document self-hosting requirements for AI search

## Files to Create/Modify

### New Files

- `src/lib/ai/voyage.ts` - Voyage AI client and embedding generation
- `src/lib/ai/search.ts` - Search orchestration logic
- `src/app/api/search/route.ts` - New unified search endpoint
- `src/app/api/embeddings/generate/route.ts` - Admin backfill endpoint
- `prisma/migrations/xxx_add_pgvector.sql` - Database migration

### Modified Files

- `prisma/schema.prisma` - Add embedding field
- `src/components/search/search-bar.tsx` - Add sparkle toggle
- `src/components/search/search-results.tsx` - Category grouping
- `src/app/api/prompts/route.ts` - Generate embedding on create
- `src/app/api/prompts/[id]/route.ts` - Regenerate embedding on update
- `README.md` - Document new environment variables

## Performance Considerations

- **Target:** < 500ms for initial results
- **pgvector HNSW index:** Approximate nearest neighbor for speed
- **Embedding caching:** Consider caching query embeddings for repeated searches
- **Batch processing:** Generate embeddings in batches during backfill
- **Async expansion:** Never block initial results for Claude response

## Fallback Behavior

If AI search is unavailable (no API keys, errors):
1. Show clear error message to user
2. Fall back to basic text search (current implementation)
3. Log errors for monitoring

## Future Enhancements

- Search history and suggestions
- Personalized results based on user's saved prompts
- Multi-language search support
- Search analytics dashboard
