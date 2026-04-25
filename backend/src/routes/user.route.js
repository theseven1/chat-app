// chat-app/backend/src/routes/user.route.js
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { sendFriendRequest, acceptFriendRequest, declineFriendRequest, getPendingRequests } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/requests", protectRoute, getPendingRequests);
router.post("/request", protectRoute, sendFriendRequest);
router.post("/accept/:id", protectRoute, acceptFriendRequest);
router.post("/decline/:id", protectRoute, declineFriendRequest);

export default router;