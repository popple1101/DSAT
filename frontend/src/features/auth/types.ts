export type AuthResponse = {
  id: number;
  loginId: string;
  name: string;
  role: string;
  accessToken: string;
};

export type AuthApiResponse = {
  id?: number;
  userId?: number;
  loginId: string;
  name: string;
  role: string;
  accessToken: string;
};

export type SignupPayload = {
  loginId: string;
  password: string;
  name: string;
};
