import api, { API_ENDPOINTS } from "./api";
import type {
  Conversation,
  Message,
  CreateGroupPayload,
  AddMemberPayload,
  SendMessagePayload,
  UploadFilePayload,
  ApiResponse
} from "../types/conversation";
import type { AxiosResponse } from "axios";

export const conversationApi = {
  // conversations
  getAllConversations: (): Promise<AxiosResponse<ApiResponse<Conversation[]>>> =>
    api.get("/conversations"),

  createPrivateConversation: (receiverId: string) =>
    api.post(API_ENDPOINTS.CONVERSATION.CREATE_PRIVATE, { receiverId }),



  deletePrivateConversation: (conversationId: string): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/conversations/${conversationId}`),

  // groups
  createGroup: (payload: CreateGroupPayload): Promise<AxiosResponse<ApiResponse<Conversation>>> =>
    api.post("/conversations/group", payload),

  getGroup: (conversationId: string): Promise<AxiosResponse<ApiResponse<Conversation>>> =>
    api.get(`/conversations/group/${conversationId}`),

  updateGroupName: (conversationId: string, groupName: string): Promise<AxiosResponse<ApiResponse<Conversation>>> =>
    api.put(`/conversations/group/${conversationId}`, { groupName }),

  deleteGroup: (conversationId: string): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/conversations/group/${conversationId}`),

  addMemberToGroup: (payload: AddMemberPayload): Promise<AxiosResponse<ApiResponse<Conversation>>> =>
    api.post("/conversations/group/add-member", payload),

  //  messages
  sendMessage: (payload: SendMessagePayload) =>
    api.post(API_ENDPOINTS.MESSAGE.SEND_TEXT, payload),

  getMessages: (conversationId: string) =>
    api.get<Message[]>(`/message/${conversationId}`),

  uploadFile: (payload: UploadFilePayload): Promise<AxiosResponse<ApiResponse<{ fileUrl: string }>>> => {
    const formData = new FormData();
    formData.append("file", payload.file);
    return api.post("/message/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};