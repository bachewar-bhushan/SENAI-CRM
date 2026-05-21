import fs from "fs";
import path from "path";

import { pool } from "../config/db.js";

const files = [
  "001_extensions.sql",
  "002_contacts.sql",
  "003_threads.sql",
  "004_emails.sql",
  "005_actions.sql",
  "006_knowledge_chunks.sql",
  "007_web_intelligence_cache.sql",
  "008_audit_log.sql",
  "009_indexes.sql",
];

const runMigrations = async () => {

  try {

    for (const file of files) {

      console.log(
        `Running ${file}`
      );

      const sql = fs.readFileSync(
        path.resolve(
          `src/models/${file}`
        ),
        "utf-8"
      );

      await pool.query(sql);

      console.log(
        `${file} completed`
      );
    }

    console.log(
      "All migrations completed"
    );

    process.exit();

  } catch (error) {

    console.log(error);

    process.exit(1);
  }
};

runMigrations();