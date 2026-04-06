export interface Conversation {
  _id: string;
  name?: string;
  members: string[];
  isGroup: boolean;
  createdAt?: string;
  updatedAt?: string;
}
export interface CreateGroupPayload {
  groupName: string;
  members: string[];
}

export interface AddMemberPayload {
  conversationId: string;
  memberId: string;
}

export interface Message {
  id: string;
  senderId: string;
  conversationId: string;
  content: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SendMessagePayload {
  conversationId: string;
  message: string;
}

export interface UploadFilePayload {
  file: File;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
}