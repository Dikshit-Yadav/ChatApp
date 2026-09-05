import type{ Reaction } from "../types/type";

export type User = {
  _id: string;
  username: string;
  profilePic?: string;
};

export type Group = {
  _id: string;
  groupName: string;
  members: User[];
  isGroup: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Message = {
  _id: string;
  conversationId: string;
  senderId: string | User;
  message: string;
  createdAt: string;
  reactions?: Reaction[];
};