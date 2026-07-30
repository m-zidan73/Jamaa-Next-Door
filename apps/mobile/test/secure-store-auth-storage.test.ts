import * as SecureStore from "expo-secure-store";
import { secureStoreAuthStorage } from "../src/services/secure-store-auth-storage";

jest.mock("expo-secure-store", () => ({
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

const storedValues = new Map<string, string>();

describe("secure auth session storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storedValues.clear();
    jest.mocked(SecureStore.getItemAsync).mockImplementation(async (key) => storedValues.get(key) ?? null);
    jest.mocked(SecureStore.setItemAsync).mockImplementation(async (key, value) => {
      storedValues.set(key, value);
    });
    jest.mocked(SecureStore.deleteItemAsync).mockImplementation(async (key) => {
      storedValues.delete(key);
    });
  });

  it("round-trips a session larger than SecureStore's single-value limit", async () => {
    const session = JSON.stringify({ access_token: "a".repeat(3500), refresh_token: "r".repeat(1200) });

    await secureStoreAuthStorage.setItem("supabase-session", session);

    expect(await secureStoreAuthStorage.getItem("supabase-session")).toBe(session);
    expect(storedValues.has("supabase-session")).toBe(false);
    expect(
      [...storedValues.entries()]
        .filter(([key]) => key.includes(".chunk-"))
        .every(([, value]) => value.length <= 450),
    ).toBe(true);
    expect([...storedValues.keys()].every((key) => /^[A-Za-z0-9._-]+$/.test(key))).toBe(true);
  });

  it("reads and removes legacy single-value sessions", async () => {
    storedValues.set("legacy-session", "legacy-value");

    expect(await secureStoreAuthStorage.getItem("legacy-session")).toBe("legacy-value");
    await secureStoreAuthStorage.removeItem("legacy-session");
    expect(await secureStoreAuthStorage.getItem("legacy-session")).toBeNull();
  });
});
