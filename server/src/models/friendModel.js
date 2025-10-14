import pool from "../config/db.js";

export const sendFriendRequestService = async (userId, friendId) => {
  const result = await pool.query(
    "INSERT INTO friends (user_id, friend_id) VALUES ($1, $2) RETURNING *",
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
