import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { JamaahImageStorage } from "../ports/jamaah-image-storage";
import { decodeBase64 } from "../utils/decode-base64";

const BUCKET = "jamaah-location-images";

function createUploadId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function createSupabaseJamaahImageStorage(client: SupabaseClient | null): JamaahImageStorage {
  return {
    async upload(image) {
      if (!client) {
        return { path: null, errorMessage: "Configure Supabase credentials before uploading." };
      }
      const { data: userData, error: userError } = await client.auth.getUser();
      if (userError || !userData.user) {
        return { path: null, errorMessage: "Your session has expired. Sign in again." };
      }
      const extension = image.contentType === "image/png" ? "png" : "jpg";
      const path = `${userData.user.id}/${createUploadId()}.${extension}`;
      try {
        const { error } = await client.storage.from(BUCKET).upload(path, decodeBase64(image.base64), {
          contentType: image.contentType,
          upsert: false,
        });
        return error ? { path: null, errorMessage: error.message } : { path, errorMessage: null };
      } catch (error) {
        return { path: null, errorMessage: error instanceof Error ? error.message : "Image upload failed." };
      }
    },
    async remove(path) {
      if (client) {
        await client.storage.from(BUCKET).remove([path]);
      }
    },
  };
}

export const supabaseJamaahImageStorage = createSupabaseJamaahImageStorage(supabase);
