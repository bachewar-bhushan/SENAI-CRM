import { pool } from "../config/db.js";

export const getContactProfileService =
  async (email) => {

    const query = `
      SELECT *
      FROM contacts
      WHERE email = $1
    `;

    const result = await pool.query(
      query,
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error(
        "Contact not found"
      );
    }

    return result.rows[0];
  };

export const updateContactStatusService =
  async (email, updateData) => {

    const { status } = updateData;

    const query = `
      UPDATE contacts
      SET status = $1
      WHERE email = $2
      RETURNING *
    `;

    const result = await pool.query(
      query,
      [status, email]
    );

    if (result.rows.length === 0) {
      throw new Error(
        "Contact not found"
      );
    }

    return result.rows[0];
  };