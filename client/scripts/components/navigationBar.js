/**
 * Modern Navigation Bar Component
 * Responsive navigation with hamburger menu for mobile
 */

import { getLoggedInUser } from "../auth/authUtils.js";
import { showSuccess } from "./toast.js";

export class NavigationBar {
  constructor() {
    // Initialize state
    this.currentUser = null;
    this.navElement = null;
    this.mobileMenuOpen = false;
  }

  /**
   * Initialize navigation bar
   */
  init() {
    this.currentUser = getLoggedInUser();
    this.render();
    this.attachEventListeners();
    this.handleResize();
  }

  /**
   * Render navigation bar
   */
  render() {
    // Remove existing nav if present
    const existingNav = document.querySelector(".top-banner");
    if (existingNav) {
      existingNav.remove();
    }

    // Create navigation element
    this.navElement = document.createElement("nav");
    this.navElement.className = "top-banner";
    this.navElement.innerHTML = this.getNavigationHTML();

    // Insert at the top of body
    document.body.insertBefore(this.navElement, document.body.firstChild);
  }

  /**
   * Get navigation HTML based on auth state
   */
  getNavigationHTML() {
    const isAuthenticated = !!this.currentUser;

    if (!isAuthenticated) {
      return this.getGuestNavigation();
    }

    return this.getAuthenticatedNavigation();
  }

  /**
   * Guest navigation (not logged in)
   */
  getGuestNavigation() {
    return `
      <div class="nav-container">
        <div class="nav-brand">
          <h1 id="site-title">Event Site</h1>
        </div>
        
        <div class="nav-auth-buttons">
          <a href="sign_in.html" class="nav-btn nav-btn-secondary">Sign In</a>
          <a href="sign_up.html" class="nav-btn nav-btn-primary">Sign Up</a>
        </div>
      </div>
    `;
  }

  /**
   * Authenticated navigation (logged in)
   */
  getAuthenticatedNavigation() {
    const initials = this.getUserInitials();

    return `
      <div class="nav-container">
        <!-- Mobile Hamburger Button -->
        <button class="hamburger" id="hamburger-btn" aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <!-- Brand/Logo -->
        <div class="nav-brand">
          <h1 id="site-title">Event Site</h1>
        </div>

        <!-- Navigation Links (Desktop) -->
        <div class="nav-links" id="nav-links">
          <a href="create_event.html" class="nav-link">
            <span class="nav-icon">➕</span>
            <span class="nav-text">Create Event</span>
          </a>
          <a href="my_events.html" class="nav-link">
            <span class="nav-icon">📅</span>
            <span class="nav-text">My Events</span>
          </a>
          <a href="users.html" class="nav-link">
            <span class="nav-icon">👥</span>
            <span class="nav-text">Users</span>
          </a>
        </div>

        <!-- Right Side Actions -->
        <div class="nav-actions">
          <div class="nav-search">
            <input 
              type="text" 
              id="search-bar" 
              placeholder="Search events..." 
              aria-label="Search events"
            />
          </div>
          
          <button
            class="nav-profile-btn" 
            id="profile-button"
            title="${this.currentUser.first_name} ${this.currentUser.last_name}"
            aria-label="View profile"
          >
            ${initials}
          </button>

          <button 
            class="nav-btn nav-btn-logout" 
            id="logout-button"
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </div>

      <!-- Mobile Menu Overlay -->
      <div class="mobile-menu" id="mobile-menu">
        <div class="mobile-menu-content">
          <div class="mobile-menu-header">
            <div class="mobile-user-info">
              <div class="mobile-profile-circle">${initials}</div>
              <div class="mobile-user-details">
                <strong>${this.currentUser.first_name} ${this.currentUser.last_name}</strong>
                <span>${this.currentUser.email}</span>
              </div>
            </div>
          </div>
          
          <div class="mobile-menu-links">
            <a href="index.html" class="mobile-menu-link">
              <span class="mobile-menu-icon">🏠</span>
              <span>Home</span>
            </a>
            <a href="create_event.html" class="mobile-menu-link">
              <span class="mobile-menu-icon">➕</span>
              <span>Create Event</span>
            </a>
            <a href="my_events.html" class="mobile-menu-link">
              <span class="mobile-menu-icon">📅</span>
              <span>My Events</span>
            </a>
            <a href="users.html" class="mobile-menu-link">
              <span class="mobile-menu-icon">👥</span>
              <span>Users</span>
            </a>
            <a href="profile.html?slug=${this.currentUser.slug}" class="mobile-menu-link">
              <span class="mobile-menu-icon">👤</span>
              <span>Profile</span>
            </a>
          </div>

          <div class="mobile-menu-footer">
            <button class="mobile-logout-btn" id="mobile-logout-button">
              <span class="mobile-menu-icon">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get user initials for profile button
   */
  getUserInitials() {
    if (!this.currentUser) return "?";

    const firstName = this.currentUser.first_name || "";
    const lastName = this.currentUser.last_name || "";

    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || "U";
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Site title (home link)
    const siteTitle = document.getElementById("site-title");
    if (siteTitle) {
      siteTitle.addEventListener("click", () => {
        window.location.href = "index.html";
      });
    }

    // Profile button
    const profileBtn = document.getElementById("profile-button");
    if (profileBtn) {
      profileBtn.addEventListener("click", () => {
        const userSlug = this.currentUser?.slug;
        if (userSlug) {
          window.location.href = `profile.html?slug=${userSlug}`;
        }
      });
    }

    // Logout buttons (desktop and mobile)
    const logoutBtn = document.getElementById("logout-button");
    const mobileLogoutBtn = document.getElementById("mobile-logout-button");

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.handleLogout());
    }

    if (mobileLogoutBtn) {
      mobileLogoutBtn.addEventListener("click", () => {
        this.closeMobileMenu();
        this.handleLogout();
      });
    }

    // Hamburger menu
    const hamburger = document.getElementById("hamburger-btn");
    if (hamburger) {
      hamburger.addEventListener("click", () => this.toggleMobileMenu());
    }

    // Close mobile menu when clicking overlay
    const mobileMenu = document.getElementById("mobile-menu");
    if (mobileMenu) {
      mobileMenu.addEventListener("click", (e) => {
        if (e.target === mobileMenu) {
          this.closeMobileMenu();
        }
      });
    }

    // Close mobile menu on navigation
    const mobileLinks = document.querySelectorAll(".mobile-menu-link");
    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        this.closeMobileMenu();
      });
    });

    // Search functionality
    this.setupSearch();

    // Handle window resize
    window.addEventListener("resize", () => this.handleResize());
  }

  /**
   * Setup search functionality
   */
  setupSearch() {
    const searchBar = document.getElementById("search-bar");
    if (searchBar) {
      searchBar.addEventListener("input", (e) => {
        const searchTerm = e.target.value.trim();
        this.handleSearch(searchTerm);
      });
    }
  }

  /**
   * Handle search
   */
  handleSearch(searchTerm) {
    // Dispatch custom event that the page can listen to
    const event = new CustomEvent("navbarSearch", {
      detail: { searchTerm },
    });
    document.dispatchEvent(event);
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;

    const hamburger = document.getElementById("hamburger-btn");
    const mobileMenu = document.getElementById("mobile-menu");

    if (this.mobileMenuOpen) {
      hamburger?.classList.add("active");
      mobileMenu?.classList.add("active");
      document.body.style.overflow = "hidden";
    } else {
      this.closeMobileMenu();
    }
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu() {
    this.mobileMenuOpen = false;

    const hamburger = document.getElementById("hamburger-btn");
    const mobileMenu = document.getElementById("mobile-menu");

    hamburger?.classList.remove("active");
    mobileMenu?.classList.remove("active");
    document.body.style.overflow = "";
  }

  /**
   * Handle window resize
   */
  handleResize() {
    if (window.innerWidth > 768 && this.mobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  /**
   * Handle logout
   */
  handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    showSuccess("Logged out successfully");

    setTimeout(() => {
      window.location.href = "sign_in.html";
    }, 1000);
  }

  /**
   * Update navigation
   */
  update() {
    this.currentUser = getLoggedInUser();
    this.render();
    this.attachEventListeners();
  }
}

// Create singleton instance
const navigationBar = new NavigationBar();

// Export
export default navigationBar;

export function initNavigation() {
  navigationBar.init();
}

export function updateNavigation() {
  navigationBar.update();
}
