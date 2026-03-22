import { useState, useEffect, useCallback } from "react";
import type { UserLocation } from "@/types/events";

const STORAGE_KEY = "politiu_user_location";

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch { /* ignore */ }
    }
    return { residential: null, current: null };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveResidential = useCallback((data: UserLocation["residential"]) => {
    setLocation((prev) => {
      const next = { ...prev, residential: data };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const requestCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation((prev) => {
          const next = { ...prev, current: { lat: pos.coords.latitude, lng: pos.coords.longitude } };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          return next;
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const hasCompletedOnboarding = !!location.residential;

  return { location, loading, error, saveResidential, requestCurrentLocation, hasCompletedOnboarding };
}
