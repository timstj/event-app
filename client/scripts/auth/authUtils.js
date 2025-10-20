/**
 * Authentication utilities
 * Handles user session management and authentication state
 */

/**
 * Check if user is authenticated and redirect if not
 * @param {string} redirectUrl - URL to redirect to if not authenticated
 * @returns {boolean} - True if authenticated
 */
export function requireAuth(redirectUrl = "sign_in.html") {
  const token = localStorage.getItem("token");
  const user = getLoggedInUser();
  if (!token || !user) {
    clearSession();
    window.location.href = redirectUrl;
    return false;
  }
  return true;
}

/**
 * Get the currently logged-in user data
 * @returns {object|null} - User object or null if not logged in
 */
export function getLoggedInUser() {
  const userData = localStorage.getItem("user");
  try {
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
}

/**
 * Get the logged-in user's ID
 * @returns {number|null} - User ID or null if not logged in
 */
export function getLoggedInUserId() {
  const user = getLoggedInUser();
  return user ? user.userId : null;
}

/**
 * Clear user session and redirect to login
 * @param {string} redirectUrl - URL to redirect to after logout
 */
export function logout(redirectUrl = "sign_in.html") {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = redirectUrl;
}

/**
 * Check if user is logged in without redirecting
 * @returns {boolean} - True if user has valid session
 */
export function isAuthenticated() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  return !!(token && user);
}

/**
 * Save user session data
 * @param {string} token - JWT token
 * @param {object} user - User object
 */
export function saveSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

/**
 * Clear user session data
 */
export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
