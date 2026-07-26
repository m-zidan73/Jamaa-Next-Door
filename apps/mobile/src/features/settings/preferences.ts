export const SUPPORTED_LOCALES = ["en", "de", "tr"] as const;
export type LocaleCode = (typeof SUPPORTED_LOCALES)[number];

export const CALCULATION_METHODS = ["MWL", "DITIB"] as const;
export type CalculationMethodCode = (typeof CALCULATION_METHODS)[number];

export const MADHHABS = ["auto", "hanafi", "shafi"] as const;
export type MadhhabCode = (typeof MADHHABS)[number];
