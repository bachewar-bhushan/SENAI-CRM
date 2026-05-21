import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../config/db.js";
import groq from "../config/groq.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KB_DIR = path.resolve(__dirname, "../../knowledge-base");
const CHUNK_SIZE = 400; // tokens
const CHUNK_OVERLAP = 50; // tokens

/**
 * Split text into chunks with overlap
 * Simple approximation: 1 token ≈ 4 characters
 */
function chunkText(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const charSize = chunkSize * 4;
  const overlapChar = overlap * 4;
  const chunks = [];

  let i = 0;
  while (i < text.length) {
    const end = Math.min(i + charSize, text.length);
    chunks.push(text.substring(i, end));
    i += charSize - overlapChar;
  }

  return chunks;
}

/**
 * Generate embedding vector using hash-based approach
 * Uses 768 dimensions to match pgvector configuration
 * For production, use OpenAI text-embedding-3-small or similar
 */
async function generateEmbedding(text) {
  try {
    // Hash-based embedding with 768 dimensions
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
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

/**
 * Clear existing knowledge chunks
 */
async function clearExistingChunks() {
  console.log("Clearing existing knowledge chunks...");
  await pool.query("DELETE FROM knowledge_chunks");
  console.log("✓ Cleared");
}

/**
 * Seed KB files into database
 */
async function seedKnowledgeBase() {
  try {
    console.log("🚀 Starting Knowledge Base Seeding\n");

    // Get all .md files
    const files = fs
      .readdirSync(KB_DIR)
      .filter((f) => f.endsWith(".md"))
      .sort();

    console.log(`Found ${files.length} KB files:\n`);

    // Clear existing
    await clearExistingChunks();

    let totalChunks = 0;

    // Process each file
    for (const file of files) {
      const filePath = path.join(KB_DIR, file);
      const docName = file.replace(".md", "");
      const content = fs.readFileSync(filePath, "utf-8");

      console.log(`Processing ${file}...`);

      // Split into chunks
      const chunks = chunkText(content);
      console.log(`  → Created ${chunks.length} chunks`);

      // Insert each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i];

        // Generate embedding
        const embedding = await generateEmbedding(chunkText);

        // Insert into DB
        const query = `
          INSERT INTO knowledge_chunks (
            source_doc,
            chunk_text,
            embedding
          )
          VALUES ($1, $2, $3)
          RETURNING id
        `;

        try {
          const result = await pool.query(query, [
            docName,
            chunkText,
            JSON.stringify(embedding),
          ]);

          if ((i + 1) % 10 === 0) {
            process.stdout.write(
              `\r  → Inserted ${i + 1}/${chunks.length} chunks`
            );
          }
        } catch (err) {
          console.error(
            `\n  ✗ Error inserting chunk ${i + 1}:`,
            err.message
          );
        }
      }

      console.log(
        `\n  ✓ ${docName}: ${chunks.length} chunks inserted\n`
      );
      totalChunks += chunks.length;
    }

    console.log(`\n✅ Seeding Complete!`);
    console.log(`Total chunks inserted: ${totalChunks}`);
    console.log(`\nNext steps:`);
    console.log(
      `1. Verify chunks: SELECT COUNT(*) FROM knowledge_chunks;`
    );
    console.log(
      `2. Test RAG: GET /rag/search?q=refund`
    );

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedKnowledgeBase();
