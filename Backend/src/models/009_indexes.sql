CREATE INDEX idx_threads_sender_email
ON threads(sender_email);

CREATE INDEX idx_emails_thread_id
ON emails(thread_id);

CREATE INDEX idx_emails_message_id
ON emails(message_id);

CREATE INDEX idx_emails_timestamp
ON emails(timestamp);

CREATE INDEX idx_contacts_email
ON contacts(email);