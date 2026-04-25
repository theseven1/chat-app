// chat-app/backend/src/routes/user.route.js
import express from "express";
import { protectRoute, requireNotTimedOut } from "../middleware/auth.middleware.js";
import { sendFriendRequest, acceptFriendRequest, declineFriendRequest, getPendingRequests, removeFriend } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/requests", protectRoute, getPendingRequests);
router.post("/request", protectRoute, requireNotTimedOut, sendFriendRequest);
router.post("/accept/:id", protectRoute, requireNotTimedOut, acceptFriendRequest);
router.post("/decline/:id", protectRoute, declineFriendRequest);
router.delete("/remove/:id", protectRoute, removeFriend);

export default router;