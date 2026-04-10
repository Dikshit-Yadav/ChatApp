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
    LOGOUT: "/auth/logout",
    AUTHCHECK: "/auth/check",
  },
  USER: {
    GETME: "/user/me",
    SEARCH_FRIENDS: "/user/search",
    GET_FRIENDS: "/user/friends",
    GET_SUGGESTION: "/user/suggestion",
    RESPOND_INVITE: "/invite/respond",
  },
  INVITE: {
    RESPOND: "/invite/respond",
    SEND: "/invite/send",
    GET: "/invite",
  },
  CONVERSATION: {
    BASE: "/conversation",

    // Private chat
    CREATE_OR_GET: "/conversation",
    GET_ALL: "/conversation",
    GET_BY_ID: (id: string) => `/conversation/${id}`,
    DELETE: (id: string) => `/conversation/${id}`,

    // Group chat
    CREATE_GROUP: "/conversation/group",
    GET_GROUP: (id: string) => `/conversation/group/${id}`,
    UPDATE_GROUP: (id: string) => `/conversation/group/${id}`,
    DELETE_GROUP: (id: string) => `/conversation/group/${id}`,

    // 🔥 FIXED
    ADD_MEMBER: "/conversation/group/add-member",
    REMOVE_MEMBER: "/conversation/group/remove-member",
  },

  MESSAGES: {
    BASE: "/message",
    GET_BY_CONVERSATION: (id: string) => `/message/${id}`,
    SEND: (id: string) => `/message/${id}`,
  },
  PROFILE: {
    GET_PROFILE: "/profile",
    UPDATE_PROFILE: "/profile",
    DELETE_PROFILE: "/profile",
    PROFILE_PIC: "/profile",
  },
};

export default api;