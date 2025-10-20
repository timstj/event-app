/**
 * Friend service
 * Handles all friend-related API operations
 */

import {
  API_BASE_URL,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
} from "../utils/api.js";

const FRIEND_API_URL = `${API_BASE_URL}/friends`

/**
 * Friend service class
 * Contains all friend-related API methods
 */
export class FriendService {
  /**
   * Get all friendships for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} - Array of friendship objects
   */
  static async getFriendships(userId) {
    try {
      const result = await apiGet(
        `${API_BASE_URL}/friends/friendships/${userId}`
      );
      return result.data || [];
    } catch (error) {
      console.error("Error fetching friendships", error);
      throw new Error("Failed to load friendships");
    }
  }

  /**
   * Get incoming friend requests for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} - Array of incoming friend requests
   */
  static async getIncomingRequests(userId) {
    try {
      const result = await apiGet(
        `${API_BASE_URL}/friends/requests/incoming/${userId}`
      );
      // || [] to avoid crashes and stops for example forEach to cause a crash
      // with undefined or null if api returns unexpected data
      return result.data || [];
    } catch (error) {
      console.error("Error fetching incoming requests", error);
      throw new Error("Failed to load friend requests");
    }
  }

  /**
   * Send a friend request
   * @param {number} userId - Sender's user ID
   * @param {number} friendId - Receiver's user ID
   * @returns {Promise<object>} - API response
   */
  static async sendFriendRequest(fromUserId, toUserId) {
    try {
      const result = await apiPost(`${API_BASE_URL}/friends/friend-request`, {
        userId: fromUserId,
        friendId: toUserId,
        status: "pending",
      });
      return result.data;
    } catch (error) {
      console.error("Error in FriendService.sendFriendRequest:", error);

      // re-throw the error to catch
      throw error;
    }
  }
  /**
   * Accept a friend request
   * @param {number} senderId - ID of user who sent the request
   * @param {number} receiverId - ID of user accepting the request
   * @returns {Promise<object>} - API response
   */
  static async acceptFriendRequest(senderId, receiverId) {
    try {
      const result = await apiPut(`${API_BASE_URL}/friends/accept`, {
        userId: senderId,
        friendId: receiverId,
      });
      return result;
    } catch (error) {
      console.error("Error accepting friend request:", error);
      throw new Error("Failed to accept friend request");
    }
  }

  /**
   * Decline a friend request
   * @param {number} senderId - ID of user who sent the request
   * @param {number} receiverId - ID of user declining the request
   * @returns {Promise<object>} - API response
   */
  static async declineFriendRequest(senderId, receiverId) {
    try {
      const result = await apiPut(`${API_BASE_URL}/friends/decline`, {
        userId: senderId,
        friendId: receiverId,
      });
      return result;
    } catch (error) {
      console.error("Error declining friend request:", error);
      throw new Error("Failed to decline friend request");
    }
  }

  /**
   * Remove/delete a friendship
   * @param {number} userId - First user's ID
   * @param {number} friendId - Second user's ID
   * @returns {Promise<object>} - API response
   */
  static async removeFriend(userId, friendId) {
    try {
      const result = await apiDelete(`${API_BASE_URL}/friends/remove`, {
        userId,
        friendId,
      });
      return result;
    } catch (error) {
      console.error("Error removing friend:", error);
      throw new Error("Failed to remove friend");
    }
  }

  /**
   * Get all accepted friends for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} - Array of friend user objects
   */
  static async getFriends(userId) {
    try {
      const result = await apiGet(`${API_BASE_URL}/friends/${userId}`);
      return result.data || [];
    } catch (error) {
      console.error("Error fetching friends:", error);
      throw new Error("Failed to load friends");
    }
  }
}
