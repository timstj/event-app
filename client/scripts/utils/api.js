/**
 * API utilities and configuration
 * Handles authenticated requests and common API patterns
 */

export const API_BASE_URL = "http://localhost:5001/api";

/**
 * Authenticated fetch wrapper
 * Automatically includes JWT token and handles common errors
 * @param {string} url - The API endpoint URL
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<Response>} - Fetch response
 */
export async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  // Clone or create headers object
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle authentication errors globally
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "sign_in.html";
      throw new Error("Session expired. Please sign in again.");
    }

    return response;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

/**
 * Helper function for GET requests
 * @param {string} url - The API endpoint URL
 * @returns {Promise<any>} - Parsed JSON response
 */
export async function apiGet(url) {
  const response = await authFetch(url);
  return await response.json();
}

/**
 * Helper function for POST requests
 * @param {string} url - The API endpoint URL
 * @param {object} data - Data to send in request body
 * @returns {Promise<any>} - Parsed JSON response
 */
export async function apiPost(url, data) {
  const response = await authFetch(url, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return await response.json();
}

/**
 * Helper function for PUT requests
 * @param {string} url - The API endpoint URL
 * @param {object} data - Data to send in request body
 * @returns {Promise<any>} - Parsed JSON response
 */
export async function apiPut(url, data) {
  const response = await authFetch(url, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return await response.json();
}

/**
 * Helper function for DELETE requests
 * @param {string} url - The API endpoint URL
 * @returns {Promise<any>} - Parsed JSON response
 */
export async function apiDelete(url) {
  const response = await authFetch(url, {
    method: "DELETE",
  });
  return await response.json();
}
