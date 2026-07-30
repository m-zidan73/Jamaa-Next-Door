import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { ProfileRepository, SubmitProfileResult } from "../ports/profile-repository";

const SELFIE_BUCKET = "selfie-verifications";

function decodeBase64(base64: string): ArrayBuffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const normalized = base64.replace(/\s/g, "").replace(/=+$/, "");
  const output = new Uint8Array(Math.floor((normalized.length * 6) / 8));
  let accumulator = 0;
  let bits = 0;
  let offset = 0;

  for (const character of normalized) {
    const value = alphabet.indexOf(character);

    if (value < 0) {
      throw new Error("The captured selfie contains invalid image data.");
    }

    accumulator = (accumulator << 6) | value;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      output[offset] = (accumulator >> bits) & 0xff;
      offset += 1;
    }
  }

  return output.buffer.slice(0, offset);
}

function failure(error: unknown): SubmitProfileResult {
  return {
    errorMessage: error instanceof Error ? error.message : "Profile submission failed. Please try again.",
  };
}

export function createSupabaseProfileRepository(client: SupabaseClient | null): ProfileRepository {
  return {
    async hasSubmittedProfile() {
      if (!client) {
        return false;
      }

      const { data: userResult, error: userError } = await client.auth.getUser();
      const user = userResult.user;

      if (userError || !user) {
        return false;
      }

      const { data, error } = await client
        .from("selfie_verifications")
        .select("id")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return !error && Boolean(data);
    },

    async submitProfile(input) {
      if (!client) {
        return { errorMessage: "Configure Supabase credentials before submitting a profile." };
      }

      try {
        const { data: userResult, error: userError } = await client.auth.getUser();
        const user = userResult.user;

        if (userError) {
          return failure(userError);
        }

        if (!user?.email) {
          return { errorMessage: "Your session has expired. Request a new magic link." };
        }

        const storagePath = `${user.id}/profile.jpg`;
        const bucket = client.storage.from(SELFIE_BUCKET);
        const { error: uploadError } = await bucket.upload(
          storagePath,
          decodeBase64(input.selfie.base64),
          {
            contentType: input.selfie.contentType,
            upsert: true,
          },
        );

        if (uploadError) {
          return failure(uploadError);
        }

        const { error: profileError } = await client.from("profiles").upsert(
          {
            id: user.id,
            display_name: input.displayName.trim(),
            email: user.email,
            phone: input.phone?.trim() || null,
            is_adult_confirmed: input.isAdultConfirmed,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );

        if (profileError) {
          await bucket.remove([storagePath]);
          return failure(profileError);
        }

        const { error: verificationError } = await client.from("selfie_verifications").insert({
          profile_id: user.id,
          storage_path: storagePath,
          status: "pending",
        });

        if (verificationError) {
          await bucket.remove([storagePath]);
          return failure(verificationError);
        }

        return { errorMessage: null };
      } catch (error) {
        return failure(error);
      }
    },
  };
}

export const supabaseProfileRepository = createSupabaseProfileRepository(supabase);
