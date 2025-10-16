const API_BASE_URL = "http://localhost:5001/api";

async function fetchAllUsers() {
  const res = await fetch(`${API_BASE_URL}/user`);
  const data = await res.json();
  return data.data || [];
}

async function fetchAllEvents() {
  const res = await fetch(`${API_BASE_URL}/event`);
  const data = await res.json();
  return data.data || [];
}

async function deleteUser(userId) {
  if (!confirm("Delete this user?")) return;
  const res = await fetch(`${API_BASE_URL}/user/${userId}`, {
    method: "DELETE",
  });
  if (res.ok) {
    alert("User deleted");
    renderUsers();
  } else {
    alert("Failed to delete user");
  }
}

async function deleteEvent(eventId) {
  if (!confirm("Delete this event?")) return;
  const res = await fetch(`${API_BASE_URL}/event/${eventId}`, {
    method: "DELETE",
  });
  if (res.ok) {
    alert("Event deleted");
    renderEvents();
  } else {
    alert("Failed to delete event");
  }
}

async function renderUsers() {
  const users = await fetchAllUsers();
  const userList = document.getElementById("user-list");
  userList.innerHTML = "";
  users.forEach((user) => {
    const card = document.createElement("div");
    card.className = "admin-card";
    card.innerHTML = `
      <strong>${user.first_name} ${user.last_name}</strong><br>
      <span>${user.email}</span><br>
      <button>Delete</button>
    `;
    card.querySelector("button").onclick = () => deleteUser(user.id);
    userList.appendChild(card);
  });
}

async function renderEvents() {
  const events = await fetchAllEvents();
  const eventList = document.getElementById("event-list");
  eventList.innerHTML = "";
  events.forEach((event) => {
    const card = document.createElement("div");
    card.className = "admin-card";
    card.innerHTML = `
      <strong>${event.title}</strong><br>
      <span>${event.description || ""}</span><br>
      <button>Delete</button>
    `;
    card.querySelector("button").onclick = () => deleteEvent(event.id);
    eventList.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderUsers();
  renderEvents();
});
