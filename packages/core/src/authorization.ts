import { z } from "zod";
import type { VerificationStatus } from "./types";

export const JoinGuardSchema = z.object({
  verificationStatus: z.enum(["not_submitted", "pending", "approved", "rejected"]),
  isJoined: z.boolean(),
  hasExactAccess: z.boolean(),
});

export type JoinGuard = z.infer<typeof JoinGuardSchema>;

export function canJoinJamaah(status: VerificationStatus) {
  return status === "approved";
}

export function canViewExactLocation(input: JoinGuard) {
  const parsed = JoinGuardSchema.parse(input);
  return parsed.verificationStatus === "approved" && parsed.isJoined && parsed.hasExactAccess;
}

export function disabledJoinReason(status: VerificationStatus) {
  switch (status) {
    case "approved":
      return null;
    case "pending":
      return "verification_pending";
    case "rejected":
      return "verification_rejected";
    default:
      return "verification_required";
  }
}
