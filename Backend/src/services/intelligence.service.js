import { pool } from "../config/db.js";

export const getReputationDataService =
  async () => {

    const query = `
      SELECT *
      FROM web_intelligence_cache
      ORDER BY scraped_at DESC
      LIMIT 1
    `;

    const result =
      await pool.query(query);

    if (result.rows.length === 0) {
      return {
        message:
          "No intelligence data found",
      };
    }

    return result.rows[0];
  };