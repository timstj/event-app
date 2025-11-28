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
import { initEventPage } from "./pages/eventPage.js";
import { initInviteUsersPage } from "./pages/inviteUsersPage.js";
import { initNavigation } from "./components/navigationBar.js";

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
    return requireAuth();
  }
  return true;
}

/**
 * Initialize page-specific functionality
 */
function initializePages() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const isPublicPage = PUBLIC_PAGES.some((page) => currentPage === page);

  initNavigation();

  // Authentication pages
  if (currentPage === "sign_in.html") {
    initLoginPage();
  } else if (currentPage === "sign_up.html") {
    initRegisterPage();
  }

  // Main application pages (only initialize current page)
  if (!isPublicPage) {
    if (currentPage === "index.html" || currentPage === "") {
      initIndexPage();
    } else if (currentPage === "users.html") {
      initUsersPage();
    } else if (currentPage === "create_event.html") {
      initCreateEventPage();
    } else if (currentPage === "my_events.html") {
      initMyEventsPage();
    } else if (currentPage === "profile.html") {
      initProfilePage();
    } else if (currentPage === "event.html") {
      initEventPage();
    } else if (currentPage === "invite_users.html") {
      initInviteUsersPage();
    }
  }
}

/**
 * Global error handling
 */
function setupGlobalErrorHandling() {
  window.addEventListener("error", (event) => {
    console.error("Global error:", event.error);
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
  });
}

/**
 * Initialize the application
 */
function initApp() {
  const isAuthenticated = checkAuthentication();
  
  if (isAuthenticated !== false) { 
    setupGlobalErrorHandling();
    initializePages();
  }
}

// Start the app
if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}