import { create } from "zustand";
import { searchUsers, getSuggestions } from "../services/userAPI";
import { sendInvite, getInvitations, respondInvite } from "../services/invitationAPI";
import { socket } from "../contex/socket";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


interface User {
  _id: string;
  username: string;
  email: string;
  profilePic?: string;
  friends?: string[];
  invitationStatus?: "pending" | "none";
}

interface FriendState {
  searchResults: User[];
  requests: any[];
  suggestions: User[];
  loading: boolean;

  fetchRequests: () => Promise<void>;
  fetchSuggestions: () => Promise<void>;
  handleSearch: (query: string) => Promise<void>;
  sendInvite: (receiverId: string) => Promise<void>;
  respondInvite: (invitationId: string, status: string) => Promise<void>;
}

export const useFriendStore = create<FriendState>((set, get) => ({
  searchResults: [],
  requests: [],
  suggestions: [],
  loading: false,

  fetchRequests: async () => {
    try {
      const res = await getInvitations();
      set({ requests: res.data });
    } catch (err) {
      toast.error("Error fetching requests");
      console.error(err);
    }
  },

  fetchSuggestions: async () => {
    try {
      const res = await getSuggestions();
      set({ suggestions: res.data });
    } catch (err) {
      toast.error("Error fetching suggestions");
      console.error(err);
    }
  },

  handleSearch: async (query: string) => {
    if (!query) return set({ searchResults: [] });

    try {
      set({ loading: true });
      const res = await searchUsers(query);
      set({ searchResults: res.data });
    } catch (err) {
      toast.error("Error searching users");
      console.error(err);
    } finally {
      set({ loading: false });
    }
  },

  sendInvite: async (receiverId: string) => {
    try {
      await sendInvite(receiverId);
      set((state) => ({
        searchResults: state.searchResults.map((u) =>
          u._id === receiverId ? { ...u, invitationStatus: "pending" } : u
        ),
      }));
    } catch (err: any) {
      toast.error(err.response?.data?.message|| "Error sending invite");
      console.error(err.response?.data?.message);
    }
  },

  respondInvite: async (invitationId: string, status: string) => {
    try {
      await respondInvite(invitationId, status);
      set((state) => ({
        requests: state.requests.filter((req) => req._id !== invitationId),
      }));
    } catch (err: any) {
      toast.error(err.response?.data?.message|| "Error responding invite");
      console.error(err.response?.data?.message);
    }
  },
}));

// socket for invite
socket.on("new-invite", (data) => {
  useFriendStore.setState((state) => ({
    requests: [data.invite, ...state.requests],
  }));
  toast(`${data.sender.username} sent you a friend request`);
});