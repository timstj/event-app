/**
 * Event details page
 * Handles displaying individual event details and invitation interactions
 */

import { EventService } from "../services/eventService.js";
import { getLoggedInUser } from "../auth/authUtils.js";
import { showSuccess, showError } from "../components/toast.js";

let currentEvent = null;
let loggedInUser = null;
let currentInvitation = null;

/**
 * Initialize event page
 */
export function initEventPage() {
  // Only run on event.html - be more specific
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split("/").pop() || "";
  // Only run on event.html
  if (currentPage !== "event.html") {
    return;
  }

  loggedInUser = getLoggedInUser();
  if (!loggedInUser) {
    window.location.href = "sign_in.html";
    return;
  }

  loadEventDetails();
  setupEventListeners();
}

/**
 * Load and display event details
 */
async function loadEventDetails() {
  const loadingSpinner = document.getElementById("loading-spinner");
  const errorMessage = document.getElementById("error-message");
  const eventContent = document.getElementById("event-content");

  try {
    // Get event ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get("id");

    if (!eventId) {
      throw new Error("No event ID provided");
    }

    // Show loading state
    loadingSpinner.style.display = "block";
    errorMessage.style.display = "none";
    eventContent.style.display = "none";

    // Fetch event details
    currentEvent = await EventService.getEventById(eventId);

    if (!currentEvent) {
      throw new Error("Event not found");
    }

    // Populate event details
    populateEventDetails(currentEvent);

    // Load invitation status and attendees
    await Promise.all([
      loadInvitationStatus(eventId),
      loadEventAttendees(eventId),
    ]);

    // Show content
    loadingSpinner.style.display = "none";
    eventContent.style.display = "block";
  } catch (error) {
    console.error("Error loading event:", error);
    loadingSpinner.style.display = "none";
    errorMessage.style.display = "block";
    showError("Failed to load event details");
  }
}

/**
 * Populate event details in the DOM
 * @param {object} event - Event object
 */
function populateEventDetails(event) {
  // Update page title
  document.title = `${event.title} - Event App`;

  // Event header
  document.getElementById("event-title").textContent = event.title;
  document.getElementById("event-date").textContent = formatEventDate(
    event.date
  );
  document.getElementById("event-location").textContent = event.location;

  // Handle organizer info - check if it's from the join query or separate fields
  const organizerElement = document
    .getElementById("event-organizer")
    .querySelector("span");
  if (event.host_first_name && event.host_last_name) {
    organizerElement.textContent = `${event.host_first_name} ${event.host_last_name}`;
  } else {
    organizerElement.textContent = "Unknown";
  }

  // Show edit button if current user is the host
  const editBtn = document.getElementById("edit-btn");
  if (editBtn && event.host_id === loggedInUser.userId) {
    editBtn.style.display = "block";
    editBtn.onclick = () => {
      window.location.href = `create_event.html?edit=${currentEvent.id}`;
    };
  }
  const invBtn = document.getElementById("invite-btn");
  if (invBtn && event.host_id === loggedInUser.userId) {
    invBtn.style.display = "block";
    invBtn.onclick = () => {
      window.location.href = `invite_users.html?eventId=${currentEvent.id}`;
    };
  }
  // Event details
  document.getElementById("event-description-text").textContent =
    event.description || "No description provided.";
  document.getElementById("event-datetime").textContent = formatEventDateTime(
    event.date
  );
  document.getElementById("event-location-full").textContent = event.location;
}

/**
 * Load user's invitation status
 * @param {number} eventId - Event ID
 */
async function loadInvitationStatus(eventId) {
  try {
    currentInvitation = await EventService.getInvitationStatus(eventId);

    setupInvitationButtons();
  } catch (error) {
    console.error("Error loading invitation status:", error);
    // If no invitation, user can't respond (they weren't invited)
    hideInvitationButtons();
  }
}

/**
 * Setup invitation response buttons based on current status
 */
function setupInvitationButtons() {
  const invitationButtons = document.getElementById("invitation-buttons");
  const currentStatus = document.getElementById("current-status");
  const statusText = document.getElementById("status-text");

  if (!currentInvitation) {
    // User not invited - hide buttons
    invitationButtons.style.display = "none";
    currentStatus.style.display = "none";
    return;
  }

  if (currentInvitation.status === "pending") {
    // Show response buttons
    invitationButtons.style.display = "flex";
    currentStatus.style.display = "none";
  } else {
    // Show current status with change option
    invitationButtons.style.display = "none";
    currentStatus.style.display = "block";
    statusText.textContent = currentInvitation.status;
    statusText.className = `status-${currentInvitation.status}`;
  }

  disableCurrentResponseButton();

  // Setup button event listeners
  document.getElementById("accept-btn").onclick = () =>
    updateInvitationStatus("accepted");
  document.getElementById("maybe-btn").onclick = () =>
    updateInvitationStatus("maybe");
  document.getElementById("decline-btn").onclick = () =>
    updateInvitationStatus("declined");
  document.getElementById("change-response-btn").onclick = showResponseButtons;
}

/**
 * Hide invitation buttons (user not invited)
 */
function hideInvitationButtons() {
  document.getElementById("invitation-buttons").style.display = "none";
  document.getElementById("current-status").style.display = "none";
}

/**
 * Show response buttons (for changing response)
 */
function showResponseButtons() {
  document.getElementById("invitation-buttons").style.display = "flex";
  document.getElementById("current-status").style.display = "none";

  disableCurrentResponseButton();
}

/**
 * ✅ NEW: Simple function to disable current response button
 */
function disableCurrentResponseButton() {
  // Reset all buttons first
  const acceptBtn = document.getElementById("accept-btn");
  const maybeBtn = document.getElementById("maybe-btn");
  const declineBtn = document.getElementById("decline-btn");
  
  // Enable all buttons and reset text
  acceptBtn.disabled = false;
  acceptBtn.style.display = "block";
  maybeBtn.disabled = false;
  maybeBtn.style.display = "block";
  declineBtn.disabled = false;
  declineBtn.style.display = "block";

  // Disable the button matching current status
  if (currentInvitation && currentInvitation.status !== "pending") {
    switch (currentInvitation.status) {
      case "accepted":
        acceptBtn.disabled = true;
        acceptBtn.style.display = "none";
        break;
      case "maybe":
        maybeBtn.disabled = true;
        maybeBtn.style.display = "none";
        break;
      case "declined":
        declineBtn.disabled = true;
        declineBtn.style.display = "none";
        break;
    }
  }
}

/**
 * Update invitation status
 * @param {string} status - New status (accepted/maybe/declined)
 */
async function updateInvitationStatus(status) {

  // Simple check: prevent updating to same status
  if (currentInvitation && currentInvitation.status === status) {
    showError(`You have already ${status} this invitation`);
    return;
  }
  
  const buttons = document.querySelectorAll("#invitation-buttons button");

  try {
    // Disable buttons during update
    buttons.forEach((btn) => (btn.disabled = true));

    await EventService.updateInvitationStatus(
      currentEvent.id,
      loggedInUser.userId,
      status
    );

    // Update current invitation object
    currentInvitation.status = status;

    // Show success message
    showSuccess(`Response updated to: ${status}`);

    // Update UI
    setupInvitationButtons();

    // Reload attendees to reflect changes
    await loadEventAttendees(currentEvent.id);
  } catch (error) {
    console.error("Error updating invitation status:", error);
    showError(`Failed to update response`);
  } finally {
    // Re-enable buttons
    buttons.forEach((btn) => (btn.disabled = false));
  }
}

/**
 * Load and display event attendees
 * @param {number} eventId - Event ID
 */
async function loadEventAttendees(eventId) {
  try {
    // Load all attendees
    const allAttendees = await EventService.getEventAttendees(eventId);

    // Separate by status
    const pending = allAttendees.filter((a) => a.status === "pending")
    const accepted = allAttendees.filter((a) => a.status === "accepted");
    const maybe = allAttendees.filter((a) => a.status === "maybe");
    const declined = allAttendees.filter((a) => a.status === "declined");

    // Update counts
    document.getElementById("invited-count").textContent = pending.length;
    document.getElementById("accepted-count").textContent = accepted.length;
    document.getElementById("maybe-count").textContent = maybe.length;
    document.getElementById("declined-count").textContent = declined.length;
    document.getElementById(
      "event-attendees-count"
    ).textContent = `${accepted.length} attending`;
    document.getElementById(
      "event-maybe-count"
    ).textContent = `${maybe.length} maybe`;

    // Render attendee lists
    renderAttendeeList("invited-attendees", pending);
    renderAttendeeList("accepted-attendees", accepted);
    renderAttendeeList("maybe-attendees", maybe);
    renderAttendeeList("declined-attendees", declined);
  } catch (error) {
    console.error("Error loading attendees:", error);
    document.getElementById("event-attendees-count").textContent =
      "Unable to load";
    document.getElementById("event-maybe-count").textContent = "Unable to load";
  }
}

/**
 * Render attendee list
 * @param {string} containerId - Container element ID
 * @param {Array} attendees - Array of attendee objects
 */
function renderAttendeeList(containerId, attendees) {
  const container = document.getElementById(containerId);

  if (attendees.length === 0) {
    container.innerHTML = `<div class="no-attendees"><p>No one yet</p></div>`;
    return;
  }

  container.innerHTML = "";
  attendees.forEach((attendee) => {
    const card = createAttendeeCard(attendee);
    container.appendChild(card);
  });
}

/**
 * Create attendee card element
 * @param {object} attendee - Attendee object
 * @returns {HTMLElement} - Attendee card element
 */
function createAttendeeCard(attendee) {
  const card = document.createElement("div");
  card.className = "attendee-card";

  card.innerHTML = `
    <div class="attendee-info">
      <h4>${attendee.first_name} ${attendee.last_name}</h4>
      <p>${attendee.email}</p>
    </div>
  `;

  // Add click handler to view profile
  card.addEventListener("click", () => {
    if (attendee.slug) {
      window.location.href = `profile.html?slug=${attendee.slug}`;
    }
  });

  return card;
}

/**
 * Setup additional event listeners
 */
function setupEventListeners() {
  // Collapsed sections toggle
  const declinedHeader = document.getElementById("declined-header");
  const declinedAttendees = document.getElementById("declined-attendees");

  declinedHeader.addEventListener("click", () => {
    const isVisible = declinedAttendees.style.display !== "none";
    declinedAttendees.style.display = isVisible ? "none" : "block";
    declinedHeader.classList.toggle("expanded", !isVisible);
  });
}

/**
 * Format event date for display
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
function formatEventDate(dateString) {
  const date = new Date(dateString);
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-SE", options);
}

/**
 * Format event date and time for display
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date and time
 */
function formatEventDateTime(dateString) {
  const date = new Date(dateString);
  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };

  const formattedDate = date.toLocaleDateString("en-SE", dateOptions);
  const formattedTime = date.toLocaleTimeString("en-SE", timeOptions);

  return `${formattedDate} at ${formattedTime}`;
}
