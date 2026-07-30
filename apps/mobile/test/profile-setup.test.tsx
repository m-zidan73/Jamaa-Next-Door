import "../src/lib/i18n";
import { router } from "expo-router";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import ProfileSetupScreen from "../app/(auth)/profile-setup";
import { DependenciesProvider } from "../src/providers/dependencies-provider";
import { appDependencies, type AppDependencies } from "../src/services/app-dependencies";

function renderProfileSetup(overrides: Partial<AppDependencies> = {}) {
  const dependencies: AppDependencies = {
    ...appDependencies,
    ...overrides,
  };

  return render(
    <DependenciesProvider value={dependencies}>
      <ProfileSetupScreen />
    </DependenciesProvider>,
  );
}

describe("profile submission workflow", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("captures a selfie, submits the profile, and opens the Jama'ah page", async () => {
    const submitProfile = jest.fn().mockResolvedValue({ errorMessage: null });
    const captureSelfie = jest.fn().mockResolvedValue({
      status: "captured",
      uri: "file:///selfie.jpg",
      base64: "aGVsbG8=",
      contentType: "image/jpeg",
    });

    renderProfileSetup({
      imageLibrary: {
        ...appDependencies.imageLibrary,
        captureSelfie,
      },
      profileRepository: {
        ...appDependencies.profileRepository,
        submitProfile,
      },
    });

    fireEvent.press(screen.getByText("Take selfie"));
    expect(await screen.findByText("Selfie ready")).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText("Display name"), "Mohit Zidan");
    fireEvent(screen.getByLabelText("Confirm age 18 or older"), "valueChange", true);
    fireEvent.press(screen.getByText("Submit Profile"));

    await waitFor(() =>
      expect(submitProfile).toHaveBeenCalledWith({
        displayName: "Mohit Zidan",
        phone: null,
        isAdultConfirmed: true,
        selfie: {
          base64: "aGVsbG8=",
          contentType: "image/jpeg",
        },
      }),
    );
    expect(router.replace).toHaveBeenCalledWith("/(tabs)/jamaahs");
  });

  it("requires a selfie before calling the profile repository", async () => {
    const submitProfile = jest.fn();

    renderProfileSetup({
      profileRepository: {
        ...appDependencies.profileRepository,
        submitProfile,
      },
    });

    fireEvent.changeText(screen.getByLabelText("Display name"), "Mohit Zidan");
    fireEvent(screen.getByLabelText("Confirm age 18 or older"), "valueChange", true);
    fireEvent.press(screen.getByText("Submit Profile"));

    expect(await screen.findByText("Take a selfie before submitting your profile.")).toBeTruthy();
    expect(submitProfile).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
