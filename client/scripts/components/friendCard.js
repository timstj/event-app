/**
 * Friend card component
 * Handles rendering and interactions for friend cards
 */

import { FriendService } from "../services/friendService.js";
import { showSuccess, showError } from "./toast.js";

/**
 * Create and render friend cards for the friends section
 * @param {Array} friendships - Array of accepted friendship objects
 * @param {number} loggedInUserId - Current user's ID
 * @param {HTMLElement} container - Container element to render cards into
 */
export function renderFriendCards(friends, loggedInUserId, container) {
  if (!container) {
    console.error("Container element not found for friend cards");
    return;
  }

  // Clear existing content
  container.innerHTML = "";

  if (!friends || friends.length === 0) {
    showEmptyFriendsState(container);
    return;
  }

  // Sort by name
  const sortedFriends = friends.sort((a, b) =>
    (a.last_name || "").localeCompare(b.last_name || "")
  );

  // Render each friend card
  sortedFriends.forEach((friend) => {
    const card = createFriendCard(friend, loggedInUserId);
    container.appendChild(card);
  });
}

/**
 * Create individual friend card element
 * @private
 * @param {object} friend - Friend user object
 * @param {number} loggedInUserId - Current user's ID
 * @returns {HTMLElement} - Friend card element
 */
function createFriendCard(friend, loggedInUserId) {
  const card = document.createElement("div");
  card.className = "friend-card";

  // Create card content
  card.innerHTML = `
        <div class="friend-info">
            <h3>${friend.first_name} ${friend.last_name}</h3>
            <p class="friend-email">${friend.email}</p>
        </div>
    `;

  // Add click handler for profile navigation
  const friendInfo = card.querySelector(".friend-info");
  friendInfo.addEventListener("click", () => {
    window.location.href = `profile.html?slug=${friend.slug}`;
  });

  // Create and add action buttons
  const actionsContainer = createFriendActions(friend, loggedInUserId);
  card.appendChild(actionsContainer);

  return card;
}

/**
 * Create friend action buttons
 * @private
 * @param {object} friend - Friend object
 * @param {number} loggedInUserId - Current user's ID
 * @returns {HTMLElement} - Actions container element
 */
function createFriendActions(friend, loggedInUserId) {
  const actionsContainer = document.createElement("div");
  actionsContainer.className = "friend-actions";

  const viewProfileBtn = document.createElement("button");
  viewProfileBtn.className = "btn-view-profile";
  viewProfileBtn.textContent = "View Profile";
  viewProfileBtn.addEventListener("click", (e) => {
    // To prevent the card eventlistener
    e.stopPropagation();
    window.location.href = `profile.html?slug=${friend.slug}`;
  });

  // Remove friend button
  const removeFriendBtn = document.createElement("button");
  removeFriendBtn.className = "btn-remove-friend";
  removeFriendBtn.textContent = "Remove Friend";
  removeFriendBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    await handleRemoveFriend(friend, loggedInUserId);
  });

  actionsContainer.appendChild(viewProfileBtn);
  actionsContainer.appendChild(removeFriendBtn);

  return actionsContainer;
}

/**
 * Handle removing a friend
 * @private
 * @param {object} friend - Friend object
 * @param {number} loggedInUserId - Current user's ID
 */
async function handleRemoveFriend(friend, loggedInUserId) {
  // Confirm
  if (
    !confirm(
      `Are you sure you want to remove ${friend.first_name} ${friend.last_name} from your friends?`
    )
  ) {
    return;
  }

  // Get the card element for animation
  const cardElement = event.target.closest(".friend-card");

  try {
    // Add removing animation
    if (cardElement) {
      cardElement.classList.add("friend-card-removing");
    }

    await FriendService.removeFriend(loggedInUserId, friend.id);

    showSuccess(
      `${friend.first_name} ${friend.last_name} has been removed from your friends`
    );

    // Wait for animation to complete before dispatching event
    setTimeout(() => {
      const refreshEvent = new CustomEvent("friendshipChanged");
      document.dispatchEvent(refreshEvent);
    }, 300);
  } catch (error) {
    console.error("Error removing friend:", error);
    // Remove animation class on error
    if (cardElement) {
      cardElement.classList.remove("friend-card-removing");
    }
    showError("Failed to remove friend. Please try again.");
  }
}

/**
 * Show empty friends state
 * @private
 * @param {HTMLElement} container - Container element
 */
function showEmptyFriendsState(container) {
  const emptyDiv = document.createElement("div");
  emptyDiv.className = "friends-empty-state";
  emptyDiv.innerHTML = `
    <p>You haven't added any friends yet.</p>
    <p>Send friend requests to connect with other users!</p>
  `;
  container.appendChild(emptyDiv);
}
