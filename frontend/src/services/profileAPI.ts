import api, { API_ENDPOINTS } from "./api";

// get profile
export const getProfile = (userId: string) => {
  return api.get(`${API_ENDPOINTS.PROFILE.GET_PROFILE}/${userId}`);
};

// update profile
export const updateProfile = (userId: string, formData: FormData) => {
  return api.put(`${API_ENDPOINTS.PROFILE.UPDATE_PROFILE}/${userId}/edit`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// delete profile
export const deleteProfile = (userId: string) => {
  return api.delete(`${API_ENDPOINTS.PROFILE.DELETE_PROFILE}/${userId}/delete`);
};

// update profile pic
export const updateProfilePic = (userId: string, formData: FormData) => {
  return api.patch(`${API_ENDPOINTS.PROFILE.PROFILE_PIC}/${userId}/update-pic`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};  