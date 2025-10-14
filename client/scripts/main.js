// TODO: ADD SECURITY FOR SUBMISSION FORMS ON FRONTEND AND BACKEND

const API_BASE_URL = "http://localhost:5001/api";

//-----------------------------------------------------------------------------
// Helper function for token validation for backend.
//-----------------------------------------------------------------------------
function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  // Clone or create headers object
  const headers = options.headers ? { ...options.headers } : {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  // Merge headers back into options
  return fetch(url, { ...options, headers });
}

//-----------------------------------------------------------------------------
// To ensure user is signed in. Else redirect to sign in page.
// TODO: Check if token is valid and not just if there is a token
//-----------------------------------------------------------------------------
if (
  !window.location.pathname.endsWith("sign_in.html") &&
  !window.location.pathname.endsWith("sign_up.html")
) {
  const token = localStorage.getItem("token");
  if (!token) {
    // Redirect to sign_in.html if not signed in
    window.location.href = "sign_in.html";
  }
}

//-----------------------------------------------------------------------------
// Generic button handling.. Not great
//-----------------------------------------------------------------------------
const siteTitle = document.getElementById("site-title");
// const signInButton = document.getElementById('sign-in-button');
const navButtons = document.querySelectorAll(".nav-btn");
// Initialize button event listeners

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    window.location.href = btn.getAttribute("data-url");
  });
});
if (siteTitle) {
  siteTitle.addEventListener("click", goToHome);
}

//-----------------------------------------------------------------------------
// Sign up page: Sign up form handling
//-----------------------------------------------------------------------------

// Sign up form
const signUpForm = document.getElementById("sign-up-form");

// Create user (sign up)
if (signUpForm) {
  signUpForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevents default form submission

    const first_name = document.getElementById("first_name").value;
    const last_name = document.getElementById("last_name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name, last_name, email, password }),
      });
      const result = await response.json();
      if (response.ok) {
        alert("User registered successfully!");
        window.location.href = "sign_in.html";
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("An error occurred while registering the user.");
    }
  });
}

//-----------------------------------------------------------------------------
// Create event page: Create event form handling
//-----------------------------------------------------------------------------

// Create event form
const createEventForm = document.getElementById("create-event-form");

// Create event
if (createEventForm) {
  createEventForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevents default form submission

    // Get all form values
    const title = document.getElementById("event-title").value;
    const rawdate = document.getElementById("event-date").value;
    const rawtime = document.getElementById("event-time").value;
    const location = document.getElementById("event-location").value;
    const description = document.getElementById("event-description").value;

    // Combine date and time into ISO string to be sent to backend. Stored in UTC format.
    const date = new Date(`${rawdate}T${rawtime}`).toISOString();

    try {
      const response = await authFetch(`${API_BASE_URL}/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          date,
          location,
          description,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        alert("Event created successfully!");
        window.location.href = "index.html";
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("An error occurred while creating the event.");
    }
  });
}

// Function to navigate to index.html (home page)
function goToHome() {
  window.location.href = "index.html";
}

//-----------------------------------------------------------------------------
// Sign in page: Sign in handling
//-----------------------------------------------------------------------------
const signInForm = document.getElementById("sign-in-form");

if (signInForm) {
  signInForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevents default form submission

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (response.ok && result.data && result.data.token) {
        //Store the token for future requests
        localStorage.setItem("token", result.data.token);
        //Store user info
        localStorage.setItem("user", JSON.stringify(result.data.user));
        // Redirect to the homepage
        window.location.href = "index.html";
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.log("Error signing in:", error);
      alert("An error occured while signing in");
    }
  });
}

//-----------------------------------------------------------------------------
// Fetch all usernames and display.
//-----------------------------------------------------------------------------

// Function to fetch and display user names
async function displayUsers() {
  try {
    const response = await authFetch(`${API_BASE_URL}/user`);
    const result = await response.json();

    const users = result.data;

    // Get the logged-in user from localstorage.
    const loggedInUser = JSON.parse(localStorage.getItem("user"));

    let userList = document.getElementById("user-list");
    if (!userList) {
      userList = document.createElement("ul");
      userList.id = "user-list";
      document.body.appendChild(userList);
    }
    userList.innerHTML = ""; // Clear previous list

    // Filter out the logged-in user
    const filteredUsers = users.filter(
      (user) => user.id !== loggedInUser.userId
    );

    filteredUsers.forEach((user) => {
      const li = document.createElement("li");
      li.textContent = `${user.first_name} ${user.last_name}`;
      userList.appendChild(li);
    });
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

if (window.location.pathname.endsWith("users.html")) {
  window.addEventListener("DOMContentLoaded", displayUsers);
}

//-----------------------------------------------------------------------------
// My events page: Fetch and display all events and hosted events
//-----------------------------------------------------------------------------

async function fetchAndDisplayAllEvents() {
  try {
    const response = await authFetch(`${API_BASE_URL}/event`);
    const result = await response.json();

    const events = result.data;

    let eventsList = document.getElementById("events-list");
    if (!eventsList) {
      eventsList = document.createElement("div");
      eventsList.id = "events-list";
      document.body.appendChild(eventsList);
    }
    eventsList.innerHTML = ""; // Clear previous list

    events.forEach((event) => {
      const eventDiv = document.createElement("div");
      eventDiv.className = "event-item";
      const eventDate = new Date(event.date);
      const eventTime = eventDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      eventDiv.innerHTML = `
        <h3>${event.title}</h3>
        <p>Event id: ${event.id}</p>
        <p>Date: ${eventDate.toLocaleDateString()}</p>
        <p>Time: ${eventTime}</p>
        <p>Location: ${event.location}</p>
        <p>Description: ${event.description}</p>
        <button class="delete-event-btn" data-event-id="${
          event.id
        }">Delete Event</button>
      `;
      eventsList.appendChild(eventDiv);
    });

    const deleteEventButtons = document.querySelectorAll(".delete-event-btn");
    deleteEventButtons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const eventId = btn.getAttribute("data-event-id");
        if (confirm("Are you sure you want to delete this event?")) {
          try {
            const response = await authFetch(
              `${API_BASE_URL}/event/${eventId}`,
              {
                method: "DELETE",
              }
            );
            const result = await response.json();
            if (response.ok) {
              alert(`Event with id:${eventId} deleted successfully.`);
              fetchAndDisplayAllEvents(); //Refresh list
            } else {
              alert(`Error: ${result.message}`);
            }
          } catch (error) {
            console.error("Error deleting event:", error);
            alert("An error occured while deleting the event.");
          }
        }
      });
    });
  } catch (error) {
    console.error("Error fetching events:", error);
  }
}

async function fetchAndDisplayHostedEvents() {
  try {
    const response = await authFetch(`${API_BASE_URL}/event/hosted`);
    const result = await response.json();
    const events = result.data;

    const hostedSection = document.getElementById("hosted-events-section");
    const hostedList = document.getElementById("hosted-events-list");
    hostedList.innerHTML = ""; // Clear previous

    if (events && events.length > 0) {
      hostedSection.style.display = "block"; // Show section
      events.forEach((event) => {
        const eventDiv = document.createElement("div");
        eventDiv.className = "event-item";
        const eventDate = new Date(event.date);
        const eventTime = eventDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        eventDiv.innerHTML = `
          <h3>${event.title}</h3>
          <p>Event id: ${event.id}</p>
          <p>Date: ${eventDate.toLocaleDateString()}</p>
          <p>Time: ${eventTime}</p>
          <p>Location: ${event.location}</p>
          <p>Description: ${event.description}</p>
        `;
        hostedList.appendChild(eventDiv);
      });
    } else {
      hostedSection.style.display = "none"; // Hide if no hosted events
    }
  } catch (error) {
    console.error("Error fetching hosted events:", error);
  }
}

// Load and display events only on my_events.html
if (window.location.pathname.endsWith("my_events.html")) {
  window.addEventListener("DOMContentLoaded", () => {
    fetchAndDisplayHostedEvents();
    fetchAndDisplayAllEvents();
  });
}

//-----------------------------------------------------------------------------
// Profile page: Sign out button handling
//-----------------------------------------------------------------------------

const signoutButton = document.getElementById("sign-out-button");

if (signoutButton) {
  signoutButton.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent default navigation
    // Remove token and user info from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Redirect to set url in html
    window.location.href = signoutButton.getAttribute("data-url");
  });
}

//-----------------------------------------------------------------------------
// Profile page: Insert user info dynamically
//-----------------------------------------------------------------------------

if (window.location.pathname.endsWith("profile.html")) {
  document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");
    let user;

    if (slug) {
      // Fetch user by slug from backend
      try {
        const response = await authFetch(`${API_BASE_URL}/user/slug/${slug}`);
        const result = await response.json();
        if (response.ok && result.data) {
          user = result.data;
        } else {
          alert(`Error: ${result.message}`);
          window.location.href = "index.html";
          return;
        }
      } catch (error) {
        console.error("Error fetching user", error);
        alert("Error fetching user profile");
      }
    } else {
      user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        window.location.href = "sign_in.html";
        return;
      }
    }

    const profileHeader = document.querySelector(".profile-header");
    if (profileHeader) {
      const nameElement = document.createElement("h2");
      nameElement.textContent = `${user.first_name} ${user.last_name}`;
      profileHeader.prepend(nameElement);
      // const emailElement = document.createElement("p");
      // emailElement.textContent = `${user.email}`;
      // profileHeader.insertBefore(emailElement, nameElement.nextSibling);
    }
    // Show/hide edit options
    const settingsButton = document.getElementById("settings-button");
    const editProfileButton = document.getElementById("edit-profile-button");
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (slug && (!loggedInUser || loggedInUser.slug !== slug)) {
      // Hide buttons when viewing another user
      if (settingsButton) settingsButton.style.display = "none";
      if (editProfileButton) editProfileButton.style.display = "none";
      if (signoutButton) signoutButton.style.display = "none";
    } else {
      if (settingsButton) settingsButton.style.display = "";
      if (editProfileButton) editProfileButton.style.display = "";
      if (signoutButton) signoutButton.style.display = "";
    }
  });
}
