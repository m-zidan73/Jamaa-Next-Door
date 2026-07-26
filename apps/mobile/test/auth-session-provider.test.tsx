import { act, render, screen, waitFor } from "@testing-library/react-native";
import * as Linking from "expo-linking";
import { Text } from "react-native";
import type { AuthRepository } from "../src/ports/auth-repository";
import {
  AuthSessionProvider,
  useAuthSession,
} from "../src/providers/auth-session-provider";
import { DependenciesProvider } from "../src/providers/dependencies-provider";

jest.mock("expo-linking", () => ({
  addEventListener: jest.fn(),
  getInitialURL: jest.fn(),
}));

const mockedLinking = jest.mocked(Linking);

function SessionProbe() {
  const { callbackError, status } = useAuthSession();
  return <Text>{callbackError ?? status}</Text>;
}

function createAuthRepository(overrides: Partial<AuthRepository> = {}): AuthRepository {
  return {
    isConfigured: true,
    completeSignInFromUrl: jest.fn().mockResolvedValue({
      handled: true,
      isAuthenticated: true,
      errorMessage: null,
    }),
    restoreSession: jest.fn().mockResolvedValue({
      isAuthenticated: false,
      errorMessage: null,
    }),
    sendMagicLink: jest.fn(),
    subscribeToSession: jest.fn().mockReturnValue(jest.fn()),
    ...overrides,
  };
}

function renderProvider(authRepository: AuthRepository) {
  return render(
    <DependenciesProvider value={{ authRepository } as never}>
      <AuthSessionProvider>
        <SessionProbe />
      </AuthSessionProvider>
    </DependenciesProvider>,
  );
}

describe("authentication session lifecycle", () => {
  let receiveUrl: ((event: { url: string }) => void) | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    receiveUrl = undefined;
    mockedLinking.addEventListener.mockImplementation((_event, listener) => {
      receiveUrl = listener;
      return { remove: jest.fn() } as never;
    });
  });

  it("completes a callback received during cold start", async () => {
    mockedLinking.getInitialURL.mockResolvedValue("jnd://auth/callback?code=cold-code");
    const authRepository = createAuthRepository();

    renderProvider(authRepository);

    await waitFor(() => expect(screen.getByText("signedIn")).toBeTruthy());
    expect(authRepository.completeSignInFromUrl).toHaveBeenCalledWith(
      "jnd://auth/callback?code=cold-code",
    );
    expect(authRepository.restoreSession).not.toHaveBeenCalled();
  });

  it("completes a callback received while the app is running", async () => {
    mockedLinking.getInitialURL.mockResolvedValue(null);
    const authRepository = createAuthRepository();

    renderProvider(authRepository);
    await waitFor(() => expect(screen.getByText("signedOut")).toBeTruthy());

    await act(async () => {
      receiveUrl?.({ url: "jnd://auth/callback?code=warm-code" });
    });

    await waitFor(() => expect(screen.getByText("signedIn")).toBeTruthy());
    expect(authRepository.completeSignInFromUrl).toHaveBeenCalledWith(
      "jnd://auth/callback?code=warm-code",
    );
  });

  it("shows callback failures instead of silently returning to login", async () => {
    mockedLinking.getInitialURL.mockResolvedValue(
      "jnd://auth/callback?error_description=Link%20expired",
    );
    const authRepository = createAuthRepository({
      completeSignInFromUrl: jest.fn().mockResolvedValue({
        handled: true,
        isAuthenticated: false,
        errorMessage: "Link expired",
      }),
    });

    renderProvider(authRepository);

    await waitFor(() => expect(screen.getByText("Link expired")).toBeTruthy());
  });
});
