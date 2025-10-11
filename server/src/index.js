import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes.js"; // User routes
import eventRoutes from "./routes/eventRoutes.js"; // Event routes
import authRoutes from "./routes/authRoutes.js"; // Auth routes
import errorHandling from "./middlewares/errorHandler.js"; // Centralized error handling
import createUserTable from "./data/createUserTable.js";
import createEventTables from "./data/createEventTable.js";
import createFriendsTable from "./data/createFriendsTable.js";

// TODO: Create table for events
// import createEventTable from './data/createEventTable.js';
// Add check with JOI for request body validation

dotenv.config();

// Create app
const app = express();

// Port configuration from env else default to 3000
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes for users
app.use("/api/user", userRoutes);
// Routes for events
app.use("/api/event", eventRoutes);

app.use("/api/auth", authRoutes);

// Error handling middleware
app.use(errorHandling);

// Create table
createUserTable();

// Create event tables
createEventTables();

// Create friends table
createFriendsTable();

// Server running
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
