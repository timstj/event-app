/**
 * User service
 * Handles all user-related API operations
 */

import {
  API_BASE_URL,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
} from "../utils/api.js";

/**
 * User service class
 * Contains all user-related API methods
 */
export class UserService {
  /**
   * Get all users
   * @returns {Promise<Array>} - Array of user objects
   */
  static async getAllUsers() {
    try {
      const result = await apiGet(`${API_BASE_URL}/user`);
      return result.data || [];
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to load users");
    }
  }

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Promise<object>} - User object
   */
  static async getUserById(userId) {
    try {
      const result = await apiGet(`${API_BASE_URL}/user/${userId}`);
      return result.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw new Error("Failed to load user");
    }
  }

  /**
   * Get user by slug
   * @param {string} slug - User slug
   * @returns {Promise<object>} - User object
   */
  static async getUserBySlug(slug) {
    try {
      const result = await apiGet(`${API_BASE_URL}/user/slug/${slug}`);
      return result.data;
    } catch (error) {
      console.error("Error fetching user by slug:", error);
      throw new Error("User not found");
    }
  }

  /**
   * Update user profile
   * @param {number} userId - User ID
   * @param {object} userData - Updated user data
   * @returns {Promise<object>} - Updated user object
   */
  static async updateUser(userId, userData) {
    try {
      const result = await apiPut(`${API_BASE_URL}/user/${userId}`, userData);
      return result.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error("Failed to update user");
    }
  }

  /**
   * Delete user (admin function for now)
   * @param {number} userId - User ID
   * @returns {Promise<object>} - API response
   */
  static async deleteUser(userId) {
    try {
      const result = await apiDelete(`${API_BASE_URL}/user/${userId}`);
      return result;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error("Failed to delete user");
    }
  }

  /**
   * Search users by name or email
   * @param {string} query - Search query
   * @returns {Promise<Array>} - Array of matching users
   */
  static async searchUsers(query) {
    try {
      const result = await apiGet(
        `${API_BASE_URL}/user/search?q=${encodeURIComponent(query)}`
      );
      return result.data || [];
    } catch (error) {
      console.error("Error searching users:", error);
      throw new Error("Failed to search users");
    }
  }
}
