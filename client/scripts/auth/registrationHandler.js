/**
 * Registration page handler
 * Manages sign-up form submission and user registration
 */

import { API_BASE_URL } from "../utils/api.js";
import { showSuccess, showError } from "../components/toast.js";

/**
 * Initialize registration page functionality
 */
export function initRegisterPage() {
  // To only run on sign-up page
  if (!window.location.pathname.endsWith("sign_up.html")) {
    return;
  }
  const signUpForm = document.getElementById("sign-up-form");
  if (!signUpForm) {
    console.warn("Sign up form not found");
    return;
  }

  signUpForm.addEventListener("submit", handleRegisterSubmit);
  setupFormValidation();
}

/**
 * Handle registration form submission
 * @private
 */
async function handleRegisterSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const userData = {
    // .? to return undefined instead of error if field is empty or does not exist
    firstName: formData.get("first_name")?.trim(),
    lastName: formData.get("last_name")?.trim(),
    email: formData.get("email")?.trim(),
    password: formData.get("password")?.trim(),
    confirmPassword: formData.get("confirm_password")?.trim(),
  };

  if (!validateRegisterInput(userData)) {
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  try {
    submitBtn.textContent = "Creating account";
    submitBtn.disabled = true;

    // Make registration request
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        password: userData.password,
      })
    });

    const result = await response.json();

    if (response.ok) {
        showSuccess("Account created successfully! Please sign in");
        // Redirect to let user sign in
        setTimeout(() => {
            window.location.href = "sign_in.html";
        }, 1000);
    } else {
        const errorMessage = result.message || "Registration failed";
        showError(errorMessage);
    }
  } catch (error) {
    console.error("Registration error:", error);
    showError("Error. Please try again");
  } finally {
    // To restore button regardles of fail or success.
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

/**
 * Validate registration input
 * @private
 */
function validateRegisterInput({
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
}) {
  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    showError("Please fill in all fields");
    return false;
  }

  if (!isValidEmail(email)) {
    showError("Please enter a valid email address");
    return false;
  }

  // Password must be longer than 6 chars. TODO: add stricter password rules
  if (password.length < 6) {
    showError("Password must be at least 6 characters long");
    return false;
  }

  if (password !== confirmPassword) {
    showError("Passwords do not match");
    return false;
  }

  return true;
}

/**
 * Validate email format
 * @private
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Setup form validation
 * @private
 */
function setupFormValidation() {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm_password");

  if (emailInput) {
    emailInput.addEventListener("blur", validateEmailField);
  }

  if (passwordInput && confirmPasswordInput) {
    confirmPasswordInput.addEventListener("blur", validatePasswordMatch);
  }
}

function validateEmailField(event) {
  const email = event.target.value.trim();
  if (email && !isValidEmail(email)) {
    showError("Please enter a valid email address");
  }
}

function validatePasswordMatch(event) {
  const confirmPassword = event.target.value;
  const password = document.getElementById("password")?.value;

  if (confirmPassword && password !== confirmPassword) {
    showError("Passwords do not match");
  }
}
