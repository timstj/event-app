/**
 * User card component
 * Handles rendering and interactions for individual user cards
 */

import { FriendService } from "../services/friendService.js";
import { showSuccess, showError } from "./toast.js";

/**
 * Create and render user cards
 * @param {Array} users - Array of user objects to render
 * @param {Array} friendships - Array of friendship objects
 * @param {number} loggedInUserId - Current user's ID
 * @param {HTMLElement} container - Container element to render cards into
 */
export function renderUserCards(users, friendships, loggedInUserId, container) {
  if (!container) {
    console.error("Container element not found for user cards");
    return;
  }

  // Clear existing content
  container.innerHTML = "";

  // Filter out the logged-in user and sort by last name
  const filteredUsers = users.filter((user) => user.id !== loggedInUserId);
  const sortedUsers = filteredUsers.sort((a, b) =>
    (a.last_name || "").localeCompare(b.last_name || "")
  );

  // Render each user card
  sortedUsers.forEach((user) => {
    const card = createUserCard(user, friendships, loggedInUserId);
    container.appendChild(card);
  });

  // Show message if no users found
  if (sortedUsers.length === 0) {
    const message = document.createElement("p");
    message.textContent = "No users found.";
    message.className = "no-users-message";
    container.appendChild(message);
  }
}

/**
 * Create individual user card element
 * @private
 * @param {object} user - User object
 * @param {Array} friendships - Array of friendship objects
 * @param {number} loggedInUserId - Current user's ID
 * @returns {HTMLElement} - User card element
 */
function createUserCard(user, friendships, loggedInUserId) {
  const card = document.createElement("div");
  card.className = "user-card";

  // Create card content
  card.innerHTML = `
    <div class="user-info">
      <h3>${user.first_name} ${user.last_name}</h3>
      <p class="user-email">${user.email}</p>
    </div>
  `;

  // Add click handler for profile navigation
  const userInfo = card.querySelector(".user-info");
  userInfo.addEventListener("click", () => {
    window.location.href = `profile.html?slug=${user.slug}`;
  });

  // Find friendship status
  const friendship = findFriendshipStatus(user.id, friendships, loggedInUserId);

  // Create and add action button
  const button = createActionButton(user, friendship, loggedInUserId);
  card.appendChild(button);

  return card;
}

/**
 * Find friendship status between two users
 * @private
 * @param {number} userId - Target user's ID
 * @param {Array} friendships - Array of friendship objects
 * @param {number} loggedInUserId - Current user's ID
 * @returns {object|null} - Friendship object or null
 */
function findFriendshipStatus(userId, friendships, loggedInUserId) {
  return friendships.find(
    (friendship) =>
      (friendship.user_id === loggedInUserId && friendship.friend_id === userId) ||
      (friendship.friend_id === loggedInUserId && friendship.user_id === userId)
  );
}

/**
 * Create action button based on friendship status
 * @private
 * @param {object} user - User object
 * @param {object|null} friendship - Friendship object or null
 * @param {number} loggedInUserId - Current user's ID
 * @returns {HTMLElement} - Button element
 */
function createActionButton(user, friendship, loggedInUserId) {
  const button = document.createElement("button");
  button.className = "user-action-btn";

  if (friendship) {
    // Handle existing friendship
    if (friendship.status === "pending") {
      button.textContent = "Request Sent";
      button.disabled = true;
      button.classList.add("btn-pending");
    } else if (friendship.status === "accepted") {
      button.textContent = "Friends";
      button.disabled = true;
      button.classList.add("btn-friends");
    } else if (friendship.status === "declined") {
      button.textContent = "Declined";
      button.disabled = true;
      button.classList.add("btn-declined");
    }
  } else {
    // No friendship exists
    setupSendRequestButton(button, user, loggedInUserId);
  }

  return button;
}

/**
 * Setup send friend request button
 * @private
 * @param {HTMLElement} button - Button element
 * @param {object} user - Target user object
 * @param {number} loggedInUserId - Current user's ID
 */
function setupSendRequestButton(button, user, loggedInUserId) {
  button.textContent = "Send Friend Request";
  button.classList.add("btn-send-request");

  button.addEventListener("click", async (event) => {
    event.stopPropagation(); // Prevent the navigation to the profile page as that is also a button on the card
    await handleSendFriendRequest(button, user, loggedInUserId);
  });
}

/**
 * Handle sending friend request
 * @private
 * @param {HTMLElement} button - Button element
 * @param {object} user - Target user object
 * @param {number} loggedInUserId - Current user's ID
 */
async function handleSendFriendRequest(button, user, loggedInUserId) {
  const originalText = button.textContent;
  const originalClasses = [...button.classList];

  try {
    // Show loading state
    button.textContent = "Sending...";
    button.disabled = true;

    // Send friend request
    await FriendService.sendFriendRequest(loggedInUserId, user.id);

    // Only update UI if request was successful
    button.textContent = "Request Sent";
    button.classList.remove("btn-send-request");
    button.classList.add("btn-pending");

    showSuccess(`Friend request sent to ${user.first_name} ${user.last_name}`);

    // Only dispatch refresh event if request was successful
    const refreshEvent = new CustomEvent("friendRequestSent");
    document.dispatchEvent(refreshEvent);
  } catch (error) {
    console.error("Error sending friend request:", error);

    // Restore original button state on error
    button.textContent = originalText;
    button.disabled = false;

    // Restore original classes
    button.className = "user-action-btn";
    originalClasses.forEach((cls) => {
      if (cls !== "user-action-btn") {
        button.classList.add(cls);
      }
    });

    // Show appropriate error message based on error type
    showError("Error sending request");
  }
}

/**
 * Filter and re-render user cards (for search functionality)
 * @param {Array} allUsers - Complete array of users
 * @param {Array} friendships - Array of friendship objects
 * @param {number} loggedInUserId - Current user's ID
 * @param {HTMLElement} container - Container element
 * @param {string} searchTerm - Search term to filter by
 */
export function filterAndRenderUsers(
  allUsers,
  friendships,
  loggedInUserId,
  container,
  searchTerm
) {
  const filteredUsers = allUsers.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const email = user.email.toLowerCase();
    const search = searchTerm.toLowerCase();

    return fullName.includes(search) || email.includes(search);
  });

  renderUserCards(filteredUsers, friendships, loggedInUserId, container);
}
