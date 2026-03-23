import { useState, useEffect, useCallback } from "react";
import type { UserLocation } from "@/types/events";

const STORAGE_KEY = "politiu_user_location";

function readFromStorage(): UserLocation {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const result: UserLocation = {
        residential: parsed.residential || null,
        current: parsed.current || null,
      };

      if (parsed.profile) {
        const p = { ...parsed.profile };
        if (parsed.residential) {
          p.zipCode = p.zipCode || parsed.residential.address || "";
          p.city = p.city || parsed.residential.city || "";
          p.state = p.state || parsed.residential.state || "";
          p.county = p.county || parsed.residential.city || "";
        }
        result.profile = p;
      } else if (parsed.residential) {
        result.profile = {
          name: "",
          occupation: "",
          zipCode: parsed.residential.address || "",
          city: parsed.residential.city || "",
          state: parsed.residential.state || "",
          county: parsed.residential.city || "",
          interests: [],
          transport: [],
        };
      }

      return result;
    } catch {
      // ignore malformed local storage
    }
  }

  return { residential: null, current: null };
}

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation>(readFromStorage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => setLocation(readFromStorage());
    window.addEventListener("politiu_location_update", handler);
    return () => window.removeEventListener("politiu_location_update", handler);
  }, []);

  const saveResidential = useCallback((data: UserLocation["residential"]) => {
    setLocation((prev) => {
      const next = { ...prev, residential: data };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("politiu_location_update"));
      return next;
    });
  }, []);

  const updateLocation = useCallback(async (addressStr: string) => {
    const parts = addressStr.split(",").map((p) => p.trim());
    const manualAddress = parts[0] || addressStr;
    const manualCity = parts[1] || "";
    const stateZip = parts[2] || "";
    const manualState = stateZip.split(" ")[0] || "";
    const manualZipCode = stateZip.split(" ")[1] || "";

    let resolved:
      | {
          lat: number;
          lng: number;
          address: string;
          city: string;
          state: string;
          zipCode: string;
        }
      | null = null;

    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressStr)}&format=json&addressdetails=1&limit=1`
      );
      const results = await resp.json();

      if (Array.isArray(results) && results.length > 0) {
        const hit = results[0];
        const addr = hit.address || {};
        const resolvedCity = addr.city || addr.town || addr.village || addr.county || "";
        const resolvedState = addr.state || "";
        const resolvedZipCode = addr.postcode || "";
        const resolvedAddress =
          [addr.house_number, addr.road].filter(Boolean).join(" ") ||
          (typeof hit.display_name === "string" ? hit.display_name.split(",")[0] : manualAddress);

        resolved = {
          lat: parseFloat(hit.lat),
          lng: parseFloat(hit.lon),
          address: resolvedAddress || manualAddress,
          city: resolvedCity,
          state: resolvedState,
          zipCode: resolvedZipCode,
        };
      }
    } catch {
      // Fall back to manual parsing below
    }

    setLocation((prev) => {
      const existingProfile = prev.profile || {
        name: "",
        occupation: "",
        zipCode: "",
        interests: [],
        transport: [],
      };

      const finalLat = resolved?.lat ?? prev.residential?.lat ?? 33.749;
      const finalLng = resolved?.lng ?? prev.residential?.lng ?? -84.388;
      const finalCity = resolved?.city || manualCity || existingProfile.city || prev.residential?.city || "";
      const finalState = resolved?.state || manualState || existingProfile.state || prev.residential?.state || "";
      const finalZip = resolved?.zipCode || manualZipCode || existingProfile.zipCode || "";
      const finalAddress = resolved?.address || manualAddress || prev.residential?.address || addressStr;

      const next: UserLocation = {
        ...prev,
        residential: {
          lat: finalLat,
          lng: finalLng,
          address: finalAddress,
          city: finalCity,
          state: finalState,
        },
        profile: {
          ...existingProfile,
          zipCode: finalZip,
          city: finalCity,
          state: finalState,
          county: finalCity || existingProfile.county,
        },
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("politiu_location_update"));
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
          const next = {
            ...prev,
            current: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          window.dispatchEvent(new Event("politiu_location_update"));
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

  return {
    location,
    profile: location.profile || null,
    loading,
    error,
    saveResidential,
    updateLocation,
    requestCurrentLocation,
    hasCompletedOnboarding,
  };
}
