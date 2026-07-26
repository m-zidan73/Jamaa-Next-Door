import { z } from "zod";
export const JoinGuardSchema = z.object({
    verificationStatus: z.enum(["not_submitted", "pending", "approved", "rejected"]),
    isJoined: z.boolean(),
    hasExactAccess: z.boolean(),
});
export function canJoinJamaah(status) {
    return status === "approved";
}
export function canViewExactLocation(input) {
    const parsed = JoinGuardSchema.parse(input);
    return parsed.verificationStatus === "approved" && parsed.isJoined && parsed.hasExactAccess;
}
export function disabledJoinReason(status) {
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
