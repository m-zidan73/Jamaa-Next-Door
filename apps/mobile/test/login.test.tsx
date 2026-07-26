import { fireEvent, render, screen } from "@testing-library/react-native";
import "../src/lib/i18n";
import LoginScreen from "../app/(auth)/login";

jest.mock("../src/lib/supabase", () => ({ supabase: null }));

describe("login screen", () => {
  it("shows a configuration message when Supabase is unavailable", () => {
    render(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText("name@example.com"), "user@example.com");
    fireEvent.press(screen.getByText("Send magic link"));

    expect(
      screen.getByText("Configure Supabase credentials in .env before testing authentication."),
    ).toBeTruthy();
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
