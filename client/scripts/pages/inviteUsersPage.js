/**
 * Invite Users page
 * Handles inviting people to events after creation
 * TODO: Update security, such as XSS.
 */

import { FriendService } from "../services/friendService.js";
import { EventService } from "../services/eventService.js";
import { getLoggedInUser } from "../auth/authUtils.js";
import { showSuccess, showError } from "../components/toast.js";

let currentEventId = null;
let currentEventTitle = "";
let loggedInUser = null;
let allFriends = [];
let selectedUsers = [];
let existingInvitations = [];

/**
 * Initialize invite users page
 */
export function initInviteUsersPage() {
  // To only run on invite users.html
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split("/").pop() || "";

  if (currentPage !== "invite_users.html") {
    return;
  }

  loggedInUser = getLoggedInUser();
  if (!loggedInUser) {
    window.location.href = "sign_in.html";
    showError("Please sign in again");
    return;
  }

  // Check if elements exists
  if (
    !document.getElementById("loading-spinner") ||
    !document.getElementById("invite-content")
  ) {
    console.error("Required invite page elements not found");
    return;
  }

  loadPageData();
  setupEventListeners();
}

/**
 * Load page data - event info and friends list
 */
async function loadPageData() {
  const loadingSpinner = document.getElementById("loading-spinner");
  const errorMessage = document.getElementById("error-message");
  const inviteContent = document.getElementById("invite-content");

  try {
    const urlParams = new URLSearchParams(window.location.search);
    currentEventId = urlParams.get("eventId");
    // CHECK: Dont think this will be used
    currentEventTitle = urlParams.get("eventTitle") || "Your event";

    if (!currentEventId) {
      throw new Error("No event ID provided");
    }

    // To show loading state
    loadingSpinner.style.display = "block";
    errorMessage.style.display = "none";
    inviteContent.style.display = "none";

    // Set the event title
    // CHECK: eventTitle
    document.getElementById("event-title").textContent =
      decodeURIComponent(currentEventTitle);
    document.title = `Invite People to ${decodeURIComponent(
      currentEventTitle
    )} - Event App`;

    // Load friends list and exisiting invitations seperate to avoid race conditions
    await loadExistingInvitations();

    await loadFriendsList();

    // To show invite content
    loadingSpinner.style.display = "none";
    inviteContent.style.display = "block";
  } catch (error) {
    console.error("Error loading invite page:", error);
    loadingSpinner.style.display = "none";
    errorMessage.style.display = "block";
    showError("Failed to load invite page");
  }
}

/**
 * Load existing invitations for this event
 */
async function loadExistingInvitations() {
  try {
    existingInvitations = await EventService.getEventAttendees(currentEventId);
  } catch (error) {
    console.error("Error loading existing invitations:", error);
    existingInvitations = [];
  }
}

/**
 * Check if user is already invited
 */
function isUserAlreadyInvited(userId) {
  return existingInvitations.some((invitation) => invitation.id === userId);
}

/**
 * Load user's friends list
 */
async function loadFriendsList() {
  const friendsContainer = document.getElementById("friends-list");

  try {
    // Load friends
    allFriends = await FriendService.getFriends(loggedInUser.userId);

    if (allFriends.length === 0) {
      friendsContainer.innerHTML = `
        <div class="no-friends">
          <p>You don't have any friends added yet.</p>
          <p>Use the search below to find people to invite, or <a href="users.html">browse users</a> to add friends first.</p>
        </div>
      `;
      return;
    }

    renderFriendsList();
  } catch (error) {
    console.error("Error loading friends:", error);
    friendsContainer.innerHTML = `
      <div class="friends-error">
        <p>Failed to load friends list.</p>
        <p>You can still search for people below.</p>
      </div>
    `;
  }
}

/**
 * Render friends list with checkboxes
 */
function renderFriendsList() {
  const friendsContainer = document.getElementById("friends-list");

  // Learning how to prevent XSS
  //Using textContent escapes html characters
  const escapeHtml = (text) => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  const friendsHTML = allFriends
    .map((friend) => {
      // Since this is the only thing a user can change
      const safeName = escapeHtml(`${friend.first_name} ${friend.last_name}`);
      const safeEmail = escapeHtml(friend.email);

      const alreadyInvited = isUserAlreadyInvited(friend.id);

      return `
      <div class="friend-item ${
        alreadyInvited ? "already-invited" : ""
      }" data-user-id="${friend.id}">
        <label class="friend-checkbox-label">
          <input 
            type="checkbox" 
            class="friend-checkbox" 
            value="${friend.id}"
            data-first-name="${escapeHtml(friend.first_name)}"
            data-last-name="${escapeHtml(friend.last_name)}"
            data-email="${safeEmail}"
            ${alreadyInvited ? "disabled" : ""}
          />
          <div class="friend-info">
            <div class="friend-name">${safeName}</div>
            <div class="friend-email">${safeEmail}</div>
            ${
              alreadyInvited
                ? '<div class="invitation-status"> Already invited</div>'
                : ""
            }
          </div>
        </label>
      </div>
    `;
    })
    .join("");

  friendsContainer.innerHTML = friendsHTML;
}

/**
 * Toggle friend selection
 */
window.toggleFriendSelection = function (userId, firstName, lastName, email) {
  // Check if already invited
  if (isUserAlreadyInvited(userId)) {
    showError("This person has already been invited to this event");
    return;
  }

  const checkbox = document.querySelector(`input[value="${userId}"]`);
  const isSelected = checkbox.checked;

  if (isSelected) {
    // Add to selected users
    if (!selectedUsers.find((u) => u.id === userId)) {
      selectedUsers.push({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        email: email,
        source: "friends",
      });
    }
  } else {
    // Remove from selected users
    selectedUsers = selectedUsers.filter((u) => u.id !== userId);
  }

  updateSelectedUsersDisplay();
};

/**
 * Setup event delegation for friend checkboxes
 */
function setupFriendEventDelegation() {
  const friendsContainer = document.getElementById("friends-list");

  // Single event listener using event delegation
  friendsContainer.addEventListener("change", (e) => {
    if (e.target.classList.contains("friend-checkbox")) {
      const checkbox = e.target;
      const friendId = parseInt(checkbox.value);
      const firstName = checkbox.dataset.firstName;
      const lastName = checkbox.dataset.lastName;
      const email = checkbox.dataset.email;

      toggleFriendSelection(friendId, firstName, lastName, email);
    }
  });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  setupFriendEventDelegation();
  // Select all friends button
  const selectAllBtn = document.getElementById("select-all-btn");
  if (selectAllBtn) {
    selectAllBtn.addEventListener("click", selectAllFriends);
  }

  // To deselect all friends button
  const deselectAllBtn = document.getElementById("deselect-all-btn");
  if (deselectAllBtn) {
    deselectAllBtn.addEventListener("click", deselectAllFriends);
  }

  const searchInput = document.getElementById("user-search");
  if (searchInput) {
    let searchTimeout;

    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);

      const query = e.target.value.trim();

      if (query.length < 2) {
        document.getElementById("user-search-results").innerHTML = "";
        return;
      }

      searchTimeout = setTimeout(() => {
        searchUsers(query);
      }, 300);
    });
  }

  const sendInvitesBtn = document.getElementById("send-invites-btn");
  if (sendInvitesBtn) {
    sendInvitesBtn.addEventListener("click", sendInvitations);
  }

  const skipBtn = document.getElementById("skip-invites-btn");
  if (skipBtn) {
    skipBtn.addEventListener("click", () => {
      window.location.href = `event.html?id=${currentEventId}`;
    });
  }
}

/**
 * Select all friends
 */
function selectAllFriends() {
  const checkboxes = document.querySelectorAll(".friend-checkbox");
  checkboxes.forEach((checkbox) => {
    if (!checkbox.checked) {
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event("change"));
    }
  });
}

/**
 * Deselect all friends
 */
function deselectAllFriends() {
  const checkboxes = document.querySelectorAll(".friend-checkbox");
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      checkbox.checked = false;
      checkbox.dispatchEvent(new Event("change"));
    }
  });
}

/**
 * Search for users (non-friends)
 */
async function searchUsers(query) {
  const resultsContainer = document.getElementById("user-search-results");

  showError("Not implemented yet");
}

/**
 * Update selected users display
 */
function updateSelectedUsersDisplay() {
  const selectedContainer = document.getElementById("selected-users-list");
  const countElement = document.getElementById("selected-count");
  const inviteCountElement = document.getElementById("invite-count");
  const sendBtn = document.getElementById("send-invites-btn");

  // Update counters
  countElement.textContent = selectedUsers.length;
  inviteCountElement.textContent = selectedUsers.length;

  // Enable/disable send button
  sendBtn.disabled = selectedUsers.length === 0;

  if (selectedUsers.length === 0) {
    selectedContainer.innerHTML = `
      <div class="empty-state">
        <p>No one selected yet.</p>
        <p>Select friends above or search for people to invite.</p>
      </div>
    `;
    return;
  }

  // Render selected users
  selectedContainer.innerHTML = selectedUsers
    .map(
      (user) => `
    <div class="selected-user-card" data-user-id="${user.id}">
      <div class="user-info">
        <strong>${user.first_name} ${user.last_name}</strong>
        <span>${user.email}</span>
        <small class="source-badge">${
          user.source === "friends" ? "Friend" : "Search"
        }</small>
      </div>
      <button type="button" onclick="removeSelectedUser(${
        user.id
      })" class="btn-remove">X</button>
    </div>
  `
    )
    .join("");
}

/**
 * Remove user from selected list
 */
window.removeSelectedUser = function (userId) {
  // Remove from selected users
  selectedUsers = selectedUsers.filter((u) => u.id !== userId);

  // Uncheck friend checkbox if it was a friend
  const checkbox = document.querySelector(`input[value="${userId}"]`);
  if (checkbox) {
    checkbox.checked = false;
  }

  updateSelectedUsersDisplay();
};

/**
 * Send invitations to selected users
 */
async function sendInvitations() {
  if (selectedUsers.length === 0) {
    showError("Please select at least one person to invite");
    return;
  }
  const sendBtn = document.getElementById("send-invites-btn");
  const originalText = sendBtn.innerHTML;

  try {
    // Show loading state
    sendBtn.disabled = true;
    sendBtn.innerHTML = "Sending...";

    console.log("Sending invitations to:", selectedUsers);

    // Send invitations
    const invitePromises = selectedUsers.map((user) =>
      EventService.inviteUserToEvent(currentEventId, user.id)
    );

    await Promise.all(invitePromises);

    showSuccess(`Invitations sent to ${selectedUsers.length} people!`);

    // Redirect to event page
    setTimeout(() => {
      window.location.href = `event.html?id=${currentEventId}`;
    }, 2000);
  } catch (error) {
    console.error("Error sending invitations:", error);
    showError("Failed to send some invitations. Please try again.");

    // Restore button
    sendBtn.disabled = false;
    sendBtn.innerHTML = originalText;
  }
}
