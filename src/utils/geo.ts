import { GeoState } from '../types';

export function startGeoWatch(onUpdate: (g: GeoState) => void): () => void {
  if (!navigator.geolocation) {
    onUpdate({
      lat: null,
      lon: null,
      accuracy: null,
      altitude: null,
      city: '',
      state: '',
      loading: false,
    });
    return () => {};
  }

  onUpdate({
    lat: null,
    lon: null,
    accuracy: null,
    altitude: null,
    city: '',
    state: '',
    loading: true,
  });

  let lastReverseGeoLat: number | null = null;
  let lastReverseGeoLon: number | null = null;
  let cityCache = '';
  let stateCache = '';

  const watchId = navigator.geolocation.watchPosition(
    async (position) => {
      const { latitude, longitude, accuracy, altitude } = position.coords;

      // Only re-reverse-geocode if moved significantly (>500m) or first time
      const shouldReverseGeo =
        lastReverseGeoLat === null ||
        lastReverseGeoLon === null ||
        Math.abs(latitude - lastReverseGeoLat) > 0.005 ||
        Math.abs(longitude - lastReverseGeoLon) > 0.005;

      if (shouldReverseGeo) {
        lastReverseGeoLat = latitude;
        lastReverseGeoLon = longitude;
        const geo = await reverseGeocode(latitude, longitude);
        cityCache = geo.city;
        stateCache = geo.state;
      }

      onUpdate({
        lat: latitude,
        lon: longitude,
        accuracy: accuracy,
        altitude: altitude,
        city: cityCache,
        state: stateCache,
        loading: false,
      });
    },
    (error) => {
      console.error('Geolocation error:', error);
      onUpdate({
        lat: null,
        lon: null,
        accuracy: null,
        altitude: null,
        city: '',
        state: '',
        loading: false,
      });
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000,
    }
  );

  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}

export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<{ city: string; state: string }> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&accept-language=pt-BR`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'GeoFoto-EcoAds/1.0',
      },
    });

    if (!response.ok) {
      return { city: '', state: '' };
    }

    const data = await response.json();
    const address = data.address || {};

    const city =
      address.city ||
      address.town ||
      address.municipality ||
      address.village ||
      address.suburb ||
      '';

    const state = address.state || '';

    return { city, state };
  } catch (err) {
    console.error('Reverse geocode error:', err);
    return { city: '', state: '' };
  }
}
