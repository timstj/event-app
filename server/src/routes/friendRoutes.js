import express from "express";
import {
  getAllFriends,
  sendFriendRequest,
} from "../controllers/friendController.js";

import { authenticateJWT } from "../middlewares/authHandler.js"; // To validate JWT

const router = express.Router();

router.use(authenticateJWT);

router.post("/friend-request", sendFriendRequest);

router.get("/all", getAllFriends);
