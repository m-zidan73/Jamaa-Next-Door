import * as ImagePicker from "expo-image-picker";
import type { ImageLibrary } from "../ports/image-library";

export const expoImageLibrary: ImageLibrary = {
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
