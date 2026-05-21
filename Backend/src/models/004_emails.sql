CREATE TABLE emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    thread_id UUID REFERENCES threads(id),

    message_id VARCHAR(255) UNIQUE NOT NULL,

    sender VARCHAR(255),

    subject TEXT,

    body TEXT,

    timestamp TIMESTAMP,

    sentiment_score FLOAT,

    category VARCHAR(100),

    urgency VARCHAR(50),

    requires_human BOOLEAN DEFAULT FALSE,

    confidence FLOAT,

    raw_entities JSONB,

    status VARCHAR(50) DEFAULT 'Received'
);