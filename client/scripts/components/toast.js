/**
 * Toast notification component
 * Provides user feedback through temporary notifications
 */

/**
 * Toast types and their corresponding CSS classes
 */
const TOAST_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  INFO: "info",
  WARNING: "warning",
};

/**
 * Display a toast notification
 * @param {string} message - The message to display
 * @param {string} type - Type of toast (success, error, info, warning)
 * @param {number} duration - Duration in milliseconds
 */
export function showToast(message, type = TOAST_TYPES.INFO, duration = 3000) {
  // Remove existing toast to prevent stacking them
  removeExistingToast();

  // Create toast element
  const toast = createToastElement(message, type);

  // Add to DOM with animation
  document.body.appendChild(toast);

  // Trigger animation CSS
  requestAnimationFrame(() => {
    toast.classList.add("toast-show");
  });

  // Auto-remove after duration
  setTimeout(() => {
    removeToast(toast);
  }, duration);
}

/**
 * Show success toast
 * @param {string} message - Success message
 * @param {number} duration - Duration in milliseconds
 */
export function showSuccess(message, duration = 3000) {
  showToast(message, TOAST_TYPES.SUCCESS, duration);
}

/**
 * Show error toast
 * @param {string} message - Error message
 * @param {number} duration - Duration in milliseconds
 */
export function showError(message, duration = 4000) {
  showToast(message, TOAST_TYPES.ERROR, duration);
}

/**
 * Show info toast
 * @param {string} message - Info message
 * @param {number} duration - Duration in milliseconds
 */
export function showInfo(message, duration = 3000) {
  showToast(message, TOAST_TYPES.INFO, duration);
}

/**
 * Show warning toast
 * @param {string} message - Warning message
 * @param {number} duration - Duration in milliseconds
 */
export function showWarning(message, duration = 3500) {
  showToast(message, TOAST_TYPES.WARNING, duration);
}

/**
 * Create toast DOM element
 * @private
 * @param {string} message - Toast message
 * @param {string} type - Toast type
 * @returns {HTMLElement} - Toast element
 */
function createToastElement(message, type) {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  // Add close button for longer messages
  if (message.length > 50) {
    const closeBtn = document.createElement("button");
    closeBtn.className = "toast-close";
    closeBtn.innerHTML = "×";
    closeBtn.onclick = () => removeToast(toast);
    toast.appendChild(closeBtn);
  }

  return toast;
}

/**
 * Remove existing toast from DOM
 * @private
 */
function removeExistingToast() {
  const existingToast = document.querySelector(".toast");
  if (existingToast) {
    removeToast(existingToast);
  }
}

/**
 * Remove toast with animation
 * @private
 * @param {HTMLElement} toast - Toast element to remove
 */
function removeToast(toast) {
  if (!toast || !toast.parentNode) return;

  toast.classList.add("toast-hide");
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300); // Animation duration
}
