import { calculateStartsAt, createJamaahSchema } from "../src/features/jamaahs/create-jamaah-model";

describe("create jamaah scheduling", () => {
  it("converts a quick delay to an absolute UTC time", () => {
    expect(calculateStartsAt({ startDelay: "10", customDelay: "", scheduledAt: "" }, new Date("2026-07-30T10:00:00Z")).toISOString()).toBe("2026-07-30T10:10:00.000Z");
  });

  it("requires a location image", () => {
    expect(createJamaahSchema.safeParse({ prayer: "Fajr", startDelay: "5", customDelay: "", scheduledAt: "", location: "Central mosque", locationImageUri: "" }).success).toBe(false);
  });
});
