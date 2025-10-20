/**
 * Main application entry point
 * Handles global setup and page-specific initialization
 */

import { requireAuth } from "./auth/authUtils.js";
import { initLoginPage } from "./auth/loginHandler.js";
import { initUsersPage } from "./pages/usersPage.js";
import { initIndexPage } from "./pages/indexPage.js";
import { initCreateEventPage } from "./pages/createEventPage.js";
import { initMyEventsPage } from "./pages/myEventsPage.js";
import { initProfilePage } from "./pages/profilePage.js";
import { initRegisterPage } from "./auth/registrationHandler.js";
import {
  initNavigation,
  updateNavigationForAuth,
  setActiveNavigation,
} from "./components/navigationBar.js";

/**
 * Pages that don't require authentication
 */
const PUBLIC_PAGES = ["sign_in.html", "sign_up.html"];

/**
 * Check if current page requires authentication
 */
function checkAuthentication() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const isPublicPage = PUBLIC_PAGES.some((page) => currentPage === page);

  if (!isPublicPage) {
    const isAuthenticated = requireAuth();
    updateNavigationForAuth(isAuthenticated);
    return isAuthenticated;
  }
  return true;
}

/**
 * Initialize page-specific functionality
 */
function initializePages() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const isPublicPage = PUBLIC_PAGES.some((page) => currentPage === page);

  if (!isPublicPage) {
    // Init global navigation
    initNavigation();

    // Set active navigation state
    setActiveNavigation(currentPage);
  }
  // Authentication pages
  initLoginPage();
  initRegisterPage();

  // Main application pages (only initialize if not public page)
  if (!isPublicPage) {
    initIndexPage();
    initUsersPage();
    initCreateEventPage();
    initMyEventsPage();
    initProfilePage();
  }
}

/**
 * Global error handling
 */
function setupGlobalErrorHandling() {
  window.addEventListener("error", (event) => {
    console.error("Global error:", event.error);
    // Could send to error reporting service
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
    // Could send to error reporting service
  });
}

/**
 * Initialize the application
 */
function initApp() {
  checkAuthentication();
  setupGlobalErrorHandling();
  initializePages();
}

// Start the application when DOM is ready
document.addEventListener("DOMContentLoaded", initApp);
