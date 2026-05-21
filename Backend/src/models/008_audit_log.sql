CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    entity_type VARCHAR(100),

    entity_id UUID,

    action VARCHAR(255),

    performed_by VARCHAR(255),

    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    diff JSONB
);  