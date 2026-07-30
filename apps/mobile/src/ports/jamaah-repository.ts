import type { VerificationStatus } from "@jnd/core";

export type JamaahStatus = "scheduled" | "active" | "concluded" | "cancelled";

export type DiscoverableJamaah = {
  id: string;
  prayer_name: string;
  status: JamaahStatus;
  starts_at: string;
  approximate_lat: number | null;
  approximate_lng: number | null;
  participant_count: number;
};

export type JamaahDetails = DiscoverableJamaah & {
  exact_address: string | null;
  exact_lat: number | null;
  exact_lng: number | null;
  exact_photo_path: string | null;
  exact_photo_url: string | null;
  is_host: boolean;
  is_participant: boolean;
};

export type PublishJamaahInput = {
  prayerName: string;
  startsAtIso: string;
  exactAddress: string;
  exactPhotoPath?: string;
};

export type RepositoryResult<T> = {
  data: T | null;
  errorMessage: string | null;
};

export interface JamaahRepository {
  getLatestVerificationStatus(): Promise<VerificationStatus>;
  fetchDiscoverableJamaahs(): Promise<RepositoryResult<DiscoverableJamaah[]>>;
  fetchJamaahDetails(jamaahId: string): Promise<RepositoryResult<JamaahDetails>>;
  publishJamaah(input: PublishJamaahInput): Promise<RepositoryResult<{ jamaahId: string }>>;
  joinJamaah(jamaahId: string): Promise<RepositoryResult<true>>;
  cancelJamaah(jamaahId: string): Promise<RepositoryResult<true>>;
  concludeJamaah(jamaahId: string): Promise<RepositoryResult<true>>;
  subscribeToChanges(onChange: () => void): () => void;
}
