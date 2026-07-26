import { z } from "zod";

export const PRAYER_OPTIONS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

export const START_DELAY_OPTIONS = [
  { label: "5 minutes", value: "5" },
  { label: "8 minutes", value: "8" },
  { label: "10 minutes", value: "10" },
  { label: "15 minutes", value: "15" },
  { label: "Custom", value: "custom" },
] as const;

const START_DELAY_VALUES = ["5", "8", "10", "15", "custom"] as const;

export const createJamaahSchema = z
  .object({
    prayer: z.enum(PRAYER_OPTIONS),
    startDelay: z.enum(START_DELAY_VALUES),
    customDelay: z.string().optional(),
    location: z.string().min(5),
    locationImageUri: z.string().optional(),
  })
  .superRefine((values, context) => {
    if (
      values.startDelay === "custom" &&
      (!values.customDelay || !/^\d+$/.test(values.customDelay) || Number(values.customDelay) < 1)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid number of minutes.",
        path: ["customDelay"],
      });
    }
  });

export type CreateJamaahFormValues = z.infer<typeof createJamaahSchema>;

export const CREATE_JAMAAH_DEFAULT_VALUES: CreateJamaahFormValues = {
  prayer: "Fajr",
  startDelay: "5",
  customDelay: "",
  location: "",
  locationImageUri: "",
};

export function formatStartDelay(values: Pick<CreateJamaahFormValues, "startDelay" | "customDelay">) {
  const minutes = values.startDelay === "custom" ? values.customDelay : values.startDelay;

  return `${minutes} minutes`;
}
