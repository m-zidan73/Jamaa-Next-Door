import { describe, expect, it } from "vitest";
import { getJamaahPhase, shouldConclude } from "../src/timing";

describe("timing", () => {
  it("stays active for the first five minutes after start", () => {
    expect(
      getJamaahPhase("2026-06-21T10:00:00.000Z", "2026-06-21T10:04:00.000Z").phase,
    ).toBe("active");
  });

  it("concludes after the active window", () => {
    expect(shouldConclude("2026-06-21T10:00:00.000Z", "2026-06-21T10:05:00.000Z")).toBe(true);
  });
});
