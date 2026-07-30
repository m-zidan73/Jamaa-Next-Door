import { z } from "zod";

export const profileSetupSchema = z.object({
  displayName: z.string().trim().min(2, "Enter at least 2 characters."),
  phone: z.string().optional(),
  isAdult: z.boolean().refine((value) => value, "Adult consent is required."),
});

export type ProfileSetupFormValues = z.infer<typeof profileSetupSchema>;

export const PROFILE_SETUP_DEFAULT_VALUES: ProfileSetupFormValues = {
  displayName: "",
  phone: "",
  isAdult: false,
};
