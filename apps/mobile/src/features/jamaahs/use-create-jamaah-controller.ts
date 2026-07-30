import { useState } from "react";
import { Alert } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ImageLibraryResult } from "../../ports/image-library";
import { useAppDependencies } from "../../providers/dependencies-provider";
import {
  CREATE_JAMAAH_DEFAULT_VALUES,
  calculateStartsAt,
  type CreateJamaahFormValues,
  createJamaahSchema,
} from "./create-jamaah-model";

export type CreateJamaahState = "editing" | "reviewing" | "submitting" | "success" | "error";

export function useCreateJamaahController() {
  const { imageLibrary, jamaahImageStorage, jamaahRepository, navigation, profileRepository } = useAppDependencies();
  const [state, setState] = useState<CreateJamaahState>("editing");
  const [summary, setSummary] = useState<CreateJamaahFormValues | null>(null);
  const [selectedImage, setSelectedImage] = useState<Extract<ImageLibraryResult, { status: "selected" }> | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm<CreateJamaahFormValues>({
    resolver: zodResolver(createJamaahSchema),
    defaultValues: CREATE_JAMAAH_DEFAULT_VALUES,
  });

  async function pickLocationImage() {
    const result = await imageLibrary.pickLocationImage();
    if (result.status === "permission-denied") {
      Alert.alert("Permission needed", "Allow photo library access to upload a location image.");
    } else if (result.status === "error") {
      setErrorMessage(result.message);
      setState("error");
    } else if (result.status === "selected") {
      setSelectedImage(result);
      form.setValue("locationImageUri", result.uri, { shouldDirty: true, shouldValidate: true });
    }
  }

  const reviewSummary = form.handleSubmit((values) => {
    setErrorMessage(null);
    setSummary(values);
    setState("reviewing");
  });

  function edit() {
    setErrorMessage(null);
    setState("editing");
  }

  async function confirm() {
    if (state === "submitting" || !summary || !selectedImage) return;
    setState("submitting");
    setErrorMessage(null);

    try {
      if (!await profileRepository.hasSubmittedProfile()) {
        throw new Error("Complete your profile before confirming a Jama'ah.");
      }
      const upload = await jamaahImageStorage.upload({
        base64: selectedImage.base64,
        contentType: selectedImage.contentType,
      });
      if (!upload.path) throw new Error(upload.errorMessage ?? "Location image upload failed.");

      const publication = await jamaahRepository.publishJamaah({
        prayerName: summary.prayer,
        startsAtIso: calculateStartsAt(summary).toISOString(),
        exactAddress: summary.location.trim(),
        exactPhotoPath: upload.path,
      });
      if (!publication.data) {
        await jamaahImageStorage.remove(upload.path);
        throw new Error(publication.errorMessage ?? "Jama'ah publication failed.");
      }

      setState("success");
      navigation.openJamaahDetails(publication.data.jamaahId);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Jama'ah publication failed.");
      setState("error");
    }
  }

  return {
    control: form.control,
    edit,
    errorMessage,
    confirm,
    locationImageUri: form.watch("locationImageUri"),
    pickLocationImage,
    reviewSummary,
    setValue: form.setValue,
    state,
    summary,
    watch: form.watch,
  };
}
