import { Redirect } from "expo-router";
import { fireEvent, render, screen } from "@testing-library/react-native";
import "../src/lib/i18n";
import LoginScreen from "../app/(auth)/login";
import { useAuthSession } from "../src/providers/auth-session-provider";

jest.mock("../src/lib/supabase", () => ({ supabase: null }));
jest.mock("../src/providers/auth-session-provider", () => ({
  useAuthSession: jest.fn(),
}));

const mockedUseAuthSession = jest.mocked(useAuthSession);

describe("login screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuthSession.mockReturnValue({ callbackError: null, status: "signedOut" });
  });

  it("shows a configuration message when Supabase is unavailable", () => {
    render(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText("name@example.com"), "user@example.com");
    fireEvent.press(screen.getByText("Send magic link"));

    expect(
      screen.getByText("Configure Supabase credentials in .env before testing authentication."),
    ).toBeTruthy();
  });

  it("redirects to profile setup when a callback authenticates after login rendered", () => {
    mockedUseAuthSession.mockReturnValue({ callbackError: null, status: "signedIn" });

    render(<LoginScreen />);

    expect(Redirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/(auth)/profile-setup" }),
      expect.any(Object),
    );
  });

  it("retains the existing navigation destinations", () => {
    render(<LoginScreen />);

    expect(screen.getByText("Continue to profile setup").props.accessibilityHint).toBe(
      "/(auth)/profile-setup",
    );
    expect(screen.getByText("Open prototype shell").props.accessibilityHint).toBe(
      "/(tabs)/jamaahs",
    );
  });
});
