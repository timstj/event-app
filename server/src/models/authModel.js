import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import { slugify } from "../utils/slugify.js";

export const getUserByEmailService = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0];
};

export const registerUserService = async (
  first_name,
  last_name,
  email,
  password
) => {
  let baseSlug = slugify(first_name, last_name);
  let uniqueSlug = baseSlug;
  let count = 1;

  // Ensure slug is unique
  while (
    (await pool.query("SELECT 1 FROM users WHERE slug = $1", [uniqueSlug]))
      .rowCount > 0
  ) {
    uniqueSlug = `${baseSlug}-${count++}`;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    "INSERT INTO users (first_name, last_name, email, password, slug) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [first_name, last_name, email, hashedPassword, uniqueSlug]
  );
  return result.rows[0];
};
