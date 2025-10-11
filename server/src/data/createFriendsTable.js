import pool from "../config/db.js";

// Create ENUM fro status
const createFriendStatusEnum = `
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'friend_status') THEN
        CREATE TYPE friend_status AS ENUM ('pending', 'accepted', 'declined');
    END IF;
END$$;
`;

const createFriendsTable = async () => {
  const query = `
        CREATE TABLE IF NOT EXISTS friends (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            friend_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            status friend_status DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            UNIQUE (user_id, friend_id)
        );`;
  try {
    await pool.query(createFriendStatusEnum);
    await pool.query(query);
    console.log("Friends table created or already exists.");
  } catch (error) {
    console.error("Error creating friends table: ", error);
  }
};

export default createFriendsTable;
