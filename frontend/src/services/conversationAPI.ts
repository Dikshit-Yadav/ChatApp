import api, { API_ENDPOINTS } from "./api";

export const conversationApi = {
  // PRIVATE CHAT

  // create conversation
  createPrivateConversation: async (receiverId: string) => {
    return api.post(API_ENDPOINTS.CONVERSATION.CREATE_OR_GET, {
      receiverId,
    });
  },

  // get conversation
  getConversations: async () => {
    return api.get(API_ENDPOINTS.CONVERSATION.BASE);
  },

  // get conversation by id
  getConversation: async (conversationId: string) => {
    return api.get(`${API_ENDPOINTS.CONVERSATION.BASE}/${conversationId}`);
  },

  // delete conversation
  deleteConversation: async (conversationId: string) => {
    return api.delete(`${API_ENDPOINTS.CONVERSATION.BASE}/${conversationId}`);
  },

  // MESSAGES

  // get msgs
  getMessages: async (conversationId: string, page = 1, limit = 30) => {
    return api.get(`${API_ENDPOINTS.MESSAGES.BASE}/${conversationId}`, {
      params: { page, limit },
    });
  },

  //send msgs
  sendMessage: async (
    conversationId: string,
    message: { text: string }
  ) => {
    return api.post(
      `${API_ENDPOINTS.MESSAGES.BASE}/${conversationId}`,
      message
    );
  },


  // GROUP CHAT

  // create groups
  createGroup: async (groupName: string, members: string[]) => {
    return api.post(`${API_ENDPOINTS.CONVERSATION.BASE}/group`, {
      groupName,
      members,
    });
  },

  // get groups
  getGroup: async (conversationId: string) => {
    return api.get(API_ENDPOINTS.CONVERSATION.GET_GROUP(conversationId));
  },

  // update groupname
 updateGroupName: async (conversationId: string, groupName: string) => {
    return api.put(
      API_ENDPOINTS.CONVERSATION.UPDATE_GROUP(conversationId),
      { groupName }
    );
  },

  // delete group
   deleteGroup: async (conversationId: string) => {
    return api.delete(
      API_ENDPOINTS.CONVERSATION.DELETE_GROUP(conversationId)
    );
  },

  //add member to group
  addMember: async (groupId: string, newMemberId: string) => {
    return api.post(API_ENDPOINTS.CONVERSATION.ADD_MEMBER, {
      groupId,
      newMemberId,
    });
  },
  //remove member from group
  removeMember: async (groupId: string, memberId: string) => {
    return api.post(API_ENDPOINTS.CONVERSATION.REMOVE_MEMBER, {
      groupId,
      memberId,
    });
  },
}