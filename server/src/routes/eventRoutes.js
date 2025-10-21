// To handle event-related routes

import express from "express";

// Import event controller functions
import {
  getAllEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  inviteUserToEvent,
  setEventHost,
  getAllInvitesForEvent,
  removeInvitedUser,
  getAllEventsByHost,
  updateInvitationStatus,
  getInvitationStatus,
  getEventAttendees,
} from "../controllers/eventController.js";

import { authenticateJWT } from "../middlewares/authHandler.js"; // To validate JWT

const router = express.Router();

router.use(authenticateJWT);

router.get("/", getAllEvents);

router.post("/", createEvent);

router.get("/hosted", getAllEventsByHost);

router.get("/:id", getEventById);

router.put("/:id", updateEvent);

router.delete("/:id", deleteEvent);

router.post("/:eventId/invite", inviteUserToEvent);

router.post("/:eventId/host", setEventHost);

router.get("/:eventId/invites", getAllInvitesForEvent);

router.delete("/:eventId/invite/:userId/remove", removeInvitedUser);

router.put("/invitation/status", updateInvitationStatus);

router.get("/:eventId/invitation/status", getInvitationStatus);

router.get("/:eventId/attendees", getEventAttendees);

export default router;
