/**
 * Login page handler
 * Manages sign-in form submission and authentication
 */

import { API_BASE_URL } from "../utils/api.js";
import { saveSession } from "./authUtils.js";
import { showSuccess, showError } from "../components/toast.js";

/**
 * Initialize login page functionality
 */
export function initLoginPage() {
  // Only run on sign-in page
  if (!window.location.pathname.endsWith("sign_in.html")) {
    return;
  }

  const signInForm = document.getElementById("sign-in-form");

  if (!signInForm) {
    console.warn("Sign-in form not found");
    return;
  }

  signInForm.addEventListener("submit", handleLoginSubmit);

  // Setup form validation
  setupFormValidation();
}

/**
 * Handle login form submission
 * @private
 * @param {Event} event - Form submit event
 */
async function handleLoginSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const email = formData.get("email")?.trim();
  const password = formData.get("password");

  // Validate input
  if (!validateLoginInput(email, password)) {
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  try {
    // Show loading state
    submitBtn.textContent = "Signing in...";
    submitBtn.disabled = true;

    // Make login request
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (response.ok && result.data?.token) {
      // Save authentication data
      saveSession(result.data.token, result.data.user);

      showSuccess("Login successful! Redirecting...");

      // Redirect after short delay
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    } else {
      // Handle login failure
      const errorMessage = result.message || "Invalid email or password";
      showError(errorMessage);

      // Clear password field
      form.querySelector('input[name="password"]').value = "";
    }
  } catch (error) {
    console.error("Login error:", error);
    showError("Network error. Please check your connection and try again.");
  } finally {
    // Restore button state
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

/**
 * Validate login input
 * @private
 * @param {string} email - Email input
 * @param {string} password - Password input
 * @returns {boolean} - True if valid
 */
function validateLoginInput(email, password) {
  if (!email || !password) {
    showError("Please fill in all fields");
    return false;
  }

  if (!isValidEmail(email)) {
    showError("Please enter a valid email address");
    return false;
  }

  return true;
}

/**
 * Validate email format
 * @private
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Setup real-time form validation
 * @private
 */
function setupFormValidation() {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  if (emailInput) {
    emailInput.addEventListener("blur", validateEmailField);
    emailInput.addEventListener("input", clearEmailError);
  }

  if (passwordInput) {
    passwordInput.addEventListener("input", clearPasswordError);
  }
}

/**
 * Validate email field on blur
 * @private
 * @param {Event} event - Blur event
 */
function validateEmailField(event) {
  const email = event.target.value.trim();
  const emailInput = event.target;

  if (email && !isValidEmail(email)) {
    emailInput.classList.add("input-error");
    showFieldError(emailInput, "Please enter a valid email address");
  } else {
    clearFieldError(emailInput);
  }
}

/**
 * Clear email field error
 * @private
 * @param {Event} event - Input event
 */
function clearEmailError(event) {
  clearFieldError(event.target);
}

/**
 * Clear password field error
 * @private
 * @param {Event} event - Input event
 */
function clearPasswordError(event) {
  clearFieldError(event.target);
}

/**
 * Show field-specific error
 * @private
 * @param {HTMLElement} field - Input field
 * @param {string} message - Error message
 */
function showFieldError(field, message) {
  // Remove existing error
  clearFieldError(field);

  // Add error styling
  field.classList.add("input-error");

  // Create error message
  const errorDiv = document.createElement("div");
  errorDiv.className = "field-error";
  errorDiv.textContent = message;

  // Insert after field
  field.parentNode.insertBefore(errorDiv, field.nextSibling);
}

/**
 * Clear field-specific error
 * @private
 * @param {HTMLElement} field - Input field
 */
function clearFieldError(field) {
  field.classList.remove("input-error");

  // Remove error message
  const errorDiv = field.parentNode.querySelector(".field-error");
  if (errorDiv) {
    errorDiv.remove();
  }
}
