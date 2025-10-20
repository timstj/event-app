/**
 * Event service
 * Handles all event-related API operations
 */

import { API_BASE_URL, apiGet, apiPost, apiPut, apiDelete } from '../utils/api.js';

/**
 * Event service class
 * Contains all event-related API methods
 */
export class EventService {
  /**
   * Get all events
   * @returns {Promise<Array>} - Array of event objects
   */
  static async getAllEvents() {
    try {
      const result = await apiGet(`${API_BASE_URL}/event`);
      return result.data || [];
    } catch (error) {
      console.error("Error fetching events:", error);
      throw new Error("Failed to load events");
    }
  }

  /**
   * Get event by ID
   * @param {number} eventId - Event ID
   * @returns {Promise<object>} - Event object
   */
  static async getEventById(eventId) {
    try {
      const result = await apiGet(`${API_BASE_URL}/event/${eventId}`);
      return result.data;
    } catch (error) {
      console.error("Error fetching event:", error);
      throw new Error("Failed to load event");
    }
  }

  /**
   * Create new event
   * @param {object} eventData - Event data object
   * @returns {Promise<object>} - Created event object
   */
  static async createEvent(eventData) {
    try {
      const result = await apiPost(`${API_BASE_URL}/event`, eventData);
      return result.data;
    } catch (error) {
      console.error("Error creating event:", error);
      throw new Error("Failed to create event");
    }
  }

  /**
   * Update event
   * @param {number} eventId - Event ID
   * @param {object} eventData - Updated event data
   * @returns {Promise<object>} - Updated event object
   */
  static async updateEvent(eventId, eventData) {
    try {
      const result = await apiPut(`${API_BASE_URL}/event/${eventId}`, eventData);
      return result.data;
    } catch (error) {
      console.error("Error updating event:", error);
      throw new Error("Failed to update event");
    }
  }

  /**
   * Delete event
   * @param {number} eventId - Event ID
   * @returns {Promise<object>} - API response
   */
  static async deleteEvent(eventId) {
    try {
      const result = await apiDelete(`${API_BASE_URL}/event/${eventId}`);
      return result;
    } catch (error) {
      console.error("Error deleting event:", error);
      throw new Error("Failed to delete event");
    }
  }

  /**
   * Get events where current user is host (from JWT)
   * @returns {Promise<Array>} - Array of hosted events
   */
  static async getHostedEvents() {
    try {
      const result = await apiGet(`${API_BASE_URL}/event/hosted`);
      return result.data || [];
    } catch (error) {
      console.error("Error fetching hosted events:", error);
      throw new Error("Failed to load hosted events");
    }
  }

  /**
   * Invite user to event
   * @param {number} eventId - Event ID
   * @param {number} userId - User ID to invite
   * @returns {Promise<object>} - API response
   */
  static async inviteUserToEvent(eventId, userId) {
    try {
      const result = await apiPost(`${API_BASE_URL}/event/${eventId}/invite`, { userId });
      return result;
    } catch (error) {
      console.error("Error inviting user to event:", error);
      throw new Error("Failed to invite user");
    }
  }

  /**
   * Get all invites for an event
   * @param {number} eventId - Event ID
   * @returns {Promise<Array>} - Array of invite objects
   */
  static async getEventInvites(eventId) {
    try {
      const result = await apiGet(`${API_BASE_URL}/event/${eventId}/invites`);
      return result.data || [];
    } catch (error) {
      console.error("Error fetching event invites:", error);
      throw new Error("Failed to load event invites");
    }
  }

  /**
   * Remove invited user from event
   * @param {number} eventId - Event ID
   * @param {number} userId - User ID to remove
   * @returns {Promise<object>} - API response
   */
  static async removeInvitedUser(eventId, userId) {
    try {
      const result = await apiDelete(`${API_BASE_URL}/event/${eventId}/invite/${userId}/remove`);
      return result;
    } catch (error) {
      console.error("Error removing invited user:", error);
      throw new Error("Failed to remove user from event");
    }
  }

  /**
   * Set user as event host
   * @param {number} eventId - Event ID
   * @param {number} userId - User ID to set as host
   * @returns {Promise<object>} - API response
   */
  static async setEventHost(eventId, userId) {
    try {
      const result = await apiPost(`${API_BASE_URL}/event/${eventId}/host`, { userId });
      return result;
    } catch (error) {
      console.error("Error setting event host:", error);
      throw new Error("Failed to set event host");
    }
  }
}