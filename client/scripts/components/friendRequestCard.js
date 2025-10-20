/**
 * Friend request card component
 * Handles rendering and interactions for incoming friend requests
 */

import { FriendService } from "../services/friendService.js";
import { showSuccess, showError } from "./toast.js";

/**
 * Render incoming friend requests
 * @param {Array} requests - Array of incoming friend request objects
 * @param {HTMLElement} container - Container element to render into
 */
export function renderFriendRequests(requests, container) {
  if (!container) {
    console.error("Container element not found for friend requests");
    return;
  }

  // Clear existing content
  container.innerHTML = "";

  if (!requests || requests.length === 0) {
    // No requests to display
    return;
  }

  // Add section header
  const header = document.createElement("h2");
  header.textContent = "Pending Friend Requests";
  header.className = "friend-requests-header";
  container.appendChild(header);

  // Create requests container
  const requestsContainer = document.createElement("div");
  requestsContainer.className = "friend-requests-container";

  // Render each request
  requests.forEach((request) => {
    const card = createFriendRequestCard(request);
    requestsContainer.appendChild(card);
  });

  container.appendChild(requestsContainer);
}

/**
 * Create individual friend request card
 * @private
 * @param {object} request - Friend request object
 * @returns {HTMLElement} - Request card element
 */
function createFriendRequestCard(request) {
  const card = document.createElement("div");
  card.className = "request-card";

  card.innerHTML = `
    <div class="request-info">
      <h4>${request.first_name} ${request.last_name}</h4>
      <p class="request-email">${request.email}</p>
    </div>
    <div class="request-actions">
      <button class="btn-accept">Accept</button>
      <button class="btn-decline">Decline</button>
    </div>
  `;

  // Add event listeners
  const acceptBtn = card.querySelector(".btn-accept");
  const declineBtn = card.querySelector(".btn-decline");

  acceptBtn.addEventListener("click", () =>
    handleRequestAction(card, request, "accept")
  );

  declineBtn.addEventListener("click", () =>
    handleRequestAction(card, request, "decline")
  );

  return card;
}

/**
 * Handle friend request action (accept/decline)
 * @private
 * @param {HTMLElement} card - Request card element
 * @param {object} request - Friend request object
 * @param {string} action - 'accept' or 'decline'
 */
async function handleRequestAction(card, request, action) {
  const acceptBtn = card.querySelector(".btn-accept");
  const declineBtn = card.querySelector(".btn-decline");

  // Get current user ID from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user"));
  if (!currentUser) {
    showError("Authentication error. Please refresh the page.");
    return;
  }

  try {
    // Disable buttons during request
    acceptBtn.disabled = true;
    declineBtn.disabled = true;

    // Show loading state
    if (action === "accept") {
      acceptBtn.textContent = "Accepting...";
    } else {
      declineBtn.textContent = "Declining...";
    }

    // Make API call
    if (action === "accept") {
      await FriendService.acceptFriendRequest(
        request.user_id,
        currentUser.userId
      );
      showSuccess(
        `You are now friends with ${request.first_name} ${request.last_name}`
      );
    } else {
      await FriendService.declineFriendRequest(
        request.user_id,
        currentUser.userId
      );
      showSuccess(`Friend request declined`);
    }

    // Remove card with animation
    card.classList.add("request-card-removing");
    setTimeout(() => {
      if (card.parentNode) {
        card.parentNode.removeChild(card);

        // Check if this was the last request
        const container = document.querySelector(".friend-requests-container");
        if (container && container.children.length === 0) {
          const header = document.querySelector(".friend-requests-header");
          if (header && header.parentNode) {
            header.parentNode.removeChild(header);
          }
          if (container.parentNode) {
            container.parentNode.removeChild(container);
          }
        }
      }
    }, 300);

    // Trigger refresh event for other components
    const refreshEvent = new CustomEvent("friendRequestHandled", {
      detail: { action, request },
    });
    document.dispatchEvent(refreshEvent);
  } catch (error) {
    console.error(`Error ${action}ing friend request:`, error);

    // Restore button states
    acceptBtn.disabled = false;
    declineBtn.disabled = false;
    acceptBtn.textContent = "Accept";
    declineBtn.textContent = "Decline";

    showError(`Failed to ${action} friend request. Please try again.`);
  }
}

/**
 * Update friend request display after actions
 * @param {Array} requests - Updated requests array
 * @param {HTMLElement} container - Container element
 */
export function updateFriendRequests(requests, container) {
  renderFriendRequests(requests, container);
}
