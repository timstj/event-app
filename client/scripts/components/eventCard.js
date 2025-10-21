/**
 * Event card component
 * Handles rendering and interactions for individual event cards
 */

import { EventService } from '../services/eventService.js';
import { getLoggedInUserId } from '../auth/authUtils.js';
import { showSuccess, showError } from './toast.js';

/**
 * Create and render event cards
 * @param {Array} events - Array of event objects to render
 * @param {HTMLElement} container - Container element to render cards into
 * @param {object} options - Options for rendering (showActions, etc.)
 */
export function renderEventCards(events, container, options = {}) {
  if (!container) {
    console.error("Container element not found for event cards");
    return;
  }

  // Clear existing content
  container.innerHTML = "";

  // Sort events by date (upcoming first)
  const sortedEvents = events.sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  // Render each event card
  sortedEvents.forEach(event => {
    const card = createEventCard(event, options);
    container.appendChild(card);
  });

  // Show message if no events found
  if (sortedEvents.length === 0) {
    const message = document.createElement('p');
    message.textContent = options.emptyMessage || 'No events found.';
    message.className = 'no-events-message';
    container.appendChild(message);
  }
}

/**
 * Create individual event card element
 * @private
 * @param {object} event - Event object
 * @param {object} options - Rendering options
 * @returns {HTMLElement} - Event card element
 */
function createEventCard(event, options) {
  const card = document.createElement("div");
  card.className = "event-card";
  
  // Extract user
  const creatorName = `${event.host_first_name} ${event.host_last_name}`
  console.log(creatorName);
  // Format date
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-SE', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  const formattedTime = eventDate.toLocaleTimeString('en-SE', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Create card content
  card.innerHTML = `
    <div class="event-info">
      <h3 class="event-title">${event.title}</h3>
      <p class="event-description">${event.description || 'No description provided'}</p>
      <div class="event-details">
        <div class="event-date">
          <strong>${formattedDate}</strong>
        </div>
        <div class="event-time">
          <strong>${formattedTime}</strong>
        </div>
        <div class="event-location">
          <strong>${event.location || 'Location TBD'}</strong>
        </div>
        <div class="event-creator">
          <strong>Created by: ${creatorName}</strong>
        </div>
      </div>
    </div>
  `;

  // Add action buttons if requested
  if (options.showActions) {
    const actionsDiv = createEventActions(event);
    card.appendChild(actionsDiv);
  }

  return card;
}

/**
 * Create event action buttons
 * @private
 * @param {object} event - Event object
 * @returns {HTMLElement} - Actions container element
 */
function createEventActions(event) {
  const actionsDiv = document.createElement("div");
  actionsDiv.className = "event-actions";

  const loggedInUserId = getLoggedInUserId();

  // Check if user is host
  const isHost =
    event.host_id === loggedInUserId

  if (isHost) {
    // Host can edit/delete and manage invites
    actionsDiv.innerHTML = `
      <button class="btn-edit-event" data-event-id="${event.id}">
        Edit Event
      </button>
      <button class="btn-manage-invites" data-event-id="${event.id}">
        Manage Invites
      </button>
      <button class="btn-delete-event" data-event-id="${event.id}">
        Delete Event
      </button>
    `;
  } else {
    // Non-hosts can only view details
    actionsDiv.innerHTML = `
      <button class="btn-view-details" data-event-id="${event.id}">
        View Details
      </button>
    `;
  }

  // Setup event listeners
  setupEventActionListeners(actionsDiv, event);

  return actionsDiv;
}

/**
 * Setup event listeners for action buttons
 * @private
 */
function setupEventActionListeners(actionsDiv, event) {
  // Edit event
  const editBtn = actionsDiv.querySelector(".btn-edit-event");
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      window.location.href = `create_event.html?edit=${event.id}`;
    });
  }

  // Manage invites
  const manageBtn = actionsDiv.querySelector(".btn-manage-invites");
  if (manageBtn) {
    manageBtn.addEventListener("click", () => {
      // Navigate to invite management page or open modal
      window.location.href = `event.html?id=${event.id}`;
    });
  }

  // Delete event
  const deleteBtn = actionsDiv.querySelector(".btn-delete-event");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      await handleDeleteEvent(deleteBtn, event.id, event.title);
    });
  }

  // View details
  const viewBtn = actionsDiv.querySelector(".btn-view-details");
  if (viewBtn) {
    viewBtn.addEventListener("click", () => {
      // Navigate to event details page
      window.location.href = `event.html?id=${event.id}`;
    });
  }
}

/**
 * Handle deleting an event
 * @private
 */
async function handleDeleteEvent(button, eventId, eventTitle) {
  const confirmed = confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`);
  
  if (!confirmed) return;

  const originalText = button.textContent;
  
  try {
    button.textContent = "Deleting...";
    button.disabled = true;

    await EventService.deleteEvent(eventId);
    
    showSuccess(`Event "${eventTitle}" deleted successfully.`);

    // Trigger refresh event
    document.dispatchEvent(new CustomEvent('eventDeleted', { 
      detail: { eventId } 
    }));

  } catch (error) {
    console.error("Error deleting event:", error);
    button.textContent = originalText;
    button.disabled = false;
    showError("Failed to delete event. Please try again.");
  }
}

/**
 * Filter and re-render event cards (for search functionality)
 * @param {Array} allEvents - Complete array of events
 * @param {HTMLElement} container - Container element
 * @param {string} searchTerm - Search term to filter by
 * @param {object} options - Rendering options
 */
export function filterAndRenderEvents(allEvents, container, searchTerm, options = {}) {
  const filteredEvents = allEvents.filter(event => {
    const title = event.title.toLowerCase();
    const description = (event.description || '').toLowerCase();
    const location = (event.location || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return title.includes(search) || 
           description.includes(search) || 
           location.includes(search);
  });

  renderEventCards(filteredEvents, container, options);
}