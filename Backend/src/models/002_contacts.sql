CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email VARCHAR(255) UNIQUE NOT NULL,

    name VARCHAR(255),

    company VARCHAR(255),

    status VARCHAR(50) DEFAULT 'Active',

    account_value NUMERIC(12,2) DEFAULT 0,

    churn_risk_score FLOAT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    last_contact_at TIMESTAMP
);