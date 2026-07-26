import { describe, expect, it } from "vitest";
import { canJoinJamaah, canViewExactLocation, disabledJoinReason } from "../src/authorization";

describe("authorization", () => {
  it("allows only approved users to join", () => {
    expect(canJoinJamaah("approved")).toBe(true);
    expect(canJoinJamaah("pending")).toBe(false);
  });

  it("requires joined approved access for exact locations", () => {
    expect(
      canViewExactLocation({
        verificationStatus: "approved",
        isJoined: true,
        hasExactAccess: true,
      }),
    ).toBe(true);

    expect(
      canViewExactLocation({
        verificationStatus: "approved",
        isJoined: false,
        hasExactAccess: true,
      }),
    ).toBe(false);
  });

  it("returns a localized reason key for disabled joins", () => {
    expect(disabledJoinReason("not_submitted")).toBe("verification_required");
  });
});
