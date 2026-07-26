import * as Location from "expo-location";
import type { LocationService } from "../ports/location-service";

export const expoLocationService: LocationService = {
  async getCurrentCoordinates() {
    const permission = await Location.requestForegroundPermissionsAsync();

    if (!permission.granted) {
      throw new Error("Location permission is required to publish a jama'ah.");
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  },
};
