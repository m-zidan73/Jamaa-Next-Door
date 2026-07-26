import { parseAuthCallback } from "../features/auth/auth-callback";
import { supabase } from "../lib/supabase";
import type { AuthRepository } from "../ports/auth-repository";

type SupabaseAuth = NonNullable<typeof supabase>["auth"];
type SupabaseAuthClient = {
  auth: Pick<
    SupabaseAuth,
    | "exchangeCodeForSession"
    | "getSession"
    | "onAuthStateChange"
    | "setSession"
    | "signInWithOtp"
  >;
};

const CONFIGURATION_MESSAGE =
  "Configure Supabase credentials in .env before testing authentication.";

export function createSupabaseAuthRepository(client: SupabaseAuthClient | null): AuthRepository {
  return {
    isConfigured: client !== null,
    async completeSignInFromUrl(url) {
      if (!client) {
        return {
          handled: false,
          isAuthenticated: false,
          errorMessage: CONFIGURATION_MESSAGE,
        };
      }

      const callback = parseAuthCallback(url);
      if (callback.type === "none") {
        return { handled: false, isAuthenticated: false, errorMessage: null };
      }
      if (callback.type === "error") {
        return {
          handled: true,
          isAuthenticated: false,
          errorMessage: callback.message,
        };
      }

      const result =
        callback.type === "code"
          ? await client.auth.exchangeCodeForSession(callback.code)
          : await client.auth.setSession({
              access_token: callback.accessToken,
              refresh_token: callback.refreshToken,
            });

      return {
        handled: true,
        isAuthenticated: Boolean(result.data.session),
        errorMessage: result.error?.message ?? null,
      };
    },
    async restoreSession() {
      if (!client) {
        return { isAuthenticated: false, errorMessage: null };
      }

      const { data, error } = await client.auth.getSession();
      return {
        isAuthenticated: Boolean(data.session),
        errorMessage: error?.message ?? null,
      };
    },
    async sendMagicLink(email) {
      if (!client) {
        return { errorMessage: CONFIGURATION_MESSAGE };
      }

      const { error } = await client.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: "jnd://auth/callback",
        },
      });

      return { errorMessage: error?.message ?? null };
    },
    subscribeToSession(listener) {
      if (!client) {
        return () => undefined;
      }

      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((_event, session) => {
        listener(Boolean(session));
      });

      return () => subscription.unsubscribe();
    },
  };
}

export const supabaseAuthRepository = createSupabaseAuthRepository(supabase);
