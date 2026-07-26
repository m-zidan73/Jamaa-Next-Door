import { buildPrayerTimes } from "../src/lib/prayer-times";

describe("prayer time adapter", () => {
  it("returns ordered daily prayer times for the configured Germany coordinates", () => {
    const times = buildPrayerTimes(new Date("2026-01-15T12:00:00+01:00"), "MWL", "hanafi");

    expect(times.fajr.getTime()).toBeLessThan(times.dhuhr.getTime());
    expect(times.dhuhr.getTime()).toBeLessThan(times.asr.getTime());
    expect(times.asr.getTime()).toBeLessThan(times.maghrib.getTime());
    expect(times.maghrib.getTime()).toBeLessThan(times.isha.getTime());
  });
});
