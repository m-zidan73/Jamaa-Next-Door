import { parseAuthCallback } from "../src/features/auth/auth-callback";

describe("authentication callback parsing", () => {
  it("reads a PKCE code from the query string", () => {
    expect(parseAuthCallback("jnd://auth/callback?code=pkce-code")).toEqual({
      type: "code",
      code: "pkce-code",
    });
  });

  it("reads legacy implicit-flow tokens from the URL fragment", () => {
    expect(
      parseAuthCallback("jnd://#access_token=access-token&refresh_token=refresh-token"),
    ).toEqual({
      type: "tokens",
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });
  });

  it("surfaces decoded provider errors", () => {
    expect(
      parseAuthCallback("jnd://auth/callback?error=access_denied&error_description=Link%20expired"),
    ).toEqual({ type: "error", message: "Link expired" });
  });

  it("ignores unrelated application links", () => {
    expect(parseAuthCallback("jnd://jamaahs/demo")).toEqual({ type: "none" });
  });
});
