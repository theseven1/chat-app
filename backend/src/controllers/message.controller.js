// chat-app/backend/src/controllers/message.controller.js
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { encrypt, decrypt } from "../lib/encryption.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    
    // Fetch only accepted friends
    const user = await User.findById(loggedInUserId).populate("friends", "-password");
    const friendIds = user.friends.map(f => f._id.toString());

    // Allow displaying users who have sent a system message to you
    const systemMessages = await Message.find({ receiverId: loggedInUserId, isSystem: true });
    const systemSenderIds = systemMessages.map(m => m.senderId.toString());

    const extraIds = [...new Set(systemSenderIds)].filter(id => !friendIds.includes(id));
    const extraUsers = await User.find({ _id: { $in: extraIds } }).select("-password");

    const allSidebarUsers = [...user.friends, ...extraUsers];

    res.status(200).json(allSidebarUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    const decryptedMessages = messages.map(msg => ({
      ...msg._doc,
      text: decrypt(msg.text)
    }));

    res.status(200).json(decryptedMessages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text: encrypt(text),
      image: imageUrl,
    });

    await newMessage.save();

    // Prepare decrypted text to emit back
    const messageToSend = {
      ...newMessage._doc,
      text: decrypt(newMessage.text)
    };

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", messageToSend);
    }

    res.status(201).json(messageToSend);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};