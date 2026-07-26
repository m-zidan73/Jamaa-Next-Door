import type { SupabaseClient } from "@supabase/supabase-js";
import type { VerificationStatus } from "@jnd/core";
import { supabase } from "../lib/supabase";
import type {
  DiscoverableJamaah,
  JamaahRepository,
  RepositoryResult,
} from "../ports/jamaah-repository";
import type { LocationService } from "../ports/location-service";
import { expoLocationService } from "./expo-location-service";

export function createSupabaseJamaahRepository(
  client: SupabaseClient | null,
  locationService: LocationService,
): JamaahRepository {
  return {
    async getLatestVerificationStatus() {
      if (!client) {
        return "not_submitted";
      }

      const { data: userResult } = await client.auth.getUser();
      const user = userResult.user;

      if (!user) {
        return "not_submitted";
      }

      const { data, error } = await client
        .from("selfie_verifications")
        .select("status")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return "not_submitted";
      }

      return data.status as VerificationStatus;
    },

    async fetchDiscoverableJamaahs() {
      if (!client) {
        throw new Error("Configure Supabase credentials in .env before loading jama'ahs.");
      }

      return (await client.rpc("list_discoverable_jamaahs")) as RepositoryResult<DiscoverableJamaah[]>;
    },

    async publishJamaah(input) {
      if (!client) {
        throw new Error("Configure Supabase credentials in .env before publishing a jama'ah.");
      }

      const coordinates = await locationService.getCurrentCoordinates();

      return (await client.rpc("create_jamaah", {
        p_prayer_name: input.prayerName,
        p_starts_at: input.startsAtIso,
        p_exact_address: input.exactAddress,
        p_exact_photo_path: input.exactPhotoPath ?? null,
        p_approximate_lat: coordinates.latitude,
        p_approximate_lng: coordinates.longitude,
        p_exact_lat: coordinates.latitude,
        p_exact_lng: coordinates.longitude,
      })) as RepositoryResult;
    },

    async joinJamaah(jamaahId) {
      if (!client) {
        throw new Error("Configure Supabase credentials in .env before joining a jama'ah.");
      }

      return (await client.rpc("join_jamaah", {
        target_jamaah_id: jamaahId,
      })) as RepositoryResult;
    },
  };
}

export const supabaseJamaahRepository = createSupabaseJamaahRepository(supabase, expoLocationService);
