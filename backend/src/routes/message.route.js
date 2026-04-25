// chat-app/backend/src/routes/message.route.js
import express from "express";
import { protectRoute, requireNotTimedOut } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, requireNotTimedOut, sendMessage);

export default router;