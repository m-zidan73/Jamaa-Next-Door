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

describe("Supabase authentication callbacks", () => {
  function createAuthClient() {
    return {
      auth: {
        exchangeCodeForSession: jest.fn().mockResolvedValue({ data: { session: {} }, error: null }),
        getSession: jest.fn().mockResolvedValue({ data: { session: {} }, error: null }),
        onAuthStateChange: jest.fn(),
        setSession: jest.fn().mockResolvedValue({ data: { session: {} }, error: null }),
        signInWithOtp: jest.fn(),
      },
    };
  }

  it("exchanges PKCE callback codes", async () => {
    const client = createAuthClient();
    const repository = createSupabaseAuthRepository(client as never);

    await expect(
      repository.completeSignInFromUrl("jnd://auth/callback?code=pkce-code"),
    ).resolves.toEqual({
      handled: true,
      isAuthenticated: true,
      errorMessage: null,
    });
    expect(client.auth.exchangeCodeForSession).toHaveBeenCalledWith("pkce-code");
  });

  it("restores legacy token callbacks", async () => {
    const client = createAuthClient();
    const repository = createSupabaseAuthRepository(client as never);

    await repository.completeSignInFromUrl(
      "jnd://#access_token=access-token&refresh_token=refresh-token",
    );

    expect(client.auth.setSession).toHaveBeenCalledWith({
      access_token: "access-token",
      refresh_token: "refresh-token",
    });
  });

  it("returns provider callback errors without calling Supabase", async () => {
    const client = createAuthClient();
    const repository = createSupabaseAuthRepository(client as never);

    await expect(
      repository.completeSignInFromUrl("jnd://?error_description=Link%20expired"),
    ).resolves.toEqual({
      handled: true,
      isAuthenticated: false,
      errorMessage: "Link expired",
    });
    expect(client.auth.exchangeCodeForSession).not.toHaveBeenCalled();
    expect(client.auth.setSession).not.toHaveBeenCalled();
  });
});
describe("Jamaah Realtime subscriptions", () => {
  it("uses independent channel names for concurrent screens", () => {
    const channels: string[] = [];
    const channel = { on: jest.fn().mockReturnThis(), subscribe: jest.fn().mockReturnThis() };
    const client = {
      channel: jest.fn((name: string) => { channels.push(name); return channel; }),
      removeChannel: jest.fn(),
    };
    const repository = createSupabaseJamaahRepository(client as never, { getCurrentCoordinates: jest.fn() });

    const unsubscribeHome = repository.subscribeToChanges(jest.fn());
    const unsubscribeDetails = repository.subscribeToChanges(jest.fn());

    expect(channels).toHaveLength(2);
    expect(channels[0]).not.toBe(channels[1]);
    unsubscribeHome();
    unsubscribeDetails();
    expect(client.removeChannel).toHaveBeenCalledTimes(2);
  });
});