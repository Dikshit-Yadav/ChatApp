import api, { API_ENDPOINTS } from "./api";

export const conversationApi = {
  createPrivateConversation: async (receiverId: string) => {
    return api.post(API_ENDPOINTS.CONVERSATION.CREATE_OR_GET, { receiverId });
  },

  getConversation: async (conversationId: string) => {
    return api.get(`/conversation/${conversationId}`);
  },

  getMessages: async (conversationId: string) => {
    return api.get(`/messages/${conversationId}`);
  },

  sendMessage: async (conversationId: string, message: { text: string }) => {
    return api.post(`/messages/${conversationId}`, message);
  },
};