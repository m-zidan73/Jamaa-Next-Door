import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import CreateJamaahScreen from "../app/jamaahs/create";

describe("create jama'ah flow", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the default form and creates the existing review summary", async () => {
    render(<CreateJamaahScreen />);

    fireEvent.changeText(screen.getByPlaceholderText("Prayer location"), "Community prayer room");
    fireEvent.press(screen.getByText("Review summary"));

    expect(await screen.findByText("Community prayer room")).toBeTruthy();
    expect(screen.getAllByText("5 minutes")).toHaveLength(2);
    expect(screen.getByText("No image selected yet.")).toBeTruthy();
  });

  it("shows the existing alert when photo access is denied", async () => {
    jest.spyOn(ImagePicker, "requestMediaLibraryPermissionsAsync").mockResolvedValue({
      granted: false,
      canAskAgain: false,
      expires: "never",
      status: ImagePicker.PermissionStatus.DENIED,
    });
    const alert = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);

    render(<CreateJamaahScreen />);
    fireEvent.press(screen.getByText("Upload image"));

    await waitFor(() =>
      expect(alert).toHaveBeenCalledWith(
        "Permission needed",
        "Allow photo library access to upload a location image.",
      ),
    );
  });
});
