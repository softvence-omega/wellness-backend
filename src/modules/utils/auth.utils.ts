export interface AppleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  id_token: string;
}

export interface AppleUserInfo {
  email: string;
  emailVerified: boolean;
  appleId: string;
  name?: string;
}

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}
