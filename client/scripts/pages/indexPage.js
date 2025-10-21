/**
 * Index page controller
 * Handles functionality for the main dashboard/home page
 */

import { EventService } from "../services/eventService.js";
import { getLoggedInUser, requireAuth } from "../auth/authUtils.js";
import { renderEventCards } from "../components/eventCard.js";
import { showError } from "../components/toast.js";

// Page state
let allEvents = [];
let hostedEvents = [];
let loggedInUserId = null;

/**
 * Initialize index page
 */
export async function initIndexPage() {
  // Only run on index.html
  if (
    !window.location.pathname.endsWith("index.html") &&
    window.location.pathname !== "/" &&
    !window.location.pathname.endsWith("/")
  ) {
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
    await loadEventsData();

    // Setup page interactions
    setupEventListeners();
  } catch (error) {
    console.error("Error initializing index page:", error);
    showError("Failed to load dashboard. Please refresh.");
  }
}

/**
 * Load events data
 * @private
 */
async function loadEventsData() {
  try {
    // Load both all events and hosted events in parallel

    allEvents = await EventService.getAllEvents();
    console.log(allEvents);

    hostedEvents = allEvents.filter(
      (event) => event.host_id === loggedInUserId
    );

    console.log("All events:", allEvents);
    console.log("Hosted events:", hostedEvents);
    // Render upcoming events (from all events)
    const upcomingEventsContainer = document.getElementById("upcoming-events");
    if (upcomingEventsContainer) {
      const upcomingEvents = getUpcomingEvents(allEvents);
      renderEventCards(upcomingEvents, upcomingEventsContainer, {
        showActions: true,
        emptyMessage: "No upcoming events found.",
      });
    }

    // Render my hosted events (preview - first 3)
    const myEventsContainer = document.getElementById("my-events-preview");
    if (myEventsContainer) {
      renderEventCards(hostedEvents.slice(0, 3), myEventsContainer, {
        showActions: false,
        emptyMessage: "You haven't created any events yet.",
      });
    }
  } catch (error) {
    console.error("Error loading events data:", error);
    showError("Failed to load events. Please refresh the page.");
  }
}

/**
 * Get upcoming events (next 7 days)
 * @private
 * @param {Array} events - All events
 * @returns {Array} - Filtered upcoming events
 */
function getUpcomingEvents(events) {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return eventDate >= now && eventDate <= nextWeek;
  });
}

/**
 * Setup event listeners for page interactions
 * @private
 */
function setupEventListeners() {
  // Listen for event changes (remove join/leave events since they don't exist)
  document.addEventListener("eventDeleted", handleEventDeleted);
  document.addEventListener("eventUpdated", handleEventUpdated);
  document.addEventListener("eventCreated", handleEventCreated);

  // Setup navigation buttons
  setupNavigationButtons();
}

/**
 * Handle event creation
 * @private
 */
async function handleEventCreated() {
  try {
    // Refresh events data
    await loadEventsData();
  } catch (error) {
    console.error("Error refreshing events after creation:", error);
  }
}

/**
 * Handle event updates
 * @private
 */
async function handleEventUpdated() {
  try {
    // Refresh events data
    await loadEventsData();
  } catch (error) {
    console.error("Error refreshing events after update:", error);
  }
}

/**
 * Handle event deletion
 * @private
 * @param {CustomEvent} event - Custom event with deleted event details
 */
async function handleEventDeleted(event) {
  try {
    // Remove deleted event from local state
    const deletedEventId = event.detail.eventId;
    allEvents = allEvents.filter((e) => e.id !== deletedEventId);
    hostedEvents = hostedEvents.filter((e) => e.id !== deletedEventId);

    // Refresh display
    await loadEventsData();
  } catch (error) {
    console.error("Error handling event deletion:", error);
  }
}

/**
 * Setup navigation buttons
 * @private
 */
function setupNavigationButtons() {
  // Create Event button
  const createEventBtn = document.getElementById("create-event-button");
  if (createEventBtn) {
    createEventBtn.addEventListener("click", () => {
      window.location.href = "create_event.html";
    });
  }

  // My Events button
  const myEventsBtn = document.getElementById("my-events-button");
  if (myEventsBtn) {
    myEventsBtn.addEventListener("click", () => {
      window.location.href = "my_events.html";
    });
  }

  // Users button
  const usersBtn = document.getElementById("users-button");
  if (usersBtn) {
    usersBtn.addEventListener("click", () => {
      window.location.href = "users.html";
    });
  }

  // Profile button (if exists)
  const profileBtn = document.getElementById("profile-button");
  if (profileBtn) {
    profileBtn.addEventListener("click", () => {
      const currentUser = getLoggedInUser();
      if (currentUser && currentUser.slug) {
        window.location.href = `profile.html?slug=${currentUser.slug}`;
      } else {
        window.location.href = "profile.html";
      }
    });
  }
}

/**
 * Public method to refresh page data
 */
export async function refreshIndexPage() {
  await loadEventsData();
}
