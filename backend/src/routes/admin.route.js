// chat-app/backend/src/routes/admin.route.js
import express from "express";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import { getAllUsers, toggleBanStatus, sendSystemMessage, deleteMessage } from "../controllers/admin.controller.js";

const router = express.Router();

router.use(protectRoute, requireAdmin);

router.get("/users", getAllUsers);
router.put("/users/:id/ban", toggleBanStatus);
router.post("/messages/system", sendSystemMessage);
router.delete("/messages/:id", deleteMessage);

export default router;