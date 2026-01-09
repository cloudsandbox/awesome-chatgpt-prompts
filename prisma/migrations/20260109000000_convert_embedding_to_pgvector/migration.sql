-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop existing JSONB embedding column
ALTER TABLE "prompts" DROP COLUMN IF EXISTS "embedding";

-- Add new vector embedding column (1024 dimensions for Voyage AI)
ALTER TABLE "prompts" ADD COLUMN "embedding" vector(1024);

-- Create HNSW index for fast similarity search
CREATE INDEX IF NOT EXISTS "prompts_embedding_hnsw_idx" ON "prompts"
USING hnsw ("embedding" vector_cosine_ops);
