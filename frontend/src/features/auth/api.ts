import { apiRequest } from "../../lib/api";
import type { AuthApiResponse, AuthResponse, SignupPayload } from "./types";

function normalizeAuthResponse(response: AuthApiResponse): AuthResponse {
  return {
    id: response.id ?? response.userId ?? 0,
    loginId: response.loginId,
    name: response.name,
    role: response.role,
    accessToken: response.accessToken,
  };
}

export const authApi = {
  async login(payload: { loginId: string; password: string }) {
    const response = await apiRequest<AuthApiResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return normalizeAuthResponse(response);
  },
  async signup(payload: SignupPayload) {
    const response = await apiRequest<AuthApiResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return normalizeAuthResponse(response);
  },
};
