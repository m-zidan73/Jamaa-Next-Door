import { Coordinates, CalculationMethod, Madhab, PrayerTimes } from "adhan";
import type { CalculationMethodCode, MadhhabCode } from "../features/settings/preferences";

const GERMANY_COORDINATES = new Coordinates(50.1109, 8.6821);

export function buildPrayerTimes(
  date: Date,
  calculationMethod: CalculationMethodCode,
  madhhab: MadhhabCode,
) {
  const params = calculationMethod === "DITIB" ? CalculationMethod.MuslimWorldLeague() : CalculationMethod.MuslimWorldLeague();
  params.madhab = madhhab === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;
  return new PrayerTimes(GERMANY_COORDINATES, date, params);
}
