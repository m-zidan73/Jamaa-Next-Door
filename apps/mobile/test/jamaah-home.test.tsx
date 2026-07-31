import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { Share } from "react-native";
import JamaahsScreen from "../app/(tabs)/jamaahs";
import { DependenciesProvider } from "../src/providers/dependencies-provider";
import type { JamaahDetails, JamaahRepository } from "../src/ports/jamaah-repository";
import { appDependencies } from "../src/services/app-dependencies";

const queryClients: QueryClient[] = [];

function makeJamaahRepository(): JamaahRepository {
  const future = new Date(Date.now() + 60_000).toISOString();
  const details: JamaahDetails = {
    id: "future",
    prayer_name: "Fajr",
    status: "scheduled",
    starts_at: future,
    approximate_lat: 49.87,
    approximate_lng: 8.65,
    participant_count: 2,
    exact_address: "Private exact address",
    exact_lat: 49.871,
    exact_lng: 8.651,
    exact_photo_path: null,
    exact_photo_url: null,
    is_host: false,
    is_participant: true,
  };
  return {
    getLatestVerificationStatus: jest.fn().mockResolvedValue("approved"),
    fetchDiscoverableJamaahs: jest.fn().mockResolvedValue({
      data: [
        { ...details, id: "expired", prayer_name: "Expired", starts_at: new Date(Date.now() - 1000).toISOString() },
        details,
      ],
      errorMessage: null,
    }),
    fetchJamaahDetails: jest.fn().mockResolvedValue({ data: details, errorMessage: null }),
    publishJamaah: jest.fn(),
    joinJamaah: jest.fn().mockResolvedValue({ data: true, errorMessage: null }),
    leaveJamaah: jest.fn().mockResolvedValue({ data: true, errorMessage: null }),
    cancelJamaah: jest.fn().mockResolvedValue({ data: true, errorMessage: null }),
    subscribeToChanges: jest.fn(() => () => undefined),
  };
}

function renderHome(repository: JamaahRepository) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  queryClients.push(queryClient);
  return render(
    <QueryClientProvider client={queryClient}>
      <DependenciesProvider value={{ ...appDependencies, jamaahRepository: repository }}>
        <JamaahsScreen />
      </DependenciesProvider>
    </QueryClientProvider>,
  );
}

describe("home-based Jama'ah discovery", () => {
  afterEach(() => {
    queryClients.splice(0).forEach((client) => client.clear());
    jest.restoreAllMocks();
  });

  it("hides expired Jama'ahs and opens and closes upcoming details", async () => {
    renderHome(makeJamaahRepository());

    expect(await screen.findByText("Fajr")).toBeTruthy();
    expect(screen.queryByText("Expired")).toBeNull();
    fireEvent.press(screen.getByText("Fajr"));
    expect(await screen.findByText("Fajr Jama'ah")).toBeTruthy();
    fireEvent.press(screen.getByText("Close"));
    await waitFor(() => expect(screen.queryByText("Fajr Jama'ah")).toBeNull());
  });

  it("shares only approximate details and leaves through the repository", async () => {
    const repository = makeJamaahRepository();
    const share = jest.spyOn(Share, "share").mockResolvedValue({ action: Share.sharedAction });
    renderHome(repository);

    fireEvent.press(await screen.findByText("Fajr"));
    fireEvent.press(await screen.findByText("Share Jama'ah"));
    await waitFor(() => expect(share).toHaveBeenCalled());
    const message = share.mock.calls[0]?.[0].message ?? "";
    expect(message).toContain("49.870, 8.650");
    expect(message).toContain("jnd://jamaahs/future");
    expect(message).not.toContain("Private exact address");

    fireEvent.press(screen.getByText("Leave Jama'ah"));
    await waitFor(() => expect(repository.leaveJamaah).toHaveBeenCalledWith("future"));
    await waitFor(() => expect(screen.queryByText("Fajr Jama'ah")).toBeNull());
  });
});
