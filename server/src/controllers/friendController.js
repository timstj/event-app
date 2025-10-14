import {
  getAllFriendsService,
  sendFriendRequestService,
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
