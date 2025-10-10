// To handle user-related routes

import express from "express";
import { authenticateJWT } from "../middlewares/authHandler.js"; // To validate JWT

// Import user controller functions
import {
  deleteUser,
  getAllUser,
  getUserById,
  updateUser,
  getAllEventsForUser,
  getUserBySlug,
} from "../controllers/userController.js";

const router = express.Router();

// Always check if user have valid token
router.use(authenticateJWT);

// User routes go here
router.get("/", getAllUser);
router.get("/slug/:slug", getUserBySlug);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.get("/:userId/events", getAllEventsForUser);

export default router;
