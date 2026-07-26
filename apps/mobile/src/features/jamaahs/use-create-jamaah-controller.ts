import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CREATE_JAMAAH_DEFAULT_VALUES,
  type CreateJamaahFormValues,
  createJamaahSchema,
} from "./create-jamaah-model";

export function useCreateJamaahController() {
  const [summary, setSummary] = useState<CreateJamaahFormValues | null>(null);
  const { control, handleSubmit, setValue, watch } = useForm<CreateJamaahFormValues>({
    resolver: zodResolver(createJamaahSchema),
    defaultValues: CREATE_JAMAAH_DEFAULT_VALUES,
  });
  const locationImageUri = watch("locationImageUri");

  async function pickLocationImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow photo library access to upload a location image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setValue("locationImageUri", result.assets[0].uri, { shouldDirty: true, shouldValidate: true });
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
