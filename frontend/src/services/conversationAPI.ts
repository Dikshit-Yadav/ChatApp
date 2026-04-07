import api, { API_ENDPOINTS } from "./api";

export const conversationApi = {
  // Create or get a private chat with a receiver
  createPrivateConversation: async (receiverId: string) => {
    return api.post(API_ENDPOINTS.CONVERSATION.CREATE_OR_GET, { receiverId });
  },

  // Get a single conversation by ID
  getConversation: async (conversationId: string) => {
    return api.get(`${API_ENDPOINTS.CONVERSATION.BASE}/${conversationId}`);
  },

  // Get all messages for a conversation
  getMessages: async (conversationId: string, page = 1, limit = 30) => {
    return api.get(`/message/${conversationId}`, {
      params: { page, limit },
    });
  },

  // Send a message in a conversation
  sendMessage: async (conversationId: string, message: { text: string }) => {
    return api.post(`${API_ENDPOINTS.MESSAGES.BASE}/${conversationId}`, message);
  },


};