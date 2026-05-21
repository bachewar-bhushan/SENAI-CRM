CREATE TABLE threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    thread_id VARCHAR(255) UNIQUE NOT NULL,

    subject TEXT,

    sender_email VARCHAR(255),

    first_seen_at TIMESTAMP,

    last_updated_at TIMESTAMP,

    status VARCHAR(50) DEFAULT 'Open',

    assigned_to VARCHAR(255)
);