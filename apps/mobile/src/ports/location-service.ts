export type DeviceCoordinates = {
  latitude: number;
  longitude: number;
};

export interface LocationService {
  getCurrentCoordinates(): Promise<DeviceCoordinates>;
}
