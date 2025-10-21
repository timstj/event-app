import {
  createEventService,
  getAllEventsService,
  updateEventService,
  inviteUserToEventService,
  setEventHostService,
  removeInvitedUserService,
  getEventByIdService,
  deleteEventService,
  getAllInvitesForEventService,
  getAllEventsByHostService,
  updateInvitationStatusService,
  getInvitationStatusService,
  getEventAttendeesService,
} from "../models/eventModel.js";

// Add handling if event or user not found in services

const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({
    status,
    message,
    data,
  });
};

// Added for validation,
// TODO: maybe move to middleware later
const validateEventId = (eventId) => {
  if (!eventId) {
    return "Event ID is required";
  }

  const eventIdNum = parseInt(eventId);
  if (isNaN(eventIdNum) || eventIdNum <= 0) {
    return "Event ID must be a positive number";
  }

  return null;
};

const validateUserId = (userId) => {
  if (!userId) {
    return "User ID is required";
  }

  const userIdNum = parseInt(userId);
  if (isNaN(userIdNum) || userIdNum <= 0) {
    return "User ID must be a positive number";
  }

  return null;
};

export const createEvent = async (req, res, next) => {
  const { title, description, date, location } = req.body;
  const userId = req.user.userId;
  try {
    const newEvent = await createEventService(
      title,
      description,
      date,
      location,
      userId
    );
    handleResponse(res, 201, "Event created successfully", newEvent);
  } catch (error) {
    // Next used to pass control to the error handling middleware
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  const { id } = req.params;
  const { title, description, date } = req.body;
  try {
    const updatedEvent = await updateEventService(id, title, description, date);
    handleResponse(res, 200, "Event updated successfully", updatedEvent);
  } catch (error) {
    next(error);
  }
};

export const inviteUserToEvent = async (req, res, next) => {
  const { eventId } = req.params;
  const { userId } = req.body;
  try {
    const invite = await inviteUserToEventService(eventId, userId);
    handleResponse(res, 200, "User invited to event successfully", invite);
  } catch (error) {
    next(error);
  }
};

export const getAllInvitesForEvent = async (req, res, next) => {
  const { eventId } = req.params;
  try {
    const invites = await getAllInvitesForEventService(eventId);
    handleResponse(res, 200, "Invites retrieved successfully", invites);
  } catch (error) {
    next(error);
  }
};

export const setEventHost = async (req, res, next) => {
  const { eventId } = req.params;
  const { userId } = req.body;
  try {
    const host = await setEventHostService(eventId, userId);
    handleResponse(res, 200, "User set as event host successfully", host);
  } catch (error) {
    next(error);
  }
};

export const getAllEvents = async (req, res, next) => {
  try {
    const allEvents = await getAllEventsService();
    handleResponse(res, 200, "Events retrieved successfully", allEvents);
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const eventById = await getEventByIdService(id);
    if (!eventById) return handleResponse(res, 404, "Event not found");
    handleResponse(res, 200, "Event retrived successfully by id", eventById);
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  const { id } = req.params;
  try {
    await deleteEventService(id);
    handleResponse(res, 200, "Event deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const removeInvitedUser = async (req, res, next) => {
  const { eventId } = req.params;
  const { userId } = req.body;
  try {
    const removedInvite = await removeInvitedUserService(eventId, userId);
    if (!removedInvite)
      return handleResponse(
        res,
        404,
        "Invite not found for given event and user"
      );
    handleResponse(
      res,
      200,
      "User removed from event invites successfully",
      removedInvite
    );
  } catch (error) {
    next(error);
  }
};

export const getAllEventsByHost = async (req, res, next) => {
  try {
    // Get userId from JWT
    const userId = req.user.userId;
    const events = await getAllEventsByHostService(userId);
    handleResponse(res, 200, "Events where user is host retrived", events);
  } catch (error) {
    next(error);
  }
};

export const updateInvitationStatus = async (req, res, next) => {
  try {
    const { eventId, userId, status } = req.body;

    // Validate required fields
    if (!eventId || !userId || !status) {
      return handleResponse(
        res,
        400,
        "Event ID, User ID, and status are required"
      );
    }

    // Validate event ID
    const eventIdError = validateEventId(eventId);
    if (eventIdError) {
      return handleResponse(res, 400, eventIdError);
    }

    // Validate user ID
    const userIdError = validateUserId(userId);
    if (userIdError) {
      return handleResponse(res, 400, userIdError);
    }

    const updatedInvitation = await updateInvitationStatusService(
      eventId,
      userId,
      status
    );

    handleResponse(
      res,
      200,
      `Invitation ${status} successfully`,
      updatedInvitation
    );
  } catch (error) {
    if (
      error.message.includes("Invalid status") ||
      error.message.includes("not found") ||
      error.message.includes("already")
    ) {
      return handleResponse(res, 400, error.message);
    }
    next(error);
  }
};

export const getInvitationStatus = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.query;

    // Validate event ID
    const eventIdError = validateEventId(eventId);
    if (eventIdError) {
      return handleResponse(res, 400, eventIdError);
    }

    // Use provided userId or default to authenticated user
    const targetUserId = userId || req.user?.userId;
    if (!targetUserId) {
      return handleResponse(res, 400, "User ID is required");
    }

    const userIdError = validateUserId(targetUserId);
    if (userIdError) {
      return handleResponse(res, 400, userIdError);
    }

    const invitation = await getInvitationStatusService(eventId, targetUserId);

    handleResponse(res, 200, "Invitation status retrieved", invitation);
  } catch (error) {
    next(error);
  }
};

export const getEventAttendees = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { status } = req.query; // Optional filter

    // Validate event ID
    const eventIdError = validateEventId(eventId);
    if (eventIdError) {
      return handleResponse(res, 400, eventIdError);
    }

    // Validate status filter if provided
    if (status) {
      const validStatuses = ["pending", "accepted", "maybe", "declined"];
      if (!validStatuses.includes(status)) {
        return handleResponse(
          res,
          400,
          `Invalid status filter. Must be one of: ${validStatuses.join(", ")}`
        );
      }
    }

    const attendees = await getEventAttendeesService(eventId, status);

    handleResponse(res, 200, "Attendees retrieved successfully", attendees);
  } catch (error) {
    next(error);
  }
};
