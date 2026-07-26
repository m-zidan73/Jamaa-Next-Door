import { useState } from "react";
import { Alert } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDependencies } from "../../providers/dependencies-provider";
import {
  CREATE_JAMAAH_DEFAULT_VALUES,
  type CreateJamaahFormValues,
  createJamaahSchema,
} from "./create-jamaah-model";

export function useCreateJamaahController() {
  const { imageLibrary } = useAppDependencies();
  const [summary, setSummary] = useState<CreateJamaahFormValues | null>(null);
  const { control, handleSubmit, setValue, watch } = useForm<CreateJamaahFormValues>({
    resolver: zodResolver(createJamaahSchema),
    defaultValues: CREATE_JAMAAH_DEFAULT_VALUES,
  });
  const locationImageUri = watch("locationImageUri");

  async function pickLocationImage() {
    const result = await imageLibrary.pickLocationImage();

    if (result.status === "permission-denied") {
      Alert.alert("Permission needed", "Allow photo library access to upload a location image.");
      return;
    }

    if (result.status === "selected") {
      setValue("locationImageUri", result.uri, { shouldDirty: true, shouldValidate: true });
    }
  }

  return {
    control,
    locationImageUri,
    pickLocationImage,
    reviewSummary: handleSubmit(setSummary),
    summary,
  };
}
