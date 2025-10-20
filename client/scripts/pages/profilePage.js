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

    // Load user profile data
    await loadProfileData(profileToLoad);

    // Setup page interactions
    setupEventListeners(profileToLoad);
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
function populateProfileDisplay(userData, profileInfo) {
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
    // Only populate form fields for editing if its own profile
    const firstNameInput = document.getElementById("edit-first-name");
    const lastNameInput = document.getElementById("edit-last-name");
    const emailInput = document.getElementById("edit-email");

    if (firstNameInput) firstNameInput.value = userData.first_name || "";
    if (lastNameInput) lastNameInput.value = userData.last_name || "";
    if (emailInput) emailInput.value = userData.email || "";
  }

  toggleProfileActions(profileInfo.isOwnProfile);
  // Update profile stats (placeholder values - you can load real data)
  updateProfileStats();
}

/**
 * Show/hide profile action buttons based on profile ownership
 * @private
 * @param {boolean} isOwnProfile - Whether viewing own profile
 */
function toggleProfileActions(isOwnProfile) {
  // Profile management buttons (only for own profile)
  const editBtn = document.getElementById("edit-profile-btn");
  const changePasswordBtn = document.getElementById("change-password-btn");
  const logoutBtn = document.getElementById("logout-btn");

  // Social interaction buttons (only for other profiles)
  const sendFriendRequestBtn = document.getElementById(
    "send-friend-request-btn"
  );

  // Not implemented messages yet
  const messageBtn = document.getElementById("message-btn");

  if (isOwnProfile) {
    // Show own profile actions
    if (editBtn) editBtn.style.display = "block";
    if (changePasswordBtn) changePasswordBtn.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "block";

    // Hide social actions
    if (sendFriendRequestBtn) sendFriendRequestBtn.style.display = "none";
    if (messageBtn) messageBtn.style.display = "none";
  } else {
    // Hide own profile actions
    if (editBtn) editBtn.style.display = "none";
    if (changePasswordBtn) changePasswordBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "none";

    // Show social actions
    if (sendFriendRequestBtn) sendFriendRequestBtn.style.display = "block";
    if (messageBtn) messageBtn.style.display = "block";
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
 * Update profile statistics
 * @private
 */
function updateProfileStats() {
  // These would be real API calls in a full implementation
  const eventsCountElement = document.getElementById("user-events-count");
  const upcomingCountElement = document.getElementById("user-upcoming-count");
  const invitesCountElement = document.getElementById("user-invites-count");

  // Placeholder values - replace with real data
  if (eventsCountElement) eventsCountElement.textContent = "0";
  if (upcomingCountElement) upcomingCountElement.textContent = "0";
  if (invitesCountElement) invitesCountElement.textContent = "0";
}

/**
 * Setup event listeners for profile interactions
 * @private
 */
function setupEventListeners(profileInfo) {
  if (profileInfo.isOwnProfile) {
    // Edit profile button (note the correct ID)
    const editBtn = document.getElementById("edit-profile-btn");
    if (editBtn) {
      editBtn.addEventListener("click", toggleEditMode);
    }

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

    // Logout button
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", handleLogout);
    }

    // Change password button (Not implemented yet)
    const changePasswordBtn = document.getElementById("change-password-btn");
    if (changePasswordBtn) {
      changePasswordBtn.addEventListener("click", showChangePasswordModal);
    }
  } else {
    // Other profile buttons (NEED TO FIX HANDLE SEND FRIEND REQUEST)
    const friendRequestBtn = document.getElementById("send-friend-request-btn");
    if (friendRequestBtn) {
      friendRequestBtn.addEventListener("click", handleSendFriendRequest);
    }

    // Not implemented yet!!
    const messageBtn = document.getElementById("message-btn");
    if (messageBtn) {
      messageBtn.addEventListener("click", showMessageModal);
    }
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
 * Show change password modal (placeholder)
 * @private
 */
function showChangePasswordModal() {
  // This would open a modal or navigate to a change password page
  showError("Change password functionality coming soon!");
}

/**
 * Show change password modal (placeholder)
 * @private
 */
function showMessageModal() {
  // This would open a modal or navigate to a change password page
  showError("Message functionality coming soon!");
}

/**
 * Show change password modal (placeholder)
 * @private
 */
function handleSendFriendRequest() {
  // This would open a modal or navigate to a change password page
  showError("IMPLEMENT THIS!");
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
