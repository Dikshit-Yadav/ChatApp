import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    SEND_OTP: "/auth/send-otp",
    SEND_OTP_FORGOT: "/auth/send-otp/forgot",
    VERIFY_OTP: "/auth/verify",
    RESET_PASSWORD: "/auth/reset-password",
  },
  USER: {
    SEARCH_FRIENDS: "/user/search",
    GET_FRIENDS: "/user/friends",
    RESPOND_INVITE: "/invite/respond",
  },
  INVITE: {
    RESPOND: "/invite/respond",
    SEND: "/invite/send",
    GET: "/invite",
  },
  CONVERSATION: {
    GET_ALL: "/conversations",
    CREATE_PRIVATE: "/conversations",
    DELETE_PRIVATE: (conversationId) => `/conversations/${conversationId}`,
    CREATE_GROUP: "/conversations/group",
    GET_GROUP: (conversationId) => `/conversations/group/${conversationId}`,
    UPDATE_GROUP_NAME: (conversationId) => `/conversations/group/${conversationId}`,
    DELETE_GROUP: (conversationId) => `/conversations/group/${conversationId}`,
    ADD_MEMBER: "/conversations/group/add-member",
  },
  MESSAGE: {
    SEND_TEXT: "/message",
    GET_BY_CONVERSATION: (conversationId) => `/message/${conversationId}`,
    UPLOAD_FILE: "/message/upload",
  },
};

export default api;