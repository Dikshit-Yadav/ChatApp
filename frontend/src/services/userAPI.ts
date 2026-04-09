import api,{ API_ENDPOINTS } from "./api";

export const searchUsers = (search: string) => {
  return api.get(`${API_ENDPOINTS.USER.SEARCH_FRIENDS}?search=${search}`);
};

export const getFriends = () => {
  return api.get(API_ENDPOINTS.USER.GET_FRIENDS);
};

export const getSuggestions = () => {
  return api.get(API_ENDPOINTS.USER.GET_SUGGESTION);
};


export const respondInvite = (invitationId: string, status: string) => {
  return api.post(API_ENDPOINTS.USER.RESPOND_INVITE, { invitationId, status });
};

export const getMe = () => {
  return api.get(API_ENDPOINTS.USER.GETME);
};