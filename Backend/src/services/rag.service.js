import { pool } from "../config/db.js";

/**
 * Generate embedding for query text (768 dimensions to match DB)
 * Uses same hash-based approach as seed-kb.js
 * In production, use real embedding API (OpenAI text-embedding-3-small)
 */
function generateQueryEmbedding(text) {
  const embedding = text
    .split(" ")
    .slice(0, 100)
    .map((word) => {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = (hash << 5) - hash + word.charCodeAt(i);
        hash = hash & hash;
      }
      return (hash % 1000) / 1000;
    })
    .concat(Array(768 - Math.min(100, text.split(" ").length)).fill(0))
    .slice(0, 768);

  return embedding;
}

/**
 * Search knowledge base using vector similarity (pgvector)
 * Uses cosine distance: lower distance = higher similarity
 */
export const searchKnowledgeBaseService = async (query) => {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    // Generate embedding for query
    const queryEmbedding = generateQueryEmbedding(query);
    const embeddingStr = JSON.stringify(queryEmbedding);

    // Vector similarity search using pgvector <=> operator
    // Returns top 3 chunks with lowest cosine distance (highest similarity)
    const searchQuery = `
      SELECT
        id,
        source_doc,
        chunk_text,
        (1 - (embedding <=> $1::vector)) AS similarity_score
      FROM knowledge_chunks
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> $1::vector
      LIMIT 3
    `;

    const result = await pool.query(searchQuery, [embeddingStr]);

    return result.rows.map((row) => ({
      id: row.id,
      source_doc: row.source_doc,
      chunk_text: row.chunk_text,
      similarity_score: parseFloat(row.similarity_score).toFixed(3),
    }));
  } catch (error) {
    console.error("RAG service error:", error);

    // Fallback to keyword search if vector search fails
    try {
      console.log("Falling back to keyword search...");
      const fallbackQuery = `
        SELECT
          id,
          source_doc,
          chunk_text
        FROM knowledge_chunks
        WHERE chunk_text ILIKE $1
        LIMIT 3
      `;

      const result = await pool.query(fallbackQuery, [`%${query}%`]);

      return result.rows.map((row) => ({
        id: row.id,
        source_doc: row.source_doc,
        chunk_text: row.chunk_text,
        similarity_score: 0.5, // Fallback score
      }));
    } catch (fallbackError) {
      console.error("Fallback search failed:", fallbackError);
      return [];
    }
  }
};

/**
 * Get KB chunk by ID
 */
export const getKnowledgeChunkService = async (chunkId) => {
  try {
    const query = `
      SELECT *
      FROM knowledge_chunks
      WHERE id = $1
    `;

    const result = await pool.query(query, [chunkId]);

    return result.rows[0] || null;
  } catch (error) {
    console.error("Error fetching chunk:", error);
    return null;
  }
};

/**
 * List all knowledge chunks with pagination
 */
export const listKnowledgeChunksService = async (limit = 50, offset = 0) => {
  try {
    const query = `
      SELECT
        id,
        source_doc,
        chunk_text,
        created_at
      FROM knowledge_chunks
      ORDER BY created_at DESC
      LIMIT $1
      OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);

    return result.rows;
  } catch (error) {
    console.error("Error listing chunks:", error);
    return [];
  }
};
