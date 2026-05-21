CREATE TABLE knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    source_doc VARCHAR(255),

    chunk_text TEXT,

    embedding vector(1536),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
