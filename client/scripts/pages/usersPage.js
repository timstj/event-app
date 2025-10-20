/**
 * Users page controller
 * Handles all functionality for the users listing page
 */

import { UserService } from "../services/userService.js";
import { FriendService } from "../services/friendService.js";
import { getLoggedInUser, requireAuth } from "../auth/authUtils.js";
import {
  renderUserCards,
  filterAndRenderUsers,
} from "../components/userCard.js";
import { renderFriendRequests } from "../components/friendRequestCard.js";
import { showError } from "../components/toast.js";

// Page state
let allUsers = [];
let allFriendships = [];
let loggedInUserId = null;

/**
 * Initialize users page
 */
export async function initUsersPage() {
  // Only run on users.html
  if (!window.location.pathname.endsWith("users.html")) {
    return;
  }

  // Ensure user is authenticated
  if (!requireAuth()) {
    return;
  }

  try {
    // Get current user
    const currentUser = getLoggedInUser();
    if (!currentUser) {
      showError("Authentication error. Please sign in again.");
      return;
    }

    loggedInUserId = currentUser.userId;

    // Load page data
    await Promise.all([loadUsersData(), loadIncomingRequests()]);

    // Setup page interactions
    setupSearch();
    setupEventListeners();
  } catch (error) {
    console.error("Error initializing users page:", error);
    showError("Failed to load page. Please refresh.");
  }
}

/**
 * Load users and friendships data
 * @private
 */
async function loadUsersData() {
  try {
    // Load data in parallel
    const [users, friendships] = await Promise.all([
      UserService.getAllUsers(),
      FriendService.getFriendships(loggedInUserId),
    ]);

    allUsers = users;
    allFriendships = friendships;

    // Render user cards
    const userListContainer = document.getElementById("user-list");
    renderUserCards(
      allUsers,
      allFriendships,
      loggedInUserId,
      userListContainer
    );
  } catch (error) {
    console.error("Error loading users data:", error);
    showError("Failed to load users. Please refresh the page.");
  }
}

/**
 * Load and display incoming friend requests
 * @private
 */
async function loadIncomingRequests() {
  try {
    const requests = await FriendService.getIncomingRequests(loggedInUserId);

    const requestsContainer = document.querySelector(
      ".incoming-requests-section"
    );
    renderFriendRequests(requests, requestsContainer);
  } catch (error) {
    console.error("Error loading incoming requests:", error);
    // Don't show error for friend requests - it's not critical
  }
}

/**
 * Setup search functionality
 * @private
 */
function setupSearch() {
  const searchInput = document.getElementById("search-users-bar");

  if (!searchInput) {
    console.warn("Search input not found on users page");
    return;
  }

  // Debounce search to avoid excessive filtering
  let searchTimeout;

  searchInput.addEventListener("input", (event) => {
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
      const searchTerm = event.target.value;
      const userListContainer = document.getElementById("user-list");

      filterAndRenderUsers(
        allUsers,
        allFriendships,
        loggedInUserId,
        userListContainer,
        searchTerm
      );
    }, 300); // 300ms debounce
  });
}

/**
 * Setup event listeners for page interactions
 * @private
 */
function setupEventListeners() {
  // Listen for friend request sent event
  document.addEventListener("friendRequestSent", handleFriendRequestSent);

  // Listen for friend request handled event
  document.addEventListener("friendRequestHandled", handleFriendRequestHandled);
}

/**
 * Handle friend request sent event
 * @private
 */
async function handleFriendRequestSent() {
  try {
    // Refresh friendships data
    allFriendships = await FriendService.getFriendships(loggedInUserId);

    // Re-render user cards with updated friendship status
    const userListContainer = document.getElementById("user-list");
    const searchInput = document.getElementById("search-users-bar");
    const searchTerm = searchInput ? searchInput.value : "";

    if (searchTerm) {
      filterAndRenderUsers(
        allUsers,
        allFriendships,
        loggedInUserId,
        userListContainer,
        searchTerm
      );
    } else {
      renderUserCards(
        allUsers,
        allFriendships,
        loggedInUserId,
        userListContainer
      );
    }
  } catch (error) {
    console.error("Error refreshing after friend request:", error);
  }
}

/**
 * Handle friend request accepted/declined event
 * @private
 */
async function handleFriendRequestHandled() {
  try {
    // Refresh both friendships and incoming requests
    await Promise.all([refreshFriendshipsData(), loadIncomingRequests()]);
  } catch (error) {
    console.error("Error refreshing after friend request action:", error);
  }
}

/**
 * Refresh friendships data and re-render user cards
 * @private
 */
async function refreshFriendshipsData() {
  try {
    allFriendships = await FriendService.getFriendships(loggedInUserId);

    const userListContainer = document.getElementById("user-list");
    const searchInput = document.getElementById("search-users-bar");
    const searchTerm = searchInput ? searchInput.value : "";

    if (searchTerm) {
      filterAndRenderUsers(
        allUsers,
        allFriendships,
        loggedInUserId,
        userListContainer,
        searchTerm
      );
    } else {
      renderUserCards(
        allUsers,
        allFriendships,
        loggedInUserId,
        userListContainer
      );
    }
  } catch (error) {
    console.error("Error refreshing friendships:", error);
  }
}

/**
 * Public method to refresh page data (can be called from other modules)
 */
export async function refreshUsersPage() {
  await Promise.all([loadUsersData(), loadIncomingRequests()]);
}
