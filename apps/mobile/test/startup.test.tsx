import { render } from "@testing-library/react-native";
import { Redirect } from "expo-router";
import Index from "../app/index";
import { useAuthSession } from "../src/providers/auth-session-provider";

jest.mock("../src/providers/auth-session-provider", () => ({
  useAuthSession: jest.fn(),
}));

const mockedUseAuthSession = jest.mocked(useAuthSession);

describe("application startup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects signed-out users to the login route after restoration", () => {
    mockedUseAuthSession.mockReturnValue({ callbackError: null, status: "signedOut" });
    render(<Index />);

    expect(Redirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/(auth)/login" }),
      expect.any(Object),
    );
  });

  it("continues authenticated users to profile setup", () => {
    mockedUseAuthSession.mockReturnValue({ callbackError: null, status: "signedIn" });
    render(<Index />);

    expect(Redirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/(auth)/profile-setup" }),
      expect.any(Object),
    );
  });

  it("does not redirect while the persisted session is loading", () => {
    mockedUseAuthSession.mockReturnValue({ callbackError: null, status: "loading" });
    render(<Index />);

    expect(Redirect).not.toHaveBeenCalled();
  });
});
