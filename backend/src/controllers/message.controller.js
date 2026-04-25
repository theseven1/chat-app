// chat-app/backend/src/controllers/message.controller.js
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { encrypt, decrypt } from "../lib/encryption.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    
    const user = await User.findById(loggedInUserId).populate("friends", "-password");
    let allSidebarUsers = [...user.friends];

    // Check if the user has received any system messages
    const hasSystemMessages = await Message.exists({ receiverId: loggedInUserId, isSystem: true });
    
    if (hasSystemMessages) {
      // Append a virtual System user
      allSidebarUsers.unshift({
        _id: "system",
        fullName: "System",
        profilePic: "https://res.cloudinary.com/dscifeehs/image/upload/v1777099940/osi-brands-solid_p6fbet.png",
        isSystemUser: true,
      });
    }

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

    let messages;
    if (userToChatId === "system") {
       messages = await Message.find({ receiverId: myId, isSystem: true });
    } else {
       messages = await Message.find({
        $or: [
          { senderId: myId, receiverId: userToChatId, isSystem: false },
          { senderId: userToChatId, receiverId: myId, isSystem: false },
        ],
      });
    }

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

    if (receiverId === "system") {
        return res.status(403).json({ error: "Cannot reply to System messages" });
    }

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