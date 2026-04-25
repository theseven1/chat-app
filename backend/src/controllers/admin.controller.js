// chat-app/backend/src/controllers/admin.controller.js
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { encrypt } from "../lib/encryption.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const toggleBanStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isAdmin) return res.status(400).json({ message: "Cannot ban an admin" });

    user.isBanned = !user.isBanned;
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const timeoutUser = async (req, res) => {
  try {
    const { durationMinutes } = req.body;
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isAdmin) return res.status(400).json({ message: "Cannot timeout an admin" });

    const timeoutDate = new Date(new Date().getTime() + durationMinutes * 60000);
    user.timeoutUntil = timeoutDate;
    await user.save();

    const socketId = getReceiverSocketId(user._id);
    if (socketId) {
      io.to(socketId).emit("timeoutUpdated", timeoutDate);
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const removeTimeout = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    user.timeoutUntil = null;
    await user.save();

    const socketId = getReceiverSocketId(user._id);
    if (socketId) {
      io.to(socketId).emit("timeoutUpdated", null);
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const sendSystemMessage = async (req, res) => {
  try {
    const { targetUserId, text } = req.body;
    const senderId = req.user._id;

    const newMessage = new Message({
      senderId,
      receiverId: targetUserId,
      text: encrypt(text),
      isSystem: true,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(targetUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", { ...newMessage._doc, text });
    }

    res.status(200).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (message) {
        io.emit("messageDeleted", message._id);
    }
    res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};