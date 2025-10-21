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
  const query = `
    SELECT 
      e.*,
      u.id as host_id,
      u.first_name as host_first_name,
      u.last_name as host_last_name,
      u.email as host_email
    FROM events e
    LEFT JOIN event_hosts eh ON e.id = eh.event_id
    LEFT JOIN users u ON eh.user_id = u.id
    ORDER BY e.date ASC
  `;

  const result = await pool.query(query);
  return result.rows;
};

// Update getEventByIdService to include host info
export const getEventByIdService = async (id) => {
  const query = `
    SELECT 
      e.*,
      u.id as host_id,
      u.first_name as host_first_name,
      u.last_name as host_last_name,
      u.email as host_email,
      u.slug as host_slug
    FROM events e
    LEFT JOIN event_hosts eh ON e.id = eh.event_id
    LEFT JOIN users u ON eh.user_id = u.id
    WHERE e.id = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [id]);
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

// Update getAllEventsByHostService to include host info
export const getAllEventsByHostService = async (userId) => {
  const query = `
    SELECT 
      e.*,
      u.id as host_id,
      u.first_name as host_first_name,
      u.last_name as host_last_name,
      u.email as host_email,
      u.slug as host_slug
    FROM events e
    JOIN event_hosts eh ON e.id = eh.event_id
    JOIN users u ON eh.user_id = u.id
    WHERE eh.user_id = $1
    ORDER BY e.date ASC
  `;
  
  const result = await pool.query(query, [userId]);
  return result.rows;
};

export const updateInvitationStatusService = async (
  eventId,
  userId,
  status
) => {
  // validation
  const validStatuses = ["pending", "accepted", "maybe", "declined"];
  if (!validStatuses.includes(status)) {
    throw new Error(
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  // Check if invitation exists
  const inviteCheck = await pool.query(
    "SELECT * FROM event_invites WHERE event_id = $1 AND user_id = $2",
    [eventId, userId]
  );

  if (inviteCheck.rows.length === 0) {
    throw new Error("Invitation not found");
  }

  // Don't update to same status
  const currentInvite = inviteCheck.rows[0];
  if (currentInvite.status === status) {
    throw new Error(`Invitation is already ${status}`);
  }

  // Update the invitation status
  const result = await pool.query(
    "UPDATE event_invites SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE event_id = $2 AND user_id = $3 RETURNING *",
    [status, eventId, userId]
  );

  return result.rows[0];
};

export const getInvitationStatusService = async (eventId, userId) => {
  const result = await pool.query(
    "SELECT * FROM event_invites WHERE event_id = $1 AND user_id = $2",
    [eventId, userId]
  );

  return result.rows[0] || null;
};

/**
 * Get attendees by status with user details
 * @param {number} eventId - Event ID
 * @param {string} status - Optional status filter
 * @returns {Promise<Array>} - Array of attendees with user info
 */
export const getEventAttendeesService = async (eventId, status = null) => {
  let query = `
    SELECT 
      u.id, u.first_name, u.last_name, u.email, u.slug,
      ei.status, ei.created_at as invited_at, ei.updated_at as responded_at
    FROM users u
    JOIN event_invites ei ON u.id = ei.user_id
    WHERE ei.event_id = $1
  `;

  const params = [eventId];

  if (status) {
    query += " AND ei.status = $2";
    params.push(status);
  }

  query += " ORDER BY ei.updated_at DESC";

  const result = await pool.query(query, params);
  return result.rows;
};
