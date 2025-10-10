import pool from "../config/db.js";

const createUserTable = async () => {
  const query = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            slug VARCHAR(100) UNIQUE,
            created_at TIMESTAMP DEFAULT NOW()
        );
    `;
  try {
    await pool.query(query);
    console.log("Users table created or already exists.");
  } catch (error) {
    console.error("Error creating users table:", error);
  }
};

export default createUserTable;
