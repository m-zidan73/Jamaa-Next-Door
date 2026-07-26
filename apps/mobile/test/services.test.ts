import { createSupabaseAuthRepository } from "../src/services/supabase-auth-repository";
import { createSupabaseJamaahRepository } from "../src/services/supabase-jamaah-repository";

const CONFIGURATION_MESSAGE = "Configure Supabase credentials in .env before testing authentication.";

describe("service adapters without runtime credentials", () => {
  it("reports auth configuration through the repository port", async () => {
    const repository = createSupabaseAuthRepository(null);

    expect(repository.isConfigured).toBe(false);
    await expect(repository.sendMagicLink("user@example.com")).resolves.toEqual({
      errorMessage: CONFIGURATION_MESSAGE,
    });
  });

  it("preserves configless jamaah behavior without touching location", async () => {
    const getCurrentCoordinates = jest.fn();
    const repository = createSupabaseJamaahRepository(null, { getCurrentCoordinates });

    await expect(repository.getLatestVerificationStatus()).resolves.toBe("not_submitted");
    await expect(repository.fetchDiscoverableJamaahs()).rejects.toThrow(
      "Configure Supabase credentials in .env before loading jama'ahs.",
    );
    await expect(
      repository.publishJamaah({
        prayerName: "Fajr",
        startsAtIso: "2026-07-26T05:00:00.000Z",
        exactAddress: "Central Mosque",
      }),
    ).rejects.toThrow("Configure Supabase credentials in .env before publishing a jama'ah.");
    await expect(repository.joinJamaah("demo")).rejects.toThrow(
      "Configure Supabase credentials in .env before joining a jama'ah.",
    );
    expect(getCurrentCoordinates).not.toHaveBeenCalled();
  });
});
