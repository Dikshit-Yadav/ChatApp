import api, { API_ENDPOINTS } from "./api";

export const conversationApi = {
  // creat and get private conversation
  createPrivateConversation: async (receiverId: string) => {
    return api.post(API_ENDPOINTS.CONVERSATION.CREATE_OR_GET, { receiverId });
  },

  // Get a conversation
  getConversation: async (conversationId: string) => {
    return api.get(`${API_ENDPOINTS.CONVERSATION.BASE}/${conversationId}`);
  },

  // get all messages of a conversation
  getMessages: async (conversationId: string, page = 1, limit = 30) => {
    return api.get(`/message/${conversationId}`, {
      params: { page, limit },
    });
  },

  // send a message to a conversation
  sendMessage: async (conversationId: string, message: { text: string }) => {
    return api.post(`${API_ENDPOINTS.MESSAGES.BASE}/${conversationId}`, message);
  },


};