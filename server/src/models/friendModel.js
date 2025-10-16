import pool from "../config/db.js";

export const sendFriendRequestService = async (userId, friendId) => {
  const result = await pool.query(
    "INSERT INTO friends (user_id, friend_id) VALUES ($1, $2) RETURNING *",
    [userId, friendId]
  );
  return result.rows[0];
};

export const acceptFriendRequestService = async (userId, friendId) => {
  const result = await pool.query(
    `
        UPDATE friends
        SET status = 'accepted'
        WHERE user_id = $1 AND friend_id = $2 AND status = 'pending'
        RETURNING *`,
    [userId, friendId]
  );
  return result.rows[0];
};

export const getAllFriendsService = async (userId) => {
  const result = await pool.query(
    `SELECT u.id, u.first_name, u.last_name, u.email, u.slug 
        FROM friends f
        JOIN users u ON
            (u.id = f.friend_id AND f.user_id = $1)
            OR
            (u.id = f.user_id AND f.friend_id = $1)
        WHERE f.status = 'accepted'`,
    [userId]
  );
  return result.rows;
};

export const deleteFriendService = async (userId, friendId) => {
  const result = await pool.query(
    `
        DELETE FROM friends
        WHERE
            (user_id = $1 AND friend_id = $2)
            OR
            (user_id = $2 AND friend_id = $1)
        RETURNING *`,
    [userId, friendId]
  );
  return result.rows[0];
};

export const declineFriendRequestService = async (userId, friendId) => {
  const result = await pool.query(
    `
        UPDATE friends
        SET status = 'declined'
        WHERE user_id = $1 AND friend_id = $2 AND status = 'pending'
        RETURNING *
        `,
    [userId, friendId]
  );
  return result.rows[0];
};

export const getFriendshipsService = async (userId) => {
  const result = await pool.query(
    `
        SELECT *
        FROM friends
        WHERE user_id = $1 OR friend_id = $1
        `,
    [userId]
  );
  return result.rows;
};

// Fetch incoming friend request where the logged-in user is the reciever.
export const getIncomingFriendRequestsService = async (userId) => {
  const result = await pool.query(
    `SELECT f.*, u.first_name, u.last_name, u.email, u.slug
     FROM friends f
     JOIN users u ON u.id = f.user_id
     WHERE f.friend_id = $1 AND f.status = 'pending'`,
    [userId]
  );
  return result.rows;
};
