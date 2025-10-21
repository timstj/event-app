/**
 * My Events page controller
 * Handles functionality for viewing and managing user's hosted events
 */

import { EventService } from '../services/eventService.js';
import { getLoggedInUser, requireAuth } from '../auth/authUtils.js';
import { renderEventCards, filterAndRenderEvents } from '../components/eventCard.js';
import { showError } from '../components/toast.js';

// Page state
let allMyEvents = [];
let loggedInUserId = null;

/**
 * Initialize my events page
 */
export async function initMyEventsPage() {
  // Only run on my_events.html
  if (!window.location.pathname.endsWith("my_events.html")) {
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
    await loadMyEventsData();

    // Setup page interactions
    setupEventListeners();
    setupSearchFunctionality();

  } catch (error) {
    console.error("Error initializing my events page:", error);
    showError("Failed to load your events. Please refresh.");
  }
}

/**
 * Load user's hosted events
 * @private
 */
async function loadMyEventsData() {
  try {
    showLoadingState();

    const allEvents = await EventService.getAllEvents();
    allMyEvents = allEvents.filter(event => event.host_id === loggedInUserId);

    // Render all events
    const eventsContainer = document.getElementById("my-events-list");
    if (eventsContainer) {
      renderEventCards(allMyEvents, eventsContainer, {
        showActions: true,
        emptyMessage: "You haven't created any events yet. Create your first event to get started!"
      });
    }

    // Update stats
    updateEventStats();

    hideLoadingState();

  } catch (error) {
    console.error("Error loading my events:", error);
    hideLoadingState();
    showError("Failed to load your events. Please refresh the page.");
  }
}

/**
 * Update event statistics display
 * @private
 */
function updateEventStats() {
  const now = new Date();
  
  const totalEvents = allMyEvents.length;
  const upcomingEvents = allMyEvents.filter(event => new Date(event.date) > now).length;
  const pastEvents = totalEvents - upcomingEvents;

  // Update stats display
  const totalStat = document.getElementById("total-events-count");
  const upcomingStat = document.getElementById("upcoming-events-count");
  const pastStat = document.getElementById("past-events-count");

  if (totalStat) totalStat.textContent = totalEvents;
  if (upcomingStat) upcomingStat.textContent = upcomingEvents;
  if (pastStat) pastStat.textContent = pastEvents;
}

/**
 * Setup search functionality
 * @private
 */
function setupSearchFunctionality() {
  const searchInput = document.getElementById("search-my-events");
  
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.trim();
      const eventsContainer = document.getElementById("my-events-list");
      
      if (eventsContainer) {
        filterAndRenderEvents(allMyEvents, eventsContainer, searchTerm, {
          showActions: true,
          emptyMessage: searchTerm 
            ? `No events found matching "${searchTerm}"`
            : "You haven't created any events yet."
        });
      }
    });
  }
}

/**
 * Setup event listeners for page interactions
 * @private
 */
function setupEventListeners() {
  // Listen for event changes
  document.addEventListener('eventDeleted', handleEventDeleted);
  document.addEventListener('eventUpdated', handleEventUpdated);

  // Setup filter buttons
  setupFilterButtons();

  // Setup create event button
  const createBtn = document.getElementById("create-new-event-btn");
  if (createBtn) {
    createBtn.addEventListener("click", () => {
      window.location.href = "create_event.html";
    });
  }
}

/**
 * Setup filter buttons for different event views
 * @private
 */
function setupFilterButtons() {
  const allBtn = document.getElementById("filter-all");
  const upcomingBtn = document.getElementById("filter-upcoming");
  const pastBtn = document.getElementById("filter-past");

  if (allBtn) {
    allBtn.addEventListener("click", () => {
      setActiveFilter(allBtn);
      renderFilteredEvents(allMyEvents);
    });
  }

  if (upcomingBtn) {
    upcomingBtn.addEventListener("click", () => {
      setActiveFilter(upcomingBtn);
      const upcoming = allMyEvents.filter(event => new Date(event.date) > new Date());
      renderFilteredEvents(upcoming);
    });
  }

  if (pastBtn) {
    pastBtn.addEventListener("click", () => {
      setActiveFilter(pastBtn);
      const past = allMyEvents.filter(event => new Date(event.date) <= new Date());
      renderFilteredEvents(past);
    });
  }
}

/**
 * Set active filter button styling
 * @private
 * @param {HTMLElement} activeBtn - The button that was clicked
 */
function setActiveFilter(activeBtn) {
  // Remove active class from all filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Add active class to clicked button
  activeBtn.classList.add('active');
}

/**
 * Render filtered events
 * @private
 * @param {Array} events - Events to render
 */
function renderFilteredEvents(events) {
  const eventsContainer = document.getElementById("my-events-list");
  if (eventsContainer) {
    renderEventCards(events, eventsContainer, {
      showActions: true,
      emptyMessage: "No events found for this filter."
    });
  }
}

/**
 * Handle event deletion
 * @private
 */
async function handleEventDeleted(event) {
  try {
    const deletedEventId = event.detail.eventId;
    allMyEvents = allMyEvents.filter(e => e.id !== deletedEventId);
    
    // Refresh display
    await loadMyEventsData();
  } catch (error) {
    console.error("Error handling event deletion:", error);
  }
}

/**
 * Handle event updates
 * @private
 */
async function handleEventUpdated() {
  try {
    // Refresh events data
    await loadMyEventsData();
  } catch (error) {
    console.error("Error refreshing events after update:", error);
  }
}

/**
 * Show loading state
 * @private
 */
function showLoadingState() {
  const container = document.getElementById("my-events-list");
  if (container) {
    container.innerHTML = '<div class="loading-message">Loading your events...</div>';
  }
}

/**
 * Hide loading state
 * @private
 */
function hideLoadingState() {
  // Loading will be replaced by actual content
}

/**
 * Public method to refresh page data
 */
export async function refreshMyEventsPage() {
  await loadMyEventsData();
}