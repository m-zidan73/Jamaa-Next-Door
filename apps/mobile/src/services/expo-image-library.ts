import * as ImagePicker from "expo-image-picker";
import type { ImageLibrary } from "../ports/image-library";

export const expoImageLibrary: ImageLibrary = {
  async captureSelfie() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      return { status: "permission-denied" };
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      base64: true,
      cameraType: ImagePicker.CameraType.front,
      exif: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    const asset = result.assets?.[0];

    if (result.canceled) {
      return { status: "cancelled" };
    }

    if (!asset?.uri || !asset.base64) {
      return {
        status: "error",
        message: "The selfie could not be processed. Please try again.",
      };
    }

    return {
      status: "captured",
      uri: asset.uri,
      base64: asset.base64,
      contentType: asset.mimeType ?? "image/jpeg",
    };
  },

  async pickLocationImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return { status: "permission-denied" };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    const uri = result.assets?.[0]?.uri;

    if (result.canceled || !uri) {
      return { status: "cancelled" };
    }

    return { status: "selected", uri };
  },
};
