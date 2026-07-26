import { supabase } from "../lib/supabase";
import type { AuthRepository } from "../ports/auth-repository";

type SupabaseAuthClient = Pick<NonNullable<typeof supabase>, "auth">;

export function createSupabaseAuthRepository(client: SupabaseAuthClient | null): AuthRepository {
  return {
    isConfigured: client !== null,
    async sendMagicLink(email) {
      if (!client) {
        return { errorMessage: "Configure Supabase credentials in .env before testing authentication." };
      }

      const { error } = await client.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: "jnd://",
        },
      });

      return { errorMessage: error?.message ?? null };
    },
  };
}

export const supabaseAuthRepository = createSupabaseAuthRepository(supabase);
