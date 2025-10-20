// Standardized response function

// TODO: Change every id to userId for clarity

import {
  deleteUserService,
  getAllUsersService,
  getUserByIdService,
  updateUserService,
  getAllEventsForUserService,
  getUserBySlugService,
} from "../models/userModel.js";

const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({
    status,
    message,
    data,
  });
};

export const getAllUser = async (req, res, next) => {
  try {
    const allUsers = await getAllUsersService();
    handleResponse(res, 200, "Users retrived successfully", allUsers);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const userById = await getUserByIdService(id);
    if (!userById) return handleResponse(res, 404, "User not found");
    handleResponse(res, 200, "User retrived successfully by id", userById);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  const { id } = req.params;
  const { first_name, last_name, email } = req.body;
  try {
    const updatedUser = await updateUserService(id, first_name, last_name, email);
    if (!updatedUser) return handleResponse(res, 404, "User not found");
    handleResponse(res, 200, "User updated successfully by id", updatedUser);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  const { id } = req.params;
  try {
    const deleteUser = await deleteUserService(id);
    if (!deleteUser) return handleResponse(res, 404, "User not found");
    handleResponse(res, 200, "User deleted successfully", deleteUser);
  } catch (error) {
    next(error);
  }
};

export const getAllEventsForUser = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const events = await getAllEventsForUserService(userId);
    if (!events || events.length === 0)
      return handleResponse(res, 404, "No events found for user");
    handleResponse(res, 200, "Events for user retrieved successfully", events);
  } catch (error) {
    next(error);
  }
};

export const getUserBySlug = async (req, res, next) => {
  const { slug } = req.params;
  try {
    const user = await getUserBySlugService(slug);
    if (!user) return handleResponse(res, 404, "No user found");
    handleResponse(res, 200, "User found", user);
  } catch (error) {
    next(error);
  }
};
