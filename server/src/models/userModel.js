import { pool } from "../config/db.js";

export const getAllUsersService = async () => {
  const result = await pool.query("SELECT * FROM users");
  return result.rows;
};

export const getUserByIdService = async (id) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]); // Use $1 to safely insert the id
  return result.rows[0];
};

export const updateUserService = async (id, first_name, last_name, email) => {
  const result = await pool.query(
    "UPDATE users SET first_name = $1, last_name = $2, email = $3 WHERE id = $4 RETURNING *",
    [first_name, last_name, email, id]
  );
  return result.rows[0];
};

export const deleteUserService = async (id) => {
  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

export const getAllEventsForUserService = async (userId) => {
  // Use union to aviod duplicates if user is both host and invitee
  // Only return event IDs for simplicity
  const result = await pool.query(
    "SELECT id FROM events WHERE id IN (SELECT event_id FROM event_invites WHERE user_id = $1 UNION SELECT event_id FROM event_hosts WHERE user_id = $1)",
    [userId]
  );
  return result.rows;
};

export const getUserBySlugService = async (slug) => {
  const result = await pool.query(
    "SELECT id, first_name, last_name, email, slug, created_at FROM users WHERE slug = $1",
    [slug]
  );
  return result.rows[0];
};
