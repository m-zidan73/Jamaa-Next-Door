import { create } from "zustand";

type LocaleCode = "en" | "de" | "tr";

type UiStore = {
  localeOverride: LocaleCode | null;
  calculationMethod: "MWL" | "DITIB";
  madhhab: "auto" | "hanafi" | "shafi";
  setLocaleOverride: (locale: LocaleCode | null) => void;
  setCalculationMethod: (value: "MWL" | "DITIB") => void;
  setMadhhab: (value: "auto" | "hanafi" | "shafi") => void;
};

export const useUiStore = create<UiStore>((set) => ({
  localeOverride: null,
  calculationMethod: "MWL",
  madhhab: "auto",
  setLocaleOverride: (localeOverride) => set({ localeOverride }),
  setCalculationMethod: (calculationMethod) => set({ calculationMethod }),
  setMadhhab: (madhhab) => set({ madhhab }),
}));
