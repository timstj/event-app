import express from "express";
import cors from "cors";
import dotenv from "dotenv";

const envFile = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: envFile });

// TODO: Go over shutdown logic and retry logic
import userRoutes from "./routes/userRoutes.js"; // User routes
import eventRoutes from "./routes/eventRoutes.js"; // Event routes
import authRoutes from "./routes/authRoutes.js"; // Auth routes
import friendRoutes from "./routes/friendRoutes.js"; // Friend routes
import errorHandling from "./middlewares/errorHandler.js"; // Centralized error handling
import createUserTable from "./data/createUserTable.js";
import createEventTables from "./data/createEventTable.js";
import createFriendsTable from "./data/createFriendsTable.js";
import { pool, testConnection } from "./config/db.js";

// TODO: Create table for events
// import createEventTable from './data/createEventTable.js';
// Add check with JOI for request body validation

// Log startup information
console.log("Starting Event App API...");
console.log("Environment:", process.env.NODE_ENV || "development");
console.log("Port:", process.env.PORT || 5001);
console.log(
  "Frontend URL:",
  process.env.FRONTEND_URL || "http://localhost:5500"
);

// Create app
const app = express();

// Port configuration from env else default to 3000
const PORT = process.env.PORT || 3000;

// Middleware
// Secure cors to only allow my frontend
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
        "http://localhost:5500",
        "http://127.0.0.1:5500",
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Health check endpoint for monitoring
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API info endpoint (for debugging)
app.get("/api", (req, res) => {
  res.json({
    message: "Event App API",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    endpoints: {
      health: "/health",
      auth: "/api/auth/*",
      users: "/api/user/*",
      events: "/api/event/*",
      friends: "/api/friends/*",
    },
  });
});

// Routes for users
app.use("/api/user", userRoutes);
// Routes for events
app.use("/api/event", eventRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/friends", friendRoutes);

// Error handling middleware
app.use(errorHandling);

// Start server
const server = app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  
  try {
    // Test connection
    await testConnection();
    
    // Create tables (only on first run)
    console.log("Setting up database...");
    await createUserTable();
    await createEventTables();
    await createFriendsTable();
    console.log("Database ready!");
    
  } catch (error) {
    console.error("Startup error:", error.message);
  }
});

// Graceful shutdown
async function shutdown(signal) {
  console.log(`\n ${signal} received, shutting down...`);
  server.close(async () => {
    await pool.end();
    console.log("Shutdown complete");
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.once("SIGUSR2", async () => {
  await shutdown("SIGUSR2");
  process.kill(process.pid, "SIGUSR2");
});

// Input validation middleware
// + function validateUserAndFriendId(req, res, next) {
// +   const { userId, friendId } = req.body;
// +   if (!userId || !friendId) {
// +     return res.status(400).json({ error: "userId and friendId are required" });
// +   }
// +   next();
// + }
// +
// + router.post("/friend-request", validateUserAndFriendId, sendFriendRequest);
// +
// + router.get("/all/:userId", getAllFriends);
// +
// + router.put("/accept", validateUserAndFriendId, acceptFriendRequest);
