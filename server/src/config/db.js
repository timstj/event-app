import pg from "pg";
import dotenv from "dotenv";

const envFile = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: envFile });

const { Pool } = pg;

/**
 * Create PostgreSQL connection pool
 * Supports both connection string and individual parameters
 */
function createPool() {
  // Check if using DATABASE_URL (production)
  if (process.env.DATABASE_URL) {
    console.log('Connecting to database using DATABASE_URL');
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : false
    });
  }

  // Use individual parameters
  console.log('Connecting to database using individual parameters');
  console.log('Host:', process.env.DB_HOST);
  console.log('Database:', process.env.DB_DATABASE);
  console.log('User:', process.env.DB_USER);
  
  return new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 5432,
  });
}

export const pool = createPool();

/**
 * Test database connection
 */
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Database connected successfully');
    console.log('Server time:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
}
