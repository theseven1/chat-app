// chat-app/backend/src/controllers/user.controller.js
import User from "../models/user.model.js";

export const sendFriendRequest = async (req, res) => {
  try {
    const { email } = req.body;
    const targetUser = await User.findOne({ email });

    if (!targetUser) return res.status(404).json({ message: "User not found" });
    if (targetUser._id.toString() === req.user._id.toString()) return res.status(400).json({ message: "Cannot add yourself" });

    if (targetUser.friends.includes(req.user._id)) return res.status(400).json({ message: "Already friends" });
    if (targetUser.friendRequests.includes(req.user._id)) return res.status(400).json({ message: "Request already sent" });

    targetUser.friendRequests.push(req.user._id);
    await targetUser.save();

    res.status(200).json({ message: "Friend request sent!" });
  } catch (error) {
    console.error("Error in sendFriendRequest:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("friendRequests", "-password");
    res.status(200).json(user.friendRequests || []);
  } catch (error) {
    console.error("Error in getPendingRequests:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { id } = req.params; 
    const user = await User.findById(req.user._id);
    const sender = await User.findById(id);

    if (!user.friendRequests.includes(id)) {
      return res.status(400).json({ message: "No request found" });
    }

    user.friendRequests = user.friendRequests.filter(reqId => reqId.toString() !== id);
    user.friends.push(id);
    sender.friends.push(user._id);

    await user.save();
    await sender.save();

    const senderWithoutPassword = await User.findById(id).select("-password");
    res.status(200).json(senderWithoutPassword);
  } catch (error) {
    console.error("Error in acceptFriendRequest:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const declineFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    user.friendRequests = user.friendRequests.filter(reqId => reqId.toString() !== id);
    await user.save();

    res.status(200).json({ message: "Request declined" });
  } catch (error) {
    console.error("Error in declineFriendRequest:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};