import { create } from "zustand";
import type { CalculationMethodCode, LocaleCode, MadhhabCode } from "../features/settings/preferences";


type UiStore = {
  localeOverride: LocaleCode | null;
  calculationMethod: CalculationMethodCode;
  madhhab: MadhhabCode;
  setLocaleOverride: (locale: LocaleCode | null) => void;
  setCalculationMethod: (value: CalculationMethodCode) => void;
  setMadhhab: (value: MadhhabCode) => void;
};

export const useUiStore = create<UiStore>((set) => ({
  localeOverride: null,
  calculationMethod: "MWL",
  madhhab: "auto",
  setLocaleOverride: (localeOverride) => set({ localeOverride }),
  setCalculationMethod: (calculationMethod) => set({ calculationMethod }),
  setMadhhab: (madhhab) => set({ madhhab }),
}));
