export type AuthCallback =
  | { type: "code"; code: string }
  | { type: "tokens"; accessToken: string; refreshToken: string }
  | { type: "error"; message: string }
  | { type: "none" };

function decode(value: string) {
  return decodeURIComponent(value.replace(/\+/g, " "));
}

function readParameters(url: string) {
  const parameters = new Map<string, string>();
  const parts = [url.split("?")[1]?.split("#")[0], url.split("#")[1]];

  for (const part of parts) {
    for (const pair of part?.split("&") ?? []) {
      const separator = pair.indexOf("=");
      const key = decode(separator >= 0 ? pair.slice(0, separator) : pair);
      const value = decode(separator >= 0 ? pair.slice(separator + 1) : "");
      if (key) {
        parameters.set(key, value);
      }
    }
  }

  return parameters;
}

export function parseAuthCallback(url: string): AuthCallback {
  const parameters = readParameters(url);
  const error = parameters.get("error_description") ?? parameters.get("error");

  if (error) {
    return { type: "error", message: error };
  }

  const code = parameters.get("code");
  if (code) {
    return { type: "code", code };
  }

  const accessToken = parameters.get("access_token");
  const refreshToken = parameters.get("refresh_token");
  if (accessToken && refreshToken) {
    return { type: "tokens", accessToken, refreshToken };
  }

  return { type: "none" };
}
