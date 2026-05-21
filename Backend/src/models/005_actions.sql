CREATE TABLE actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email_id UUID REFERENCES emails(id),

    agent_reasoning_log JSONB,

    action_type VARCHAR(100),

    proposed_content TEXT,

    is_approved BOOLEAN DEFAULT FALSE,

    approved_by VARCHAR(255),

    executed_at TIMESTAMP
);