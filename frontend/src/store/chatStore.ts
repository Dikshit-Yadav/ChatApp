import { create } from "zustand";
import { conversationApi } from "../services/conversationAPI";
import { socket } from "../contex/socket";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Message {
  _id: string;
  senderId: { _id: string; username?: string; profilePic?: string };
  message: string;
  createdAt: string;
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

  setupSocketListeners: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  conversationUser: null,
  typing: false,
  onlineUsers: [],

  //  fetch messages
  fetchMessages: async (conversationId) => {
    try {
      const res = await conversationApi.getMessages(conversationId);
      set({ messages: res.data });
    } catch (err) {
      toast.error("Error fetching messages");
      console.error("Error fetching messages", err);
    }
  },

  // fetch conversation user
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

  // socket listeners
  setupSocketListeners: () => {
    if (initialized) return;
    initialized = true;

    socket.on("new-message", (msg: Message) => {
      set((state) => ({
        messages: [...state.messages, msg],
      }));
    });

    socket.on("online-users", (users: string[]) => {
      set({ onlineUsers: users });
    });

    socket.on("user-typing", () => set({ typing: true }));
    socket.on("user-stop-typing", () => set({ typing: false }));
  },
}));