// chat-app/frontend/src/store/useAdminStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAdminStore = create((set) => ({
  users: [],
  isLoading: false,

  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/admin/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isLoading: false });
    }
  },

  toggleBan: async (userId) => {
    try {
      const res = await axiosInstance.put(`/admin/users/${userId}/ban`);
      set((state) => ({
        users: state.users.map((user) => (user._id === userId ? res.data : user)),
      }));
      toast.success(res.data.isBanned ? "User has been banned" : "User unbanned");
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  },

  sendSystemMessage: async (targetUserId, text) => {
    try {
      await axiosInstance.post("/admin/messages/system", { targetUserId, text });
      toast.success("System message dispatched");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  }
}));
