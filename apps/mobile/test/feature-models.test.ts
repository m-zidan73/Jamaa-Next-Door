import {
  createJamaahSchema,
  formatStartDelay,
} from "../src/features/jamaahs/create-jamaah-model";
import { profileSetupSchema } from "../src/features/profile/profile-setup-model";

const VALID_FORM = {
  prayer: "Fajr",
  startDelay: "5",
  customDelay: "",
  location: "Central Mosque",
  locationImageUri: "",
} as const;

describe("create jamaah model", () => {
  it("accepts the existing preset-delay form values", () => {
    expect(createJamaahSchema.safeParse(VALID_FORM).success).toBe(true);
  });

  it("requires a positive whole-minute custom delay", () => {
    const result = createJamaahSchema.safeParse({
      ...VALID_FORM,
      startDelay: "custom",
      customDelay: "0",
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected custom delay validation to fail.");
    }
    expect(result.error.issues[0]?.path).toEqual(["customDelay"]);
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
