/**
 * Profile page controller
 * Handles user profile viewing and editing functionality
 */

import { UserService } from "../services/userService.js";
import { FriendService } from "../services/friendService.js";
import { getLoggedInUser, requireAuth, logout } from "../auth/authUtils.js";
import { showSuccess, showError } from "../components/toast.js";

// Page state
let currentUser = null;
let isEditMode = false;

/**
 * Initialize profile page
 */
export async function initProfilePage() {
  // Only run on profile.html
  if (!window.location.pathname.endsWith("profile.html")) {
    return;
  }

  // Ensure user is authenticated
  if (!requireAuth()) {
    return;
  }

  try {
    // Get current user
    currentUser = getLoggedInUser();
    if (!currentUser) {
      showError("Authentication error. Please sign in again.");
      return;
    }

    // Determine which profile to load
    const profileToLoad = determineProfileToLoad();
    setupEventListeners(profileToLoad);
    // Load user profile data
    await loadProfileData(profileToLoad);
  } catch (error) {
    console.error("Error initializing profile page:", error);
    showError("Failed to load profile. Please refresh.");
  }
}

/**
 * Determine which user's profile to load
 * @private
 * @returns {object} - Profile info object
 */
function determineProfileToLoad() {
  const urlParams = new URLSearchParams(window.location.search);
  const requestedSlug = urlParams.get("slug");
  const requestedUserId = urlParams.get("id");

  // check if it's own profile by comparing slugs and IDs
  const isOwnProfile =
    (!requestedSlug && !requestedUserId) || // No params = own profile
    requestedSlug === currentUser.slug || // Same slug = own profile
    (requestedUserId && parseInt(requestedUserId) === currentUser.userId); // Same ID = own profile
  return {
    isOwnProfile,
    targetSlug: requestedSlug,
    targetUserId: requestedUserId,
    currentUserSlug: currentUser.slug,
    currentUserId: currentUser.userId,
  };
}

/**
 * Load user profile data
 * @private
 */
async function loadProfileData(profileInfo) {
  try {
    showLoadingState();

    let userData;

    if (profileInfo.isOwnProfile) {
      // Get detailed user data
      userData = await UserService.getUserById(currentUser.userId);
    } else if (profileInfo.targetSlug) {
      userData = await UserService.getUserBySlug(profileInfo.targetSlug);

      if (!userData) {
        showError("User not found");
        return;
      }
    } else if (profileInfo.targetUserId) {
      // Loading profile by ID
      userData = await UserService.getUserById(profileInfo.targetUserId);

      if (!userData) {
        showError("User not found");
        return;
      }
    }

    // Populate profile display
    populateProfileDisplay(userData, profileInfo);

    hideLoadingState();
  } catch (error) {
    console.error("Error loading profile data:", error);
    hideLoadingState();
    showError("Failed to load profile data.");
  }
}

/**
 * Populate profile display with user data
 * @private
 * @param {object} userData - User data object
 */
async function populateProfileDisplay(userData, profileInfo) {
  // Basic info
  const nameElement = document.getElementById("profile-name");
  const emailElement = document.getElementById("profile-email");
  const joinDateElement = document.getElementById("profile-join-date");
  const initialsElement = document.getElementById("profile-initials");

  if (nameElement)
    nameElement.textContent =
      `${userData.first_name} ${userData.last_name}` || "No name provided";
  if (emailElement) emailElement.textContent = userData.email;

  // Generate initials for avatar
  if (initialsElement) {
    const initials = generateInitials(
      `${userData.first_name} ${userData.last_name}` || userData.email
    );
    initialsElement.textContent = initials;
  }

  if (joinDateElement && userData.created_at) {
    const joinDate = new Date(userData.created_at).toLocaleDateString("en-SE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    joinDateElement.textContent = joinDate;
  }

  if (profileInfo.isOwnProfile) {
    const firstNameInput = document.getElementById("edit-first-name");
    const lastNameInput = document.getElementById("edit-last-name");
    const emailInput = document.getElementById("edit-email");

    if (firstNameInput) firstNameInput.value = userData.first_name || "";
    if (lastNameInput) lastNameInput.value = userData.last_name || "";
    if (emailInput) emailInput.value = userData.email || "";
  }

  // FIX: Pass userData.id to toggleProfileActions
  await toggleProfileActions(profileInfo.isOwnProfile, userData.id);

  updateProfileStats();
}

/**
 * Show/hide profile action buttons based on profile ownership
 * @private
 * @param {boolean} isOwnProfile - Whether viewing own profile
 */
async function toggleProfileActions(isOwnProfile, otherUserId = null) {
  // Profile management buttons (only for own profile)
  const container = document.getElementById("profile-actions");
  if (!container) return;

  if (isOwnProfile) {
    // Show own profile actions (edit, logout, password)
    container.innerHTML = `
      <div class="own-profile-actions">
        <button id="edit-profile-btn" class="btn-primary">
          Edit Profile
        </button>
        <button id="change-password-btn" class="btn-secondary">
          Change Password
        </button>
        <button id="logout-btn" class="btn-danger">
          Sign Out
        </button>
      </div>
    `;

    const editBtn = document.getElementById("edit-profile-btn");
    const changePasswordBtn = document.getElementById("change-password-btn");
    const logoutBtn = document.getElementById("logout-btn");

    if (editBtn) {
      editBtn.addEventListener("click", toggleEditMode);
    }
    if (changePasswordBtn) {
      changePasswordBtn.addEventListener("click", showChangePasswordModal);
    }
    if (logoutBtn) {
      logoutBtn.addEventListener("click", handleLogout);
    }
  } else {
    try {
      await loadAndCreateFriendshipActions(otherUserId);
    } catch (error) {
      console.error("Error loading friendship", error);
    }
  }
}
function setupEventListeners(profileInfo) {
  if (profileInfo.isOwnProfile) {
    // Save profile button
    const saveBtn = document.getElementById("save-profile-btn");
    if (saveBtn) {
      saveBtn.addEventListener("click", saveProfileChanges);
    }
    // Cancel edit button
    const cancelBtn = document.getElementById("cancel-edit-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", cancelEditMode);
    }
  }
}

/**
 * Generate initials from name or email
 * @private
 * @param {string} nameOrEmail - Name or email to generate initials from
 * @returns {string} - Generated initials
 */
function generateInitials(nameOrEmail) {
  if (!nameOrEmail) return "U";

  const words = nameOrEmail.split(/[\s@]/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return nameOrEmail.substring(0, 2).toUpperCase();
}

/**
 * TODO: Implement this
 * Update profile statistics.
 * @private
 */
function updateProfileStats() {
  const eventsCountElement = document.getElementById("user-events-count");
  const upcomingCountElement = document.getElementById("user-upcoming-count");
  const invitesCountElement = document.getElementById("user-invites-count");

  // Placeholder values
  if (eventsCountElement) eventsCountElement.textContent = "0";
  if (upcomingCountElement) upcomingCountElement.textContent = "0";
  if (invitesCountElement) invitesCountElement.textContent = "0";
}

/**
 * Load friendship status and create appropriate actions
 * @private
 */
async function loadAndCreateFriendshipActions(otherUserId) {
  const container = document.getElementById("profile-actions");
  if (!container) return;

  try {
    // Show loading state
    container.innerHTML = `
      <div class="loading-actions">
        <span>Loading...</span>
      </div>
    `;

    // Get friendship status
    const status = await getFriendshipStatus(otherUserId);

    // Create button based on status
    createFriendshipActions(status, otherUserId);
  } catch (error) {
    console.error("Error loading friendship status", error);
    // Fallback to basic add friend
    createFriendshipActions({ status: "none" }, otherUserId);
  }
}

/**
 * Get friendship status between current user and other user
 * @private
 */
async function getFriendshipStatus(otherUserId) {
  try {
    const [friendships, incomingRequests, outgoingRequests] = await Promise.all(
      [
        FriendService.getFriendships(currentUser.userId),
        FriendService.getIncomingRequests(currentUser.userId),
        FriendService.getOutgoingRequests(currentUser.userId),
      ]
    );

    // Check if already friends
    const friendship = friendships.find(
      (f) =>
        (f.user_id === currentUser.userId && f.friend_id === otherUserId) ||
        (f.user_id === otherUserId && f.friend_id === currentUser.userId)
    );

    if (friendship && friendship.status === "accepted") {
      return { status: "friends", data: friendship };
    }

    if (friendship && friendship.status === "declined") {
      return { status: "declined", data: friendship};
    }

    // Check for outgoing request
    const sentRequest = outgoingRequests.find(
      (r) => r.friend_id === otherUserId
    );
    if (sentRequest) {
      return { status: "pending_sent", data: sentRequest };
    }

    const receivedRequest = incomingRequests.find(
      (r) => r.user_id === otherUserId
    );
    if (receivedRequest) {
      return { status: "pending_received", data: receivedRequest };
    }

    return { status: "none" };
  } catch (error) {
    console.error("Error getting friendship status:", error);
    throw new Error(error);
  }
}

/**
 * Create friendship action buttons based on status
 * @private
 */
function createFriendshipActions(statusObj, otherUserId) {
  const container = document.getElementById("profile-actions");
  if (!container) {
    return;
  }
  console.log(statusObj);
  const { status, data } = statusObj;

  switch (status) {
    case "friends":
      container.innerHTML = `
        <div class="friendship-actions friends-state">
          <div class="status-badge friends">
            Friends
          </div>
          <button id="unfriend-btn" class="btn-danger btn-sm">
            Remove Friend
          </button>
        </div>
      `;
      const unfriendBtn = document.getElementById("unfriend-btn");
      if (unfriendBtn) {
        unfriendBtn.addEventListener("click", () =>
          handleUnfriend(otherUserId)
        );
      }
      break;

    case "pending_sent":
      container.innerHTML = `
        <div class="friendship-actions pending-state">
          <div class="status-badge pending">
            Friend Request Sent
          </div>
          <button id="cancel-request-btn" class="btn-secondary btn-sm">
            Cancel Request
          </button>
        </div>
      `;
      const cancelBtn = document.getElementById("cancel-request-btn");
      if (cancelBtn) {
        cancelBtn.addEventListener("click", () =>
          //CHECK!!
          handleCancelRequest(data.user_id, data.friend_id)
        );
      }
      break;

    case "pending_received":
      container.innerHTML = `
        <div class="friendship-actions received-state">
          <div class="status-badge received">
            Wants to Be Friends
          </div>
          <div class="action-buttons">
            <button id="accept-request-btn" class="btn-primary btn-sm">
              Accept
            </button>
            <button id="decline-request-btn" class="btn-secondary btn-sm">
              Decline
            </button>
          </div>
        </div>
      `;
      const acceptBtn = document.getElementById("accept-request-btn");
      const declineBtn = document.getElementById("decline-request-btn");

      if (acceptBtn) {
        acceptBtn.addEventListener("click", () =>
          handleAcceptRequest(data.user_id, data.friend_id)
        );
      }
      if (declineBtn) {
        declineBtn.addEventListener("click", () =>
          handleDeclineFriendRequest(data.user_id, data.friend_id)
        );
      }
      break;
    
    case "declined":
      container.innerHTML = `
        <div class="friendship-actions received-state">
          <div class="status-badge declined">
            Declined
          </div>
        </div>
      `;
      break;
    case "none":
    default:
      container.innerHTML = `
        <div class="friendship-actions none-state">
          <button id="send-friend-request-btn" class="btn-primary">
            Add Friend
          </button>
        </div>
      `;

      const addFriendBtn = document.getElementById("send-friend-request-btn");
      if (addFriendBtn) {
        addFriendBtn.addEventListener("click", () =>
          handleSendFriendRequest(otherUserId)
        );
      }
      break;
  }
}

/**
 * Toggle between view and edit modes
 * @private
 */
function toggleEditMode() {
  isEditMode = !isEditMode;

  const viewMode = document.getElementById("profile-view-mode");
  const editMode = document.getElementById("profile-edit-mode");

  if (isEditMode) {
    if (viewMode) viewMode.style.display = "none";
    if (editMode) editMode.style.display = "block";
  } else {
    if (viewMode) viewMode.style.display = "block";
    if (editMode) editMode.style.display = "none";
  }
}

/**
 * Cancel edit mode and revert changes
 * @private
 */
function cancelEditMode() {
  isEditMode = false;

  // Get profile info and reload original data
  const profileInfo = determineProfileToLoad();
  loadProfileData(profileInfo);

  const viewMode = document.getElementById("profile-view-mode");
  const editMode = document.getElementById("profile-edit-mode");

  if (viewMode) viewMode.style.display = "block";
  if (editMode) editMode.style.display = "none";
}

/**
 * Save profile changes
 * @private
 */
async function saveProfileChanges() {
  try {
    const firstNameInput = document.getElementById("edit-first-name");
    const lastNameInput = document.getElementById("edit-last-name");
    const emailInput = document.getElementById("edit-email");

    const updateData = {
      first_name: firstNameInput?.value.trim(),
      last_name: lastNameInput?.value.trim(),
      email: emailInput?.value.trim(),
    };

    // Validate input
    if (!updateData.email) {
      showError("Email is required");
      return;
    }

    if (!isValidEmail(updateData.email)) {
      showError("Please enter a valid email address");
      return;
    }

    // Show loading state
    const saveBtn = document.getElementById("save-profile-btn");
    const originalText = saveBtn?.textContent;
    if (saveBtn) {
      saveBtn.textContent = "Saving...";
      saveBtn.disabled = true;
    }

    // Update profile
    const updatedUser = await UserService.updateUser(
      currentUser.userId,
      updateData
    );

    // Update localStorage with new user data
    if (updatedUser) {
      currentUser = { ...currentUser, ...updatedUser };
      localStorage.setItem("user", JSON.stringify(currentUser));
    }

    showSuccess("Profile updated successfully!");

    // Refresh display with updated data
    const profileInfo = determineProfileToLoad();
    await loadProfileData(profileInfo);

    // Exit edit mode
    toggleEditMode();
  } catch (error) {
    console.error("Error saving profile:", error);
    showError("Failed to update profile. Please try again.");
  } finally {
    // Restore button state
    const saveBtn = document.getElementById("save-profile-btn");
    if (saveBtn) {
      saveBtn.textContent = "Save Changes";
      saveBtn.disabled = false;
    }
  }
}

/**
 * Handle user logout
 * @private
 */
function handleLogout() {
  const confirmed = confirm("Are you sure you want to logout?");

  if (confirmed) {
    logout();
    showSuccess("Logged out successfully!");
    setTimeout(() => {
      window.location.href = "sign_in.html";
    }, 1000);
  }
}

/**
 * Handle sending friend request
 * @private
 */
async function handleSendFriendRequest(friendId) {
  const btn = document.getElementById("send-friend-request-btn");
  const originalText = btn?.textContent;

  try {
    if (btn) {
      btn.textContent = "Sending...";
      btn.disabled = true;
    }

    await FriendService.sendFriendRequest(currentUser.userId, friendId);
    showSuccess("Friend request sent!");

    // Refresh friendship status
    await loadAndCreateFriendshipActions(friendId);
  } catch (error) {
    console.error("Error sending friend request:", error);
    showError("Failed to send friend request");

    // Restore button
    if (btn && originalText) {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  }
}

/**
 * Handle unfriending a user
 * @private
 */
async function handleUnfriend(friendId) {
  const confirmed = confirm("Are you sure you want to remove this friend?");
  if (!confirmed) return;

  try {
    await FriendService.removeFriend(currentUser.userId, friendId);
    showSuccess("Friend removed");

    // Refresh friendship status
    await loadAndCreateFriendshipActions(friendId);

    // Dispatch event for other components
    document.dispatchEvent(new CustomEvent("friendshipChanged"));
  } catch (error) {
    console.error("Error removing friend:", error);
    showError("Failed to remove friend");
  }
}

/**
 * Handle unfriending a user
 * @private
 */
async function handleDeclineFriendRequest(senderId, receiverId) {
  const confirmed = confirm(
    "Are you sure you want to decline this friend request?"
  );
  if (!confirmed) return;

  try {
    await FriendService.declineFriendRequest(senderId, receiverId);
    showSuccess("Friend request declined");

    // Refresh friendship status
    await loadAndCreateFriendshipActions(senderId);

    // Dispatch event for other components
    document.dispatchEvent(new CustomEvent("friendshipChanged"));
  } catch (error) {
    console.error("Error removing friend:", error);
    showError("Failed to remove friend");
  }
}

/**
 * Handle accepting friend request
 * @private
 */
async function handleAcceptRequest(requestId, otherUserId) {
  try {
    await FriendService.acceptFriendRequest(requestId, otherUserId)
    showSuccess("Friend request accepted!");
    
    // Refresh friendship status
    await loadAndCreateFriendshipActions(requestId);
    
    // Dispatch event for other components
    document.dispatchEvent(new CustomEvent('friendRequestHandled'));
    
  } catch (error) {
    console.error("Error accepting friend request:", error);
    showError("Failed to accept friend request");
  }
}

/**
 * Handle canceling friend request
 * @private
 */
async function handleCancelRequest(requestId, otherUserId) {
  try {
    await FriendService.removeFriend(requestId, otherUserId);
    showSuccess("Friend request canceled");
    
    // Refresh friendship status
    await loadAndCreateFriendshipActions(otherUserId);
    
  } catch (error) {
    console.error("Error canceling friend request:", error);
    showError("Failed to cancel friend request");
  }
}

/**
 * Show change password modal (placeholder)
 * @private
 */
function showChangePasswordModal() {
  // This would open a modal or navigate to a change password page
  showError("Implement this");
}

/**
 * Show change password modal (placeholder)
 * @private
 */
function showMessageModal() {
  // This would open a modal or navigate to a change password page
  showError("Might implement?");
}

/**
 * Validate email format
 * @private
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Show loading state with overlay
 * @private
 */
function showLoadingState() {
  const container = document.getElementById("profile-content");
  if (container) {
    // Add loading overlay without destroying content
    const loadingOverlay = document.createElement("div");
    loadingOverlay.id = "profile-loading-overlay";
    loadingOverlay.className = "loading-overlay";
    loadingOverlay.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Loading profile...</p>
      </div>
    `;
    container.appendChild(loadingOverlay);
  }
}

/**
 * Hide loading state
 * @private
 */
function hideLoadingState() {
  const overlay = document.getElementById("profile-loading-overlay");
  if (overlay) {
    overlay.remove();
  }
}
