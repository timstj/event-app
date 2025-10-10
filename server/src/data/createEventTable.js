import pool from "../config/db.js";

const createEventTables = async () => {
  const eventTableQuery = `CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        date TIMESTAMP NOT NULL,
        location VARCHAR(255)
    );`;
  const eventHostsTableQuery = `CREATE TABLE IF NOT EXISTS event_hosts (
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (event_id, user_id)
    );`;
  const eventInvitesTableQuery = `CREATE TABLE IF NOT EXISTS event_invites (
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
        PRIMARY KEY (event_id, user_id)
    );`;

  try {
    await pool.query(eventTableQuery);
    console.log("Events table created or already exists.");
  } catch (error) {
    console.error("Error creating events table:", error);
  }
  try {
    await pool.query(eventHostsTableQuery);
    console.log("Event hosts table created or already exists.");
  } catch (error) {
    console.error("Error creating event hosts table:", error);
  }
  try {
    await pool.query(eventInvitesTableQuery);
    console.log("Event invites table created or already exists.");
  } catch (error) {
    console.error("Error creating event invites table:", error);
  }
};

export default createEventTables;
