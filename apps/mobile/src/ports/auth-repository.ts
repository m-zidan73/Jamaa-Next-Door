export type MagicLinkResult = {
  errorMessage: string | null;
};

export type AuthSessionResult = {
  isAuthenticated: boolean;
  errorMessage: string | null;
};

export type AuthCallbackResult = AuthSessionResult & {
  handled: boolean;
};

export type AuthSessionListener = (isAuthenticated: boolean) => void;

export interface AuthRepository {
  isConfigured: boolean;
  completeSignInFromUrl(url: string): Promise<AuthCallbackResult>;
  restoreSession(): Promise<AuthSessionResult>;
  sendMagicLink(email: string): Promise<MagicLinkResult>;
  subscribeToSession(listener: AuthSessionListener): () => void;
}
