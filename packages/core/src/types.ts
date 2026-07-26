export type VerificationStatus = "not_submitted" | "pending" | "approved" | "rejected";

export type JamaahParticipant = {
  profileId: string;
  joinedAt: string;
  isActive: boolean;
  wasSecondaryHost: boolean;
};

export type JamaahRecord = {
  id: string;
  hostProfileId: string | null;
  startsAtIso: string;
  status: "scheduled" | "active" | "concluded";
};
