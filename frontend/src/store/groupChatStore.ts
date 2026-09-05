import { create } from "zustand";
import { socket } from "../contex/socket";
import { conversationApi } from "../services/conversationAPI";
import type { Conversation, Message, User } from "../types/type";

interface GroupChatState {
  group: Conversation | null;
  messages: Message[];
  members: (string | User)[];
  loadingId: string | null;

  setGroup: (group: Conversation | null) => void;
  fetchMessages: (groupId: string) => Promise<void>;
  sendMessage: (text: string) => void;
  sendFileMessage: (files: File[], text?: string) => Promise<boolean>;
  receiveMessage: (msg: Message) => void;
  removeMember: (groupId: string, memberId: string) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  renameGroup: (groupId: string, name: string) => Promise<Conversation | null>;
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
}

export const useGroupChatStore = create<GroupChatState>((set, get) => ({
  group: null,
  messages: [],
  members: [],
  loadingId: null,

  setGroup: (group) => {
    set({
      group,
      members: group?.members || [],
      messages: [],
    });

    if (group) {
      socket.emit("join-conversation", {
        conversationId: group._id,
      });
    }
  },

  fetchMessages: async (groupId) => {
    try {
      const res = await conversationApi.getMessages(groupId);
      set({ messages: res.data || [] });
    } catch (err) {
      console.error("Error fetching messages", err);
    }
  },

  sendMessage: (text) => {
    const { group } = get();
    if (!text.trim() || !group) return;

    socket.emit("send-message", {
      conversationId: group._id,
      message: text,
    });
  },

  sendFileMessage: async (files, text = "") => {
    const { group } = get();
    if (!group || files.length === 0) return false;

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      if (text) {
        formData.append("text", text);
      }

      const res = await conversationApi.sendFileMessage(group._id, formData);
      return true;
    } catch (err: any) {
      console.error("Error uploading file in group", err);
      return false;
    }
  },

  receiveMessage: (msg) => {
    const { group } = get();
    if (msg.conversationId === group?._id) {
      set((state) => ({
        messages: [...state.messages, msg],
      }));
    }
  },

  removeMember: async (groupId, memberId) => {
    try {
      set({ loadingId: memberId });

      const res = await conversationApi.removeMember(groupId, memberId);
      const updatedGroup = res.data.group;

      set({
        group: updatedGroup,
        members: updatedGroup.members,
      });
    } catch (err) {
      console.error(err);
    } finally {
      set({ loadingId: null });
    }
  },

  deleteGroup: async (groupId) => {
    try {
      await conversationApi.deleteGroup(groupId);
      set({ group: null, messages: [], members: [] });
    } catch (err) {
      console.error("Error deleting group", err);
    }
  },

  renameGroup: async (groupId, name) => {
    try {
      const res = await conversationApi.renameGroup(groupId, name);
      const updatedGroup = res.data.group;

      set({ group: updatedGroup });
      return updatedGroup;
    } catch (err) {
      console.error("Rename failed", err);
      return null;
    }
  },

  toggleReaction: async (messageId, emoji) => {
    try {
      const res = await conversationApi.toggleReaction(messageId, emoji);
      const updatedMsg = res.data;

      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? updatedMsg : msg
        ),
      }));
    } catch (err) {
      console.error("Error toggling reaction", err);
    }
  },
}));

socket.on("message-reaction-updated", (updatedMsg: Message) => {
  useGroupChatStore.setState((state) => {
    if (state.group?._id === updatedMsg.conversationId) {
      return {
        messages: state.messages.map((m) => (m._id === updatedMsg._id ? updatedMsg : m)),
      };
    }
    return state;
  });
});