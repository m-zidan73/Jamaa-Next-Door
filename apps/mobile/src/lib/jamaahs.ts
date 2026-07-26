import * as Location from "expo-location";
import { supabase } from "./supabase";
import type { VerificationStatus } from "@jnd/core";

export type DiscoverableJamaah = {
  id: string;
  prayer_name: string;
  status: "scheduled" | "active" | "concluded";
  starts_at: string;
  approximate_lat: number | null;
  approximate_lng: number | null;
};

export async function getLatestVerificationStatus(): Promise<VerificationStatus> {
  if (!supabase) {
    return "not_submitted";
  }

  const { data: userResult } = await supabase.auth.getUser();
  const user = userResult.user;

  if (!user) {
    return "not_submitted";
  }

  const { data, error } = await supabase
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
}

export async function fetchDiscoverableJamaahs() {
  if (!supabase) {
    throw new Error("Configure Supabase credentials in .env before loading jama'ahs.");
  }

  return supabase.rpc("list_discoverable_jamaahs");
}

export async function publishJamaah(input: {
  prayerName: string;
  startsAtIso: string;
  exactAddress: string;
  exactPhotoPath?: string | null;
}) {
  if (!supabase) {
    throw new Error("Configure Supabase credentials in .env before publishing a jama'ah.");
  }

  const permission = await Location.requestForegroundPermissionsAsync();

  if (!permission.granted) {
    throw new Error("Location permission is required to publish a jama'ah.");
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return supabase.rpc("create_jamaah", {
    p_prayer_name: input.prayerName,
    p_starts_at: input.startsAtIso,
    p_exact_address: input.exactAddress,
    p_exact_photo_path: input.exactPhotoPath ?? null,
    p_approximate_lat: position.coords.latitude,
    p_approximate_lng: position.coords.longitude,
    p_exact_lat: position.coords.latitude,
    p_exact_lng: position.coords.longitude,
  });
}

export async function joinJamaah(jamaahId: string) {
  if (!supabase) {
    throw new Error("Configure Supabase credentials in .env before joining a jama'ah.");
  }

  return supabase.rpc("join_jamaah", {
    target_jamaah_id: jamaahId,
  });
}
