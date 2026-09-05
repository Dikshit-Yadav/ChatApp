import { create } from "zustand";

import { conversationApi } from "../services/conversationAPI";
import { socket } from "../contex/socket";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Reaction {
  userId: { _id: string; username?: string; profilePic?: string } | string;
  emoji: string;
}

interface Message {
  _id: string;
  senderId: { _id: string; username?: string; profilePic?: string };
  message: string;
  createdAt: string;
  reactions?: Reaction[];
}

interface User {
  _id: string;
  username: string;
  profilePic?: string;
}

let initialized = false;

interface ChatState {
  messages: Message[];
  conversationUser: User | null;
  typing: boolean;
  onlineUsers: string[];

  fetchMessages: (conversationId: string) => Promise<void>;
  fetchConversation: (conversationId: string, userId: string) => Promise<void>;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  sendFileMessage: (conversationId: string, files: File[], text?: string) => Promise<boolean>;
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
  deleteMessageForEveryone: (messageId: string) => Promise<void>;
  deleteMessageForMe: (messageId: string) => Promise<void>;

  setupSocketListeners: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  conversationUser: null,
  typing: false,
  onlineUsers: [],

  fetchMessages: async (conversationId) => {
    try {
      const res = await conversationApi.getMessages(conversationId);
      set({ messages: res.data });
    } catch (err) {
      toast.error("Error fetching messages");
      console.error("Error fetching messages", err);
    }
  },

  fetchConversation: async (conversationId, userId) => {
    try {
      const res = await conversationApi.getConversation(conversationId);
      const conversation = res.data;

      if (!conversation.isGroup) {
        const otherUser = conversation.members.find(
          (m: User) => m._id !== userId
        );
        set({ conversationUser: otherUser || null });
      }
    } catch (err) {
      toast.error("Error fetching conversation");
      console.error("Error fetching conversation", err);
    }
  },

  // send message
  sendMessage: async (conversationId, text) => {
    try {
      const res = await conversationApi.sendMessage(conversationId, { text });

      const msg = {
        ...res.data,
        senderId:
          typeof res.data.senderId === "string"
            ? { _id: res.data.senderId }
            : res.data.senderId,
      };

      set((state) => ({
        messages: [...state.messages, msg],
      }));

      socket.emit("stop-typing", { conversationId });
    } catch (err) {
      toast.error("Error sending message");
      console.error("Error sending message", err);
    }
  },

  sendFileMessage: async (conversationId, files, text = "") => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      if (text) {
        formData.append("text", text);
      }

      const res = await conversationApi.sendFileMessage(conversationId, formData);

      const msg = {
        ...res.data,
        senderId:
          typeof res.data.senderId === "string"
            ? { _id: res.data.senderId }
            : res.data.senderId,
      };

      set((state) => ({
        messages: [...state.messages, msg],
      }));

      socket.emit("stop-typing", { conversationId });
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Error uploading file(s)";
      toast.error(errorMsg);
      console.error("Error sending file message", err);
      return false;
    }
  },

  toggleReaction: async (messageId, emoji) => {
    try {
      const res = await conversationApi.toggleReaction(messageId, emoji);

      const updatedMsg = {
        ...res.data,
        senderId: typeof res.data.senderId === "string"
          ? { _id: res.data.senderId }
          : res.data.senderId,
      };

      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? updatedMsg : msg
        ),
      }));
    } catch (err) {
      toast.error("Error updating reaction");
      console.error("Error toggling reaction", err);
    }
  },

  // delete message for everyone
  deleteMessageForEveryone: async (messageId) => {
    try {
      await conversationApi.deleteMessageForEveryone(messageId);
      set((state) => ({
        messages: state.messages.filter((m) => m._id !== messageId),
      }));
    } catch (err) {
      toast.error("Error deleting message");
      console.error("Error deleting for everyone", err);
    }
  },

  // delete message for me
  deleteMessageForMe: async (messageId) => {
    try {
      await conversationApi.deleteMessageForMe(messageId);
      set((state) => ({
        messages: state.messages.filter((m) => m._id !== messageId),
      }));
    } catch (err) {
      toast.error("Error deleting message");
      console.error("Error deleting for me", err);
    }
  },

  // socket listeners
  setupSocketListeners: () => {
    if (initialized) return;
    initialized = true;

    socket.on("new-message", (msg: Message) => {
      set((state) => ({
        messages: [...state.messages, msg],
      }));
    });

    socket.on("message-reaction-updated", (updatedMsg: Message) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === updatedMsg._id ? updatedMsg : m
        ),
      }));
    });

    socket.on("online-users", (users: string[]) => {
      set({ onlineUsers: users });
    });

    socket.on("user-typing", () => set({ typing: true }));
    socket.on("user-stop-typing", () => set({ typing: false }));

    socket.on("message-deleted-everyone", ({ messageId }: { messageId: string }) => {
      set((state) => ({
        messages: state.messages.filter((m) => m._id !== messageId),
      }));
    });
  },
}));