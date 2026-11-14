export interface UserInfo {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  roleCode: string;
  cinemaId: number | null;
  loyaltyPoints: number;
}

export interface LoginPayload {
  accessToken: string;
  tokenType: string;
  expiresInMs: number;
  user: UserInfo;
}

export interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface GoogleAuthUrl {
  authorizationUrl: string;
  authUrl?: string;
}

export interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

export type LoginFormErrors = Partial<
  Record<'username' | 'password' | 'general', string>
>;
