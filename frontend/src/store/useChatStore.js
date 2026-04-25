// chat-app/frontend/src/store/useChatStore.js
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  friendRequests: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getFriendRequests: async () => {
    try {
      const res = await axiosInstance.get("/users/requests");
      set({ friendRequests: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load requests");
    }
  },

  sendFriendRequest: async (email) => {
    try {
      const res = await axiosInstance.post("/users/request", { email });
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
    }
  },

  acceptRequest: async (id) => {
    try {
      const res = await axiosInstance.post(`/users/accept/${id}`);
      set(state => ({
        friendRequests: state.friendRequests.filter(req => req._id !== id),
        users: [...state.users, res.data]
      }));
      toast.success("Friend request accepted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request");
    }
  },

  declineRequest: async (id) => {
    try {
      await axiosInstance.post(`/users/decline/${id}`);
      set(state => ({
        friendRequests: state.friendRequests.filter(req => req._id !== id)
      }));
      toast.success("Friend request declined");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to decline request");
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  deleteMessage: async (id) => {
    try {
        await axiosInstance.delete(`/admin/messages/${id}`);
        set(state => ({ messages: state.messages.filter(m => m._id !== id) }));
        toast.success("Message deleted by Admin");
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      const isSystemMessage = newMessage.isSystem; 
      if (!isMessageSentFromSelectedUser && !isSystemMessage && newMessage.receiverId !== selectedUser._id) return;
      
      set({
        messages: [...get().messages, newMessage],
      });
    });

    socket.on("messageDeleted", (messageId) => {
      set({
        messages: get().messages.filter(m => m._id !== messageId),
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messageDeleted");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));