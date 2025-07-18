import { create } from "zustand";
import { toast } from "sonner";
import axios from "axios";
import { useAuthStore } from './useAuthStore'
import { getPatientsByProfessionalId } from "@/actions/patients";
import { env } from "../../../config/application";
// import { axiosInstance } from "../lib/axios";

export const axiosInstance = axios.create({
  baseURL: env.baseUrlPsicomaisApi,
  withCredentials: true,
});

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async (userId) => {
    set({ isUsersLoading: true });
    try {
      // const res = await axiosInstance.get("/messages/users");
      // console.log(res.data);
      const patients = await getPatientsByProfessionalId(userId)
      console.log(patients)
      set({ users: patients});
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    console.log(selectedUser);
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser.userId}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      console.error(error)
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    // const { selectedUser } = get();
    const { selectedUser } = {
      _id: "6878cb9598f9219bdf99e983",
      email: "james.anderson@example.com",
      fullName: "James Anderson",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/1.jpg"
    }
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    // socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));