export const TOKEN_ISSUER = Symbol('TOKEN_ISSUER');

export interface TokenIssuerPayload {
  userId: string;
  email: string;
}

export interface TokenIssuerResult {
  accessToken: string;
  refreshToken: string;
}

export interface TokenIssuerPort {
  issue(payload: TokenIssuerPayload): Promise<TokenIssuerResult>;
}
