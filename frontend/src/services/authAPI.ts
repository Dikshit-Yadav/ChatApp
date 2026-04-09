import api, { API_ENDPOINTS } from "./api";
import type {
  AuthPayload,
  RegisterPayload,
  AuthResponse,
  OtpResponse,
} from "../types/auth.ts";

export const authApi = {
  // login
  loginUser: (data: AuthPayload) => {
    return api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
  },

  // register
  registerUser: (data: RegisterPayload) => {
    return api.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
  },

  // send otp (register)
  sendOtp: (email: string) => {
    return api.post<OtpResponse>(API_ENDPOINTS.AUTH.SEND_OTP, { email });
  },

  // forgot password otp
  sendOtpForgot: (email: string) => {
    return api.post<OtpResponse>(API_ENDPOINTS.AUTH.SEND_OTP_FORGOT, { email });
  },

  // verify otp
  verifyOtp: (email: string, otp: string) => {
    return api.post<OtpResponse>(API_ENDPOINTS.AUTH.VERIFY_OTP, { email, otp });
  },

  //reset pass
  resetPassword: (email: string, password: string) => {
    return api.patch<AuthResponse>(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email, password });
  },

  //logout
  logout: () => {
    return api.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  //authcheck
  authCheck: () => {
    return api.get(API_ENDPOINTS.AUTH.AUTHCHECK);
  },


};