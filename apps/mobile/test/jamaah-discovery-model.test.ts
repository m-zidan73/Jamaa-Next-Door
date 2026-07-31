import { selectUpcomingJamaahs } from "../src/features/jamaahs/jamaah-discovery-model";
import type { DiscoverableJamaah } from "../src/ports/jamaah-repository";

function jamaah(id: string, startsAt: number): DiscoverableJamaah {
  return {
    id,
    prayer_name: id,
    status: "scheduled",
    starts_at: new Date(startsAt).toISOString(),
    approximate_lat: null,
    approximate_lng: null,
    participant_count: 1,
  };
}

describe("Jama'ah discovery selection", () => {
  it("excludes elapsed entries and sorts upcoming entries by nearest time", () => {
    const now = Date.parse("2026-07-30T18:00:00.000Z");
    const selected = selectUpcomingJamaahs([
      jamaah("later", now + 120_000),
      jamaah("elapsed", now),
      jamaah("nearest", now + 30_000),
    ], now);

    expect(selected.map((item) => item.id)).toEqual(["nearest", "later"]);
  });
});
