import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import SettingsScreen from "../app/(tabs)/settings";
import { i18n } from "../src/lib/i18n";
import { useUiStore } from "../src/store/ui-store";

describe("settings screen", () => {
  beforeEach(() => {
    useUiStore.setState({ localeOverride: null });
    void i18n.changeLanguage("en");
  });

  it("changes the in-memory locale immediately", async () => {
    render(<SettingsScreen />);

    fireEvent.press(screen.getByText("DE"));

    expect(useUiStore.getState().localeOverride).toBe("de");
    await waitFor(() => expect(i18n.language).toBe("de"));
  });
});
