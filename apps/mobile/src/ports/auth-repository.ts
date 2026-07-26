export type MagicLinkResult = {
  errorMessage: string | null;
};

export interface AuthRepository {
  isConfigured: boolean;
  sendMagicLink(email: string): Promise<MagicLinkResult>;
}
