CREATE TABLE web_intelligence_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    source_url TEXT,

    target_entity VARCHAR(255),

    scraped_data JSONB,

    scraped_at TIMESTAMP,

    expires_at TIMESTAMP
);