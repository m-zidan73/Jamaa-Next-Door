import type { SupabaseClient } from "@supabase/supabase-js";
import type { VerificationStatus } from "@jnd/core";
import { supabase } from "../lib/supabase";
import type {
  DiscoverableJamaah,
  JamaahDetails,
  JamaahRepository,
  RepositoryResult,
} from "../ports/jamaah-repository";
import type { LocationService } from "../ports/location-service";
import { expoLocationService } from "./expo-location-service";

let realtimeChannelSequence = 0;

function result<T>(data: T | null, error: { message?: string } | null): RepositoryResult<T> {
  return { data, errorMessage: error?.message ?? null };
}

function configured(client: SupabaseClient | null, action: string): asserts client is SupabaseClient {
  if (!client) {
    throw new Error(`Configure Supabase credentials in .env before ${action}.`);
  }
}

export function createSupabaseJamaahRepository(
  client: SupabaseClient | null,
  locationService: LocationService,
): JamaahRepository {
  return {
    async getLatestVerificationStatus() {
      if (!client) return "not_submitted";
      const { data: userResult } = await client.auth.getUser();
      if (!userResult.user) return "not_submitted";
      const { data, error } = await client
        .from("selfie_verifications")
        .select("status")
        .eq("profile_id", userResult.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return error || !data ? "not_submitted" : data.status as VerificationStatus;
    },

    async fetchDiscoverableJamaahs() {
      configured(client, "loading jama'ahs");
      const { data, error } = await client.rpc("list_discoverable_jamaahs");
      return result((data ?? []) as DiscoverableJamaah[], error);
    },

    async fetchJamaahDetails(jamaahId) {
      configured(client, "loading jama'ah details");
      const { data, error } = await client.rpc("get_jamaah_details", { target_jamaah_id: jamaahId });
      const row = (data?.[0] ?? null) as JamaahDetails | null;
      if (error || !row) return result<JamaahDetails>(null, error ?? { message: "Jama'ah not found." });
      let exactPhotoUrl: string | null = null;
      if (row.exact_photo_path) {
        const signed = await client.storage.from("jamaah-location-images").createSignedUrl(row.exact_photo_path, 600);
        if (signed.error) return result<JamaahDetails>(null, signed.error);
        exactPhotoUrl = signed.data.signedUrl;
      }
      return result({ ...row, exact_photo_url: exactPhotoUrl }, null);
    },

    async publishJamaah(input) {
      configured(client, "publishing a jama'ah");
      const coordinates = await locationService.getCurrentCoordinates();
      const { data, error } = await client.rpc("create_jamaah", {
        p_prayer_name: input.prayerName,
        p_starts_at: input.startsAtIso,
        p_exact_address: input.exactAddress,
        p_exact_photo_path: input.exactPhotoPath ?? null,
        p_approximate_lat: coordinates.latitude,
        p_approximate_lng: coordinates.longitude,
        p_exact_lat: coordinates.latitude,
        p_exact_lng: coordinates.longitude,
      });
      const id = typeof data === "string" ? data : data?.id;
      return result(id ? { jamaahId: id } : null, error ?? (!id ? { message: "Jama'ah creation returned no ID." } : null));
    },

    async joinJamaah(jamaahId) {
      configured(client, "joining a jama'ah");
      const { error } = await client.rpc("join_jamaah", { target_jamaah_id: jamaahId });
      return result(error ? null : true, error);
    },

    async cancelJamaah(jamaahId) {
      configured(client, "cancelling a jama'ah");
      const { error } = await client.rpc("cancel_jamaah", { target_jamaah_id: jamaahId });
      return result(error ? null : true, error);
    },

    async concludeJamaah(jamaahId) {
      configured(client, "concluding a jama'ah");
      const { error } = await client.rpc("conclude_jamaah", { target_jamaah_id: jamaahId });
      return result(error ? null : true, error);
    },

    subscribeToChanges(onChange) {
      if (!client) return () => undefined;
      realtimeChannelSequence += 1;
      const channel = client.channel(`jamaahs-live-${realtimeChannelSequence}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "jamaahs" }, onChange)
        .on("postgres_changes", { event: "*", schema: "public", table: "jamaah_participants" }, onChange)
        .subscribe();
      return () => { void client.removeChannel(channel); };
    },
  };
}

export const supabaseJamaahRepository = createSupabaseJamaahRepository(supabase, expoLocationService);
