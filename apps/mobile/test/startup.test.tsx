import { render, waitFor } from "@testing-library/react-native";
import { Redirect } from "expo-router";
import Index from "../app/index";
import { useAuthSession } from "../src/providers/auth-session-provider";
import { DependenciesProvider } from "../src/providers/dependencies-provider";
import { appDependencies } from "../src/services/app-dependencies";

jest.mock("../src/providers/auth-session-provider", () => ({
  useAuthSession: jest.fn(),
}));

const mockedUseAuthSession = jest.mocked(useAuthSession);

function renderIndex(hasSubmittedProfile = false) {
  const profileRepository = {
    ...appDependencies.profileRepository,
    hasSubmittedProfile: jest.fn().mockResolvedValue(hasSubmittedProfile),
  };

  return render(
    <DependenciesProvider value={{ ...appDependencies, profileRepository }}>
      <Index />
    </DependenciesProvider>,
  );
}

describe("application startup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects signed-out users to the login route after restoration", () => {
    mockedUseAuthSession.mockReturnValue({ callbackError: null, status: "signedOut" });
    renderIndex();

    expect(Redirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/(auth)/login" }),
      expect.any(Object),
    );
  });

  it("continues authenticated users without a submitted profile to profile setup", async () => {
    mockedUseAuthSession.mockReturnValue({ callbackError: null, status: "signedIn" });
    renderIndex(false);

    await waitFor(() =>
      expect(Redirect).toHaveBeenCalledWith(
        expect.objectContaining({ href: "/(auth)/profile-setup" }),
        expect.any(Object),
      ),
    );
  });

  it("continues authenticated users with a submitted profile to Jama'ah", async () => {
    mockedUseAuthSession.mockReturnValue({ callbackError: null, status: "signedIn" });
    renderIndex(true);

    await waitFor(() =>
      expect(Redirect).toHaveBeenCalledWith(
        expect.objectContaining({ href: "/(tabs)/jamaahs" }),
        expect.any(Object),
      ),
    );
  });

  it("does not redirect while the persisted session is loading", () => {
    mockedUseAuthSession.mockReturnValue({ callbackError: null, status: "loading" });
    renderIndex();

    expect(Redirect).not.toHaveBeenCalled();
  });
});
