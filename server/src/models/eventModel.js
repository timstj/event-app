import pool from "../config/db.js";

export const createEventService = async (
  title,
  description,
  date,
  location,
  userId
) => {
  const result = await pool.query(
    "INSERT INTO events (title, description, date, location) VALUES ($1, $2, $3, $4) RETURNING *",
    [title, description, date, location]
  );
  const event = result.rows[0];

  // Insert creator as host
  await pool.query(
    "INSERT INTO event_hosts (event_id, user_id) VALUES ($1, $2)",
    [event.id, userId]
  );

  return event;
};

export const updateEventService = async (
  id,
  title,
  description,
  date,
  location
) => {
  const result = await pool.query(
    "UPDATE events SET title = $1, description = $2, date = $3, location = $4 WHERE id = $5 RETURNING *",
    [title, description, date, location, id]
  );
  return result.rows[0];
};

export const inviteUserToEventService = async (eventId, userId) => {
  const eventCheck = await pool.query("SELECT * FROM events WHERE id = $1", [
    eventId,
  ]);
  if (eventCheck.rows.length === 0) {
    throw new Error("Event not found");
  }
  const userCheck = await pool.query("SELECT * FROM users WHERE id = $1", [
    userId,
  ]);
  if (userCheck.rows.length === 0) {
    throw new Error("User not found");
  }

  const result = await pool.query(
    "INSERT INTO event_invites (event_id, user_id) VALUES ($1, $2) RETURNING *",
    [eventId, userId]
  );
  return result.rows[0];
};

export const getAllInvitesForEventService = async (eventId) => {
  const result = await pool.query(
    "SELECT * FROM event_invites WHERE event_id = $1",
    [eventId]
  );
  return result.rows;
};

export const setEventHostService = async (eventId, userId) => {
  const eventCheck = await pool.query("SELECT * FROM events WHERE id = $1", [
    eventId,
  ]);
  if (eventCheck.rows.length === 0) {
    throw new Error("Event not found");
  }
  const userCheck = await pool.query("SELECT * FROM users WHERE id = $1", [
    userId,
  ]);
  if (userCheck.rows.length === 0) {
    throw new Error("User not found");
  }

  const result = await pool.query(
    "INSERT INTO event_hosts (event_id, user_id) VALUES ($1, $2) RETURNING *",
    [eventId, userId]
  );
  return result.rows[0];
};

export const getAllEventsService = async () => {
  const result = await pool.query("SELECT * FROM events");
  return result.rows;
};

export const getEventByIdService = async (id) => {
  const result = await pool.query("SELECT * FROM events WHERE id = $1", [id]);
  return result.rows[0];
};

export const deleteEventService = async (id) => {
  const result = await pool.query(
    "DELETE FROM events WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

export const removeInvitedUserService = async (eventId, userId) => {
  const result = await pool.query(
    "DELETE FROM event_invites WHERE event_id = $1 AND user_id = $2 RETURNING *",
    [eventId, userId]
  );
  return result.rows[0];
};

export const getAllEventsByHostService = async (userId) => {
  const result = await pool.query(
    `SELECT e.*
    FROM events e
    JOIN event_hosts h ON e.id = h.event_id
    WHERE h.user_id = $1`,
    [userId]
  );
  return result.rows;
};
