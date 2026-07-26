import { describe, expect, it } from "vitest";
import { selectNextHost, transferHostOnLeave } from "../src/host-succession";

describe("host succession", () => {
  it("prefers the hidden secondary host", () => {
    const nextHost = selectNextHost([
      {
        profileId: "early",
        joinedAt: "2026-06-21T10:00:00.000Z",
        isActive: true,
        wasSecondaryHost: false,
      },
      {
        profileId: "secondary",
        joinedAt: "2026-06-21T10:01:00.000Z",
        isActive: true,
        wasSecondaryHost: true,
      },
    ]);

    expect(nextHost?.profileId).toBe("secondary");
  });

  it("returns null when nobody remains", () => {
    const result = transferHostOnLeave(
      {
        id: "j1",
        hostProfileId: "host",
        startsAtIso: "2026-06-21T10:00:00.000Z",
        status: "scheduled",
      },
      [],
    );

    expect(result.nextHostProfileId).toBeNull();
  });
});
