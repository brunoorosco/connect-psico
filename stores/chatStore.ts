import { create } from "zustand";
import { MessageModel } from "@/components/chat/types"; // ajuste o path conforme seu projeto

interface ChatStore {
  selectedMessage: MessageModel[] | null;
  selectedUserConversation: string | null;
  replyContent: string;

  setSelectedMessage: (msg: MessageModel[] | null) => void;
  setSelectedUserConversation: (user: string | null) => void;
  setReplyContent: (content: string) => void;
  resetChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  selectedMessage: null,
  selectedUserConversation: null,
  replyContent: "",

  setSelectedMessage: (msg) => set({ selectedMessage: msg }),
  setSelectedUserConversation: (user) => set({ selectedUserConversation: user }),
  setReplyContent: (content) => set({ replyContent: content }),
  resetChat: () =>
    set({
      selectedMessage: null,
      selectedUserConversation: null,
      replyContent: "",
    }),
}));
