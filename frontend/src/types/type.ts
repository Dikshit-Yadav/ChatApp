// user
export interface User {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  profilePic?: string;
  friends?: string[] | User[];
  googleId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// conversation / group
export interface Conversation {
  _id: string;
  isGroup: boolean;
  members: (string | User)[];
  groupName?: string;
  groupAvatar?: string;
  admin?: string | User;
  lastMessage?: string | Message | null;
  createdAt?: string;
  updatedAt?: string;
}

// message
export type FileType = "image" | "video" | "audio" | "document" | "other";

export interface MessageFile {
  url?: string;
  type?: FileType;
  name?: string;
  size?: number;
}

export type MessageStatus = "sent" | "delivered" | "seen";

export interface Reaction {
  userId: string | User;
  emoji: string;
}

export interface Message {
  _id?: string;
  conversationId: string;
  senderId: string | User;
  message?: string;
  file?: MessageFile;
  files?: MessageFile[];
  status?: MessageStatus;
  reactions: Reaction[];
  deletedFor?: string[];
  deletedForEveryone?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// invitation
export type InvitationStatus = "pending" | "accepted" | "rejected";

export interface Invitation {
  _id: string;
  senderId: string | User;
  receiverId: string | User;
  status: InvitationStatus;
  createdAt?: string;
  updatedAt?: string;
}