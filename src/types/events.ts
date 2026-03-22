export interface PolitiUEvent {
  id: string;
  title: string;
  date: Date;
  location: string;
  coordinates: [number, number]; // [lng, lat]
  distance?: string;
  type: "speech" | "rally" | "election" | "town-hall" | "forum";
  scope: "local" | "state" | "federal";
  description?: string;
}

export interface UserLocation {
  residential: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    state: string;
  } | null;
  current: {
    lat: number;
    lng: number;
  } | null;
}

export type LocationMode = "residential" | "current";
