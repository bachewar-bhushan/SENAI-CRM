import { pool } from "../config/db.js";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

async function seedDatabase() {
  try {
    console.log("🌱 Seeding demo data...");

    // Generate UUIDs for emails
    const email1Id = uuidv4();
    const email2Id = uuidv4();
    const email3Id = uuidv4();
    const thread1Id = uuidv4();
    const thread2Id = uuidv4();
    const thread3Id = uuidv4();

    // 1. Insert sample contacts
    await pool.query(`
      INSERT INTO contacts (name, email, company, phone)
      VALUES
        ('John Smith', 'john@acme.com', 'ACME Corp', '555-0101'),
        ('Sarah Johnson', 'sarah@techco.com', 'TechCo Inc', '555-0102'),
        ('Mike Chen', 'mike@startup.io', 'StartupXYZ', '555-0103')
      ON CONFLICT DO NOTHING;
    `);
    console.log("✅ Contacts created");

    // 2. Insert sample threads
    await pool.query(`
      INSERT INTO threads (id, subject, status, created_at)
      VALUES
        ($1, 'Product Inquiry', 'open', NOW()),
        ($2, 'Billing Question', 'open', NOW()),
        ($3, 'Technical Support', 'open', NOW())
      ON CONFLICT DO NOTHING;
    `, [thread1Id, thread2Id, thread3Id]);
    console.log("✅ Threads created");

    // 3. Insert sample emails
    await pool.query(`
      INSERT INTO emails (id, thread_id, sender, subject, body, timestamp, urgency, requires_human)
      VALUES
        ($1, $4, 'john@acme.com', 'Product Inquiry', 'Hi, I am interested in learning more about your enterprise plan. Can you provide pricing details?', NOW(), 'Medium', false),
        ($2, $5, 'sarah@techco.com', 'Billing Question', 'Why was I charged twice this month? Please review my account.', NOW(), 'High', true),
        ($3, $6, 'mike@startup.io', 'Technical Support', 'My API integration is failing. Getting 500 errors. Please help!', NOW(), 'Critical', true)
      ON CONFLICT DO NOTHING;
    `, [email1Id, email2Id, email3Id, thread1Id, thread2Id, thread3Id]);
    console.log("✅ Emails created");
    console.log("\n📧 EMAIL IDs (use these in API calls):");
    console.log(`   Email 1 (Product): ${email1Id}`);
    console.log(`   Email 2 (Billing): ${email2Id}`);
    console.log(`   Email 3 (Support): ${email3Id}`);

    // 4. Insert sample knowledge base chunks
    await pool.query(`
      INSERT INTO knowledge_chunks (source_doc, chunk_text)
      VALUES
        ('Pricing Guide', 'Enterprise Plan: $999/month includes 24/7 support, advanced analytics, unlimited users, and custom integrations.'),
        ('Billing FAQ', 'Billing charges are applied on the 1st of each month. If you were double-charged, please contact support immediately for a refund.'),
        ('API Documentation', 'API endpoints are available at api.example.com. Use your API key for authentication. Common errors: 401 (invalid key), 500 (server error, retry after 60 seconds).'),
        ('Support Policies', 'Critical issues receive response within 1 hour. High priority within 4 hours. Medium priority within 24 hours.')
      ON CONFLICT DO NOTHING;
    `);
    console.log("✅ Knowledge base populated");

    // 5. Insert sample actions/agent logs
    await pool.query(`
      INSERT INTO actions (email_id, agent_reasoning_log, action_type, executed_at)
      VALUES
        ($1, '[{"thought":"Customer wants pricing info","action":"Retrieved enterprise plan details","observation":"Relevant knowledge found"}]', 'Auto Reply', NOW()),
        ($2, '[{"thought":"Billing issue detected","action":"Escalation needed due to high urgency","observation":"Customer requires human attention"}]', 'Escalate', NOW()),
        ($3, '[{"thought":"Critical technical issue","action":"Immediate escalation required","observation":"API errors need specialist review"}]', 'Escalate', NOW())
      ON CONFLICT DO NOTHING;
    `, [email1Id, email2Id, email3Id]);
    console.log("✅ Agent actions logged");

    console.log("\n✨ Demo data seeded successfully!");
    console.log("You can now test the dry-run agent with email IDs: 1, 2, 3");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
