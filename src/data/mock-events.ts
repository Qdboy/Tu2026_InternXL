import type { PolitiUEvent } from "@/types/events";

// Mock events — replace with real API calls (Google Civic, Democracy Works, etc.)
export function getMockEvents(lat: number, lng: number): PolitiUEvent[] {
  // Generate events relative to the user's location
  return [
    {
      id: "1",
      title: "Mayoral Candidate Town Hall",
      date: new Date(2026, 2, 25),
      location: "City Hall",
      coordinates: [lng + 0.008, lat + 0.005],
      distance: "1.2 mi",
      type: "town-hall",
      scope: "local",
      description: "Meet the candidates running for mayor and ask questions.",
    },
    {
      id: "2",
      title: "Senate Candidate Rally",
      date: new Date(2026, 2, 27),
      location: "Convention Center",
      coordinates: [lng - 0.012, lat + 0.01],
      distance: "2.8 mi",
      type: "rally",
      scope: "state",
      description: "Rally for the upcoming state senate race.",
    },
    {
      id: "3",
      title: "Primary Election Day",
      date: new Date(2026, 3, 8),
      location: "Multiple Polling Sites",
      coordinates: [lng + 0.003, lat - 0.007],
      distance: "0.4 mi",
      type: "election",
      scope: "state",
      description: "Cast your vote in the state primary election.",
    },
    {
      id: "4",
      title: "Community Voter Forum",
      date: new Date(2026, 3, 15),
      location: "Public Library",
      coordinates: [lng - 0.005, lat + 0.003],
      distance: "0.8 mi",
      type: "forum",
      scope: "local",
      description: "Learn about local ballot measures and initiatives.",
    },
    {
      id: "5",
      title: "Congressional District Town Hall",
      date: new Date(2026, 3, 22),
      location: "Civic Center",
      coordinates: [lng + 0.015, lat - 0.01],
      distance: "3.1 mi",
      type: "speech",
      scope: "federal",
      description: "Your congressional representative answers constituent questions.",
    },
  ];
}

// Voting precincts mock data
export function getMockPrecincts(lat: number, lng: number) {
  return [
    { id: "p1", name: "Precinct 101", coordinates: [lng - 0.006, lat + 0.004] as [number, number] },
    { id: "p2", name: "Precinct 102", coordinates: [lng + 0.01, lat - 0.003] as [number, number] },
    { id: "p3", name: "Precinct 103", coordinates: [lng + 0.002, lat + 0.009] as [number, number] },
  ];
}
