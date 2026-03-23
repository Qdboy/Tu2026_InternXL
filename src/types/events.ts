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

export interface UserProfile {
  name: string;
  occupation: string;
  zipCode: string;
  county?: string;
  city?: string;
  state?: string;
  interests: string[];
  transport: string[];
  income?: string;
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
  profile?: UserProfile;
}

export type LocationMode = "residential" | "current";
