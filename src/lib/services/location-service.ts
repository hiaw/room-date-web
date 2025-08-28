export interface LocationState {
  latitude: number;
  longitude: number;
}

export interface LocationError {
  message: string;
  code: number;
}

export function getCurrentLocation(): Promise<LocationState> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Location error:", error);
        reject({
          message: "Could not get your location. Using default location.",
          code: error.code,
        });
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  });
}

export function getDefaultLocation(): LocationState {
  return {
    latitude: 37.7749, // San Francisco
    longitude: -122.4194,
  };
}
