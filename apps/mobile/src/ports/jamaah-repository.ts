import type { VerificationStatus } from "@jnd/core";

export type DiscoverableJamaah = {
  id: string;
  prayer_name: string;
  status: "scheduled" | "active" | "concluded";
  starts_at: string;
  approximate_lat: number | null;
  approximate_lng: number | null;
};

export type PublishJamaahInput = {
  prayerName: string;
  startsAtIso: string;
  exactAddress: string;
  exactPhotoPath?: string | null;
};

export type RepositoryResult<T = unknown> = {
  data: T | null;
  error: unknown;
};

export interface JamaahRepository {
  getLatestVerificationStatus(): Promise<VerificationStatus>;
  fetchDiscoverableJamaahs(): Promise<RepositoryResult<DiscoverableJamaah[]>>;
  publishJamaah(input: PublishJamaahInput): Promise<RepositoryResult>;
  joinJamaah(jamaahId: string): Promise<RepositoryResult>;
}
