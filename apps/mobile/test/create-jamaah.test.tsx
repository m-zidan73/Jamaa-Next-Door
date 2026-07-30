import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import CreateJamaahScreen from "../app/jamaahs/create";

describe("create jama'ah flow", () => {
  afterEach(() => jest.restoreAllMocks());

  it("reviews prayer, location, time, and the required location image", async () => {
    jest.spyOn(ImagePicker, "requestMediaLibraryPermissionsAsync").mockResolvedValue({
      granted: true, canAskAgain: true, expires: "never", status: ImagePicker.PermissionStatus.GRANTED,
    });
    jest.spyOn(ImagePicker, "launchImageLibraryAsync").mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file://location.jpg", base64: "aW1hZ2U=", mimeType: "image/jpeg", width: 100, height: 100 }],
    } as never);

    render(<CreateJamaahScreen />);
    fireEvent.changeText(screen.getByPlaceholderText("Prayer location"), "Community prayer room");
    fireEvent.press(screen.getByText("Upload image"));
    await screen.findByText("Change image");
    fireEvent.press(screen.getByText("Review Jama'ah"));

    expect(await screen.findByText("Community prayer room")).toBeTruthy();
    expect(screen.getByText("5 minutes")).toBeTruthy();
    expect(screen.getByText("Confirm Jama'ah")).toBeTruthy();
    expect(screen.getByText("Edit")).toBeTruthy();
  });

  it("shows the existing alert when photo access is denied", async () => {
    jest.spyOn(ImagePicker, "requestMediaLibraryPermissionsAsync").mockResolvedValue({
      granted: false, canAskAgain: false, expires: "never", status: ImagePicker.PermissionStatus.DENIED,
    });
    const alert = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    render(<CreateJamaahScreen />);
    fireEvent.press(screen.getByText("Upload image"));
    await waitFor(() => expect(alert).toHaveBeenCalledWith("Permission needed", "Allow photo library access to upload a location image."));
  });
});
