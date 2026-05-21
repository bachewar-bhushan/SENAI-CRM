import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_URL = 'http://localhost:8000';
const EMAIL_DATA_PATH = 'C:\\Users\\hp\\Downloads\\email-data-advanced.json';

async function seedEmails() {
  try {
    console.log('🚀 Starting Email Data Seeding\n');

    // Read email data
    if (!fs.existsSync(EMAIL_DATA_PATH)) {
      console.error(`❌ File not found: ${EMAIL_DATA_PATH}`);
      process.exit(1);
    }

    const emailData = JSON.parse(fs.readFileSync(EMAIL_DATA_PATH, 'utf-8'));
    console.log(`📧 Found ${emailData.length} emails to ingest\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Ingest each email
    for (let i = 0; i < emailData.length; i++) {
      const email = emailData[i];

      try {
        const response = await axios.post(`${BACKEND_URL}/api/ingest`, {
          thread_id: email.thread_id,
          message_id: email.message_id,
          sender: email.sender,
          subject: email.subject,
          body: email.body,
          timestamp: email.timestamp,
        });

        if (response.data.success) {
          successCount++;
          process.stdout.write(`\r✓ Ingested ${successCount}/${emailData.length} emails`);
        }
      } catch (err) {
        errorCount++;
        errors.push({
          message_id: email.message_id,
          error: err.response?.data?.message || err.message,
        });
        process.stdout.write(`\r✓ Ingested ${successCount}/${emailData.length} emails (${errorCount} errors)`);
      }

      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n\n✅ Seeding Complete!`);
    console.log(`\n📊 Results:`);
    console.log(`   ✓ Successfully ingested: ${successCount}`);
    console.log(`   ✗ Failed: ${errorCount}`);

    if (errors.length > 0) {
      console.log(`\n⚠️  Errors:`);
      errors.slice(0, 5).forEach(err => {
        console.log(`   - ${err.message_id}: ${err.error}`);
      });
      if (errors.length > 5) {
        console.log(`   ... and ${errors.length - 5} more`);
      }
    }

    console.log(`\n📈 Next steps:`);
    console.log(`   1. Check the dashboard to see ingested emails`);
    console.log(`   2. Run agent on emails: POST /agent/dry-run/:emailId`);
    console.log(`   3. Test special scenarios (ransomware, GDPR, etc)`);

    process.exit(successCount > 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

seedEmails();
