import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseProfileRepository } from "../src/services/supabase-profile-repository";

const input = {
  displayName: "Mohit Zidan",
  phone: null,
  isAdultConfirmed: true,
  selfie: {
    base64: "aGVsbG8=",
    contentType: "image/jpeg",
  },
};

describe("Supabase profile repository", () => {
  it("uploads the private selfie and persists the profile and pending verification", async () => {
    const upload = jest.fn().mockResolvedValue({ error: null });
    const remove = jest.fn().mockResolvedValue({ error: null });
    const upsert = jest.fn().mockResolvedValue({ error: null });
    const insert = jest.fn().mockResolvedValue({ error: null });
    const from = jest.fn((table: string) => {
      if (table === "profiles") {
        return { upsert };
      }

      return { insert };
    });
    const client = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: "user-123", email: "user@example.com" } },
          error: null,
        }),
      },
      from,
      storage: {
        from: jest.fn().mockReturnValue({ upload, remove }),
      },
    } as unknown as SupabaseClient;

    const result = await createSupabaseProfileRepository(client).submitProfile(input);

    expect(result).toEqual({ errorMessage: null });
    expect(upload).toHaveBeenCalledWith(
      "user-123/profile.jpg",
      expect.any(ArrayBuffer),
      { contentType: "image/jpeg", upsert: true },
    );
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "user-123",
        display_name: "Mohit Zidan",
        email: "user@example.com",
        phone: null,
        is_adult_confirmed: true,
      }),
      { onConflict: "id" },
    );
    expect(insert).toHaveBeenCalledWith({
      profile_id: "user-123",
      storage_path: "user-123/profile.jpg",
      status: "pending",
    });
  });

  it("returns an actionable error when Supabase is not configured", async () => {
    const result = await createSupabaseProfileRepository(null).submitProfile(input);

    expect(result.errorMessage).toMatch(/Configure Supabase credentials/);
  });
});
