import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import type { SelfieCaptureResult } from "../../ports/image-library";
import { routes } from "../../navigation/routes";
import { useAppDependencies } from "../../providers/dependencies-provider";
import {
  PROFILE_SETUP_DEFAULT_VALUES,
  type ProfileSetupFormValues,
  profileSetupSchema,
} from "./profile-setup-model";

type CapturedSelfie = Extract<SelfieCaptureResult, { status: "captured" }>;

export function useProfileSetupController() {
  const { imageLibrary, profileRepository } = useAppDependencies();
  const [selfie, setSelfie] = useState<CapturedSelfie | null>(null);
  const [selfieError, setSelfieError] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<ProfileSetupFormValues>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: PROFILE_SETUP_DEFAULT_VALUES,
  });

  async function captureSelfie() {
    setSelfieError(null);
    const result = await imageLibrary.captureSelfie();

    if (result.status === "permission-denied") {
      setSelfieError("Camera permission is required to take your verification selfie.");
      return;
    }

    if (result.status === "error") {
      setSelfieError(result.message);
      return;
    }

    if (result.status === "captured") {
      setSelfie(result);
    }
  }

  const submitProfile = handleSubmit(async (values) => {
    setSubmissionError(null);

    if (!selfie) {
      setSelfieError("Take a selfie before submitting your profile.");
      return;
    }

    setIsSubmitting(true);
    const result = await profileRepository.submitProfile({
      displayName: values.displayName,
      phone: values.phone?.trim() || null,
      isAdultConfirmed: values.isAdult,
      selfie: {
        base64: selfie.base64,
        contentType: selfie.contentType,
      },
    });
    setIsSubmitting(false);

    if (result.errorMessage) {
      setSubmissionError(result.errorMessage);
      return;
    }

    router.replace(routes.jamaahs);
  });

  return {
    captureSelfie,
    control,
    errors,
    isSubmitting,
    selfieError,
    selfieUri: selfie?.uri ?? null,
    submissionError,
    submitProfile,
  };
}
