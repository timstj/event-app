/**
 * Navigation component
 * Handles global navigation functionality across all pages
 */
import { getLoggedInUser, logout } from '../auth/authUtils.js';
import { showSuccess } from './toast.js';

/**
 * Initialize navigation for all pages
 */
export function initNavigation() {
  setupNavigationButtons();
  updateProfileButton();
}

/**
 * Setup navigation button event listeners
 * @private
 */
function setupNavigationButtons() {
  // Create Event button
  const createEventBtn = document.getElementById("create-event-button");
  if (createEventBtn) {
    createEventBtn.addEventListener("click", (e) => {
      e.preventDefault();
      navigateToPage("create_event.html");
    });
  }

  // My Events button
  const myEventsBtn = document.getElementById("my-events-button");
  if (myEventsBtn) {
    myEventsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      navigateToPage("my_events.html");
    });
  }

  // Users button
  const usersBtn = document.getElementById("users-button");
  if (usersBtn) {
    usersBtn.addEventListener("click", (e) => {
      e.preventDefault();
      navigateToPage("users.html");
    });
  }

  // Profile button
  const profileBtn = document.getElementById("profile-button");
  if (profileBtn) {
    profileBtn.addEventListener("click", (e) => {
      e.preventDefault();
      navigateToProfile();
    });
  }

  // Site title (home link)
  const siteTitle = document.getElementById("site-title");
  if (siteTitle) {
    siteTitle.addEventListener("click", (e) => {
      e.preventDefault();
      navigateToPage("index.html");
    });
    siteTitle.style.cursor = "pointer";
  }

  // Search functionality
  setupGlobalSearch();
}

/**
 * Navigate to a specific page
 * @private
 */
function navigateToPage(page) {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  if (currentPage === page) {
    return; // Already on this page
  }

  window.location.href = page;
}

/**
 * Navigate to profile page
 * @private
 */
function navigateToProfile() {
  const currentUser = getLoggedInUser();
  
  if (currentUser && currentUser.slug) {
    navigateToPage(`profile.html?slug=${currentUser.slug}`);
  } else {
    navigateToPage("profile.html");
  }
}

/**
 * Update profile button with user info
 * @private
 */
function updateProfileButton() {
  const profileBtn = document.getElementById("profile-button");
  const currentUser = getLoggedInUser();
  
  if (profileBtn && currentUser) {
    const initial = getUserInitial(currentUser);
    profileBtn.textContent = initial;
    profileBtn.title = `Profile (${currentUser.email})`;
    profileBtn.classList.add('profile-btn-active');
  }
}

/**
 * Get user initial for profile button
 * @private
 */
function getUserInitial(user) {
  if (user.first_name) {
    return user.first_name.charAt(0).toUpperCase();
  }
  if (user.email) {
    return user.email.charAt(0).toUpperCase();
  }
  return 'U';
}

/**
 * Setup global search functionality
 * @private
 */
function setupGlobalSearch() {
  const searchBar = document.getElementById("search-bar");
  
  if (searchBar) {
    searchBar.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const searchTerm = searchBar.value.trim();
        if (searchTerm) {
          handleGlobalSearch(searchTerm);
        }
      }
    });
  }
}

/**
 * Handle global search
 * @private
 */
function handleGlobalSearch(searchTerm) {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  if (currentPage === 'index.html') {
    // Trigger local search on homepage
    const event = new CustomEvent('globalSearch', { 
      detail: { searchTerm } 
    });
    document.dispatchEvent(event);
  } else {
    // Navigate to search results
    window.location.href = `index.html?search=${encodeURIComponent(searchTerm)}`;
  }
}

/**
 * Update active navigation state
 */
export function setActiveNavigation(activePage) {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('nav-active');
  });

  const activeBtn = document.querySelector(`[data-page="${activePage}"]`);
  if (activeBtn) {
    activeBtn.classList.add('nav-active');
  }
}

/**
 * Show/hide navigation based on auth state
 */
export function updateNavigationForAuth(isAuthenticated) {
  const navButtons = document.querySelectorAll('.nav-btn');
  const searchBar = document.getElementById('search-bar');
  
  navButtons.forEach(btn => {
    btn.style.display = isAuthenticated ? 'block' : 'none';
  });
  
  if (searchBar) {
    searchBar.style.display = isAuthenticated ? 'block' : 'none';
  }
}