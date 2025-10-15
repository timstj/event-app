import express from "express";
import {
  acceptFriendRequest,
  declineFriendRequest,
  deleteFriend,
  getAllFriends,
  sendFriendRequest,
} from "../controllers/friendController.js";

import { authenticateJWT } from "../middlewares/authHandler.js"; // To validate JWT

const router = express.Router();

router.use(authenticateJWT);

router.post("/friend-request", sendFriendRequest);

router.get("/all/:userId", getAllFriends);

router.put("/accept", acceptFriendRequest);

router.put("/decline", declineFriendRequest);

router.delete("/delete/", deleteFriend);

export default router;
