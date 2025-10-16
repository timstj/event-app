import {
  acceptFriendRequestService,
  deleteFriendService,
  getAllFriendsService,
  sendFriendRequestService,
  declineFriendRequestService,
  getFriendshipsService,
  getIncomingFriendRequestsService,
} from "../models/friendModel.js";

const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({
    status,
    message,
    data,
  });
};

// Might fetch friendid from url
export const sendFriendRequest = async (req, res, next) => {
  const { userId, friendId } = req.body;
  try {
    const request = await sendFriendRequestService(userId, friendId);
    handleResponse(res, 201, "Friend request sent", request);
  } catch (error) {
    next(error);
  }
};

//Might fetch from url and not body
export const getAllFriends = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const request = await getAllFriendsService(userId);
    handleResponse(res, 200, "Users friends retrieved", request);
  } catch (error) {
    next(error);
  }
};

export const acceptFriendRequest = async (req, res, next) => {
  const { userId, friendId } = req.body;
  try {
    const updated = await acceptFriendRequestService(userId, friendId);
    if (!updated || updated.length === 0) {
      return handleResponse(res, 400, "Can not accept friend request", updated);
    }
    handleResponse(res, 200, "Friend request accepted", updated);
  } catch (error) {
    next(error);
  }
};

export const deleteFriend = async (req, res, next) => {
  const { userId, friendId } = req.body;
  try {
    const deleted = await deleteFriendService(userId, friendId);
    if (!deleted || deleted.length === 0) {
      return handleResponse(res, 400, "Can not delete friend", deleted);
    }
    handleResponse(res, 200, "Friend deleted", deleted);
  } catch (error) {
    next(error);
  }
};

export const declineFriendRequest = async (req, res, next) => {
  const { userId, friendId } = req.body;
  try {
    const declined = await declineFriendRequestService(userId, friendId);
    if (!declined || declined.length === 0) {
      return handleResponse(
        res,
        400,
        "Can not decline friend request",
        declined
      );
    }
    handleResponse(res, 200, "Friend request declined", declined);
  } catch (error) {
    next(error);
  }
};

export const getFriendships = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const friendships = await getFriendshipsService(userId);
    if (!friendships)
      return handleResponse(res, 400, "Can not fetch friendships", friendships);
    handleResponse(res, 200, "Friendships retrived", friendships);
  } catch (error) {
    next(error);
  }
};

export const getIncomingFriendRequests = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const requests = await getIncomingFriendRequestsService(userId);
    handleResponse(res, 200, "Friend request retrieved", requests);
  } catch (error) {
    next(error);
  }
};
