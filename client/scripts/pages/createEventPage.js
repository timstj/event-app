/**
 * Create Event page controller
 * Handles event creation and editing functionality
 */

import { EventService } from "../services/eventService.js";
import { getLoggedInUser, requireAuth } from "../auth/authUtils.js";
import { showSuccess, showError } from "../components/toast.js";

// Page state
let isEditMode = false;
let editingEventId = null;
let loggedInUserId = null;

/**
 * Initialize create event page
 */
export async function initCreateEventPage() {
  // Only run on create_event.html
  if (!window.location.pathname.endsWith("create_event.html")) {
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

    // Check if editing existing event
    checkEditMode();

    // Setup form handling
    setupEventForm();
  } catch (error) {
    console.error("Error initializing create event page:", error);
    showError("Failed to load page. Please refresh.");
  }
}

/**
 * Check if we're in edit mode based on URL parameters
 * @private
 */
function checkEditMode() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("edit");

  if (eventId) {
    isEditMode = true;
    editingEventId = parseInt(eventId);
    loadEventForEditing(editingEventId);

    // Update page title
    const pageTitle = document.querySelector("h1, h2");
    if (pageTitle) {
      pageTitle.textContent = "Edit Event";
    }

    // Update submit button text
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.textContent = "Update Event";
    }
  }
}

/**
 * Load event data for editing
 * @private
 * @param {number} eventId - Event ID to load
 */
async function loadEventForEditing(eventId) {
  try {
    const event = await EventService.getEventById(eventId);

    // Populate form fields
    populateForm(event);
  } catch (error) {
    console.error("Error loading event for editing:", error);
    showError("Failed to load event data. Redirecting to create mode.");

    // Remove edit parameter and reload
    window.location.href = "create_event.html";
  }
}

/**
 * Populate form with event data
 * @private
 * @param {object} event - Event object
 */
function populateForm(event) {
  // Get form elements
  const titleInput = document.getElementById("event-title");
  const descriptionInput = document.getElementById("event-description");
  const dateInput = document.getElementById("event-date");
  const timeInput = document.getElementById("event-time");
  const locationInput = document.getElementById("event-location");

  // Populate fields
  if (titleInput) titleInput.value = event.title || "";
  if (descriptionInput) descriptionInput.value = event.description || "";
  if (locationInput) locationInput.value = event.location || "";

  // Handle date/time (convert from datetime string)
  if (event.date) {
    const eventDate = new Date(event.date);

    if (dateInput) {
      dateInput.value = eventDate.toISOString().split("T")[0];
    }

    if (timeInput) {
      const hours = eventDate.getHours().toString().padStart(2, "0");
      const minutes = eventDate.getMinutes().toString().padStart(2, "0");
      timeInput.value = `${hours}:${minutes}`;
    }
  }
}

/**
 * Setup event form handling
 * @private
 */
function setupEventForm() {
  const eventForm = document.getElementById("create-event-form");

  if (!eventForm) {
    console.warn("Event form not found");
    return;
  }

  eventForm.addEventListener("submit", handleFormSubmit);

  // Setup form validation
  setupFormValidation();

  // Setup cancel button
  setupCancelButton();
}

/**
 * Handle form submission
 * @private
 * @param {Event} event - Form submit event
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  // Extract form data
  const eventData = {
    title: formData.get("title")?.trim(),
    description: formData.get("description")?.trim(),
    date: formData.get("date"),
    time: formData.get("time"),
    location: formData.get("location")?.trim(),
    creator_id: loggedInUserId,
  };

  // Validate input
  if (!validateEventInput(eventData)) {
    return;
  }

  // Combine date and time
  const datetime = combineDateAndTime(eventData.date, eventData.time);
  if (!datetime) {
    showError("Invalid date or time provided");
    return;
  }

  eventData.date = datetime;
  delete eventData.time; // Remove separate time field

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  try {
    // Show loading state
    submitBtn.textContent = isEditMode ? "Updating..." : "Creating...";
    submitBtn.disabled = true;

    let result;
    if (isEditMode) {
      result = await EventService.updateEvent(editingEventId, eventData);
      showSuccess("Event updated successfully!");
    } else {
      result = await EventService.createEvent(eventData);
      showSuccess("Event created successfully!");
    }

    // Redirect after success
    setTimeout(() => {
      window.location.href = "my_events.html";
    }, 1500);
  } catch (error) {
    console.error("Error saving event:", error);
    const action = isEditMode ? "update" : "create";
    showError(`Failed to ${action} event. Please try again.`);
  } finally {
    // Restore button state
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

/**
 * Setup cancel button functionality
 * @private
 */
function setupCancelButton() {
  const cancelBtn = document.getElementById("cancel-button");

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      const confirmed = confirm(
        "Are you sure you want to cancel? Any unsaved changes will be lost."
      );

      if (confirmed) {
        // Go back to previous page or my events
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = "my_events.html";
        }
      }
    });
  }
}

/**
 * Validate event input data
 * @private
 * @param {object} eventData - Event data to validate
 * @returns {boolean} - True if valid
 */
function validateEventInput(eventData) {
  if (!eventData.title) {
    showError("Event title is required");
    return false;
  }

  if (!eventData.date) {
    showError("Event date is required");
    return false;
  }

  if (!eventData.time) {
    showError("Event time is required");
    return false;
  }

  // Check if date is in the future
  const eventDateTime = combineDateAndTime(eventData.date, eventData.time);
  if (eventDateTime && eventDateTime <= new Date()) {
    showError("Event date must be in the future");
    return false;
  }

  return true;
}

/**
 * Combine date and time strings into a Date object
 * @private
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @param {string} timeStr - Time string (HH:MM)
 * @returns {Date|null} - Combined datetime or null if invalid
 */
function combineDateAndTime(dateStr, timeStr) {
  try {
    const datetime = new Date(`${dateStr}T${timeStr}:00`);
    return isNaN(datetime.getTime()) ? null : datetime;
  } catch (error) {
    return null;
  }
}

/**
 * Setup real-time form validation
 * @private
 */
function setupFormValidation() {
  const titleInput = document.getElementById("event-title");
  const dateInput = document.getElementById("event-date");
  const timeInput = document.getElementById("event-time");

  if (titleInput) {
    titleInput.addEventListener("blur", validateTitleField);
  }

  if (dateInput) {
    dateInput.addEventListener("change", validateDateField);
  }

  if (timeInput) {
    timeInput.addEventListener("change", validateTimeField);
  }
}

/**
 * Validate title field
 * @private
 */
function validateTitleField(event) {
  const title = event.target.value.trim();

  if (!title) {
    showFieldError(event.target, "Event title is required");
  } else {
    clearFieldError(event.target);
  }
}

/**
 * Validate date field
 * @private
 */
function validateDateField(event) {
  const date = event.target.value;
  const timeInput = document.getElementById("event-time");

  if (!date) {
    showFieldError(event.target, "Event date is required");
    return;
  }

  // Check if date is in the future (only if time is also provided)
  if (timeInput && timeInput.value) {
    const datetime = combineDateAndTime(date, timeInput.value);
    if (datetime && datetime <= new Date()) {
      showFieldError(event.target, "Event must be scheduled for the future");
      return;
    }
  }

  clearFieldError(event.target);
}

/**
 * Validate time field
 * @private
 */
function validateTimeField(event) {
  const time = event.target.value;
  const dateInput = document.getElementById("event-date");

  if (!time) {
    showFieldError(event.target, "Event time is required");
    return;
  }

  // Check if datetime is in the future (only if date is also provided)
  if (dateInput && dateInput.value) {
    const datetime = combineDateAndTime(dateInput.value, time);
    if (datetime && datetime <= new Date()) {
      showFieldError(event.target, "Event must be scheduled for the future");
      return;
    }
  }

  clearFieldError(event.target);
}

/**
 * Show field-specific error
 * @private
 * @param {HTMLElement} field - Input field
 * @param {string} message - Error message
 */
function showFieldError(field, message) {
  clearFieldError(field);

  field.classList.add("input-error");

  const errorDiv = document.createElement("div");
  errorDiv.className = "field-error";
  errorDiv.textContent = message;

  field.parentNode.insertBefore(errorDiv, field.nextSibling);
}

/**
 * Clear field-specific error
 * @private
 * @param {HTMLElement} field - Input field
 */
function clearFieldError(field) {
  field.classList.remove("input-error");

  const errorDiv = field.parentNode.querySelector(".field-error");
  if (errorDiv) {
    errorDiv.remove();
  }
}
