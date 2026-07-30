import { z } from "zod";

export const PRAYER_OPTIONS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
export const START_DELAY_OPTIONS = [
  { label: "5 minutes", value: "5" }, { label: "8 minutes", value: "8" },
  { label: "10 minutes", value: "10" }, { label: "15 minutes", value: "15" },
  { label: "Custom minutes", value: "custom" },
  { label: "Choose date and time", value: "scheduled" },
] as const;
const START_DELAY_VALUES = ["5", "8", "10", "15", "custom", "scheduled"] as const;

export const createJamaahSchema = z.object({
  prayer: z.enum(PRAYER_OPTIONS),
  startDelay: z.enum(START_DELAY_VALUES),
  customDelay: z.string().optional(),
  scheduledAt: z.string().optional(),
  location: z.string().min(5, "Enter the exact prayer location."),
  locationImageUri: z.string().min(1, "Add a location image before review."),
}).superRefine((values, context) => {
  if (values.startDelay === "custom" && (!values.customDelay || !/^\d+$/.test(values.customDelay) || Number(values.customDelay) < 1)) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Enter valid minutes.", path: ["customDelay"] });
  }
  if (values.startDelay === "scheduled" && (!values.scheduledAt || new Date(values.scheduledAt) <= new Date())) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Choose a future date and time.", path: ["scheduledAt"] });
  }
});
export type CreateJamaahFormValues = z.infer<typeof createJamaahSchema>;
export const CREATE_JAMAAH_DEFAULT_VALUES: CreateJamaahFormValues = {
  prayer: "Fajr", startDelay: "5", customDelay: "", scheduledAt: "", location: "", locationImageUri: "",
};
export function calculateStartsAt(values: Pick<CreateJamaahFormValues, "startDelay" | "customDelay" | "scheduledAt">, now = new Date()) {
  if (values.startDelay === "scheduled") return new Date(values.scheduledAt ?? "");
  const minutes = values.startDelay === "custom" ? Number(values.customDelay) : Number(values.startDelay);
  return new Date(now.getTime() + minutes * 60_000);
}
export function formatStartDelay(values: Pick<CreateJamaahFormValues, "startDelay" | "customDelay" | "scheduledAt">) {
  if (values.startDelay === "scheduled") return new Date(values.scheduledAt ?? "").toLocaleString();
  return `${values.startDelay === "custom" ? values.customDelay : values.startDelay} minutes`;
}
