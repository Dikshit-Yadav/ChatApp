import { create } from "zustand";
import { getProfile, updateProfile } from "../services/profileAPI";
import { toast } from "react-toastify";

interface Profile {
  username: string;
  email: string;
  phone: string;
  profilePic: string;
}

interface ProfileState {
  profile: Profile | null;
  loading: boolean;

  fetchProfile: (userId: string) => Promise<void>;
  updateUserProfile: (userId: string, data: FormData) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loading: false,

  // fetch profile
  fetchProfile: async (userId) => {
    try {
      set({ loading: true });
      const res = await getProfile(userId);
      set({ profile: res.data, loading: false });
    } catch (err) {
      toast.error("Error fetching profile");
      console.error("Error fetching profile", err);
      set({ loading: false });
    }
  },

  // update profile
  updateUserProfile: async (userId, data) => {
    try {
      set({ loading: true });
      await updateProfile(userId, data);
      const res = await getProfile(userId);
      set({ profile: res.data, loading: false });
    } catch (err) {
      toast.error("Error updating profile");
      console.error("Error updating profile", err);
      set({ loading: false });
    }
  },
}));