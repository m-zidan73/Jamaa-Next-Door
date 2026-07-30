import { createJamaahSchema, formatStartDelay } from "../src/features/jamaahs/create-jamaah-model";
import { profileSetupSchema } from "../src/features/profile/profile-setup-model";

const VALID_FORM = {
  prayer: "Fajr", startDelay: "5", customDelay: "", scheduledAt: "",
  location: "Central Mosque", locationImageUri: "file://location.jpg",
} as const;

describe("create jamaah model", () => {
  it("accepts preset-delay values with a required image", () => {
    expect(createJamaahSchema.safeParse(VALID_FORM).success).toBe(true);
  });
  it("requires a positive whole-minute custom delay", () => {
    const result = createJamaahSchema.safeParse({ ...VALID_FORM, startDelay: "custom", customDelay: "0" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.find((issue) => issue.path[0] === "customDelay")?.path).toEqual(["customDelay"]);
  });
  it("formats preset and custom delays without UI dependencies", () => {
    expect(formatStartDelay({ startDelay: "8" })).toBe("8 minutes");
    expect(formatStartDelay({ startDelay: "custom", customDelay: "12" })).toBe("12 minutes");
  });
});

describe("profile setup model", () => {
  it("requires the existing adult consent", () => {
    expect(profileSetupSchema.safeParse({ displayName: "Mo", phone: "", isAdult: true }).success).toBe(true);
    expect(profileSetupSchema.safeParse({ displayName: "Mo", phone: "", isAdult: false }).success).toBe(false);
  });
});
