import { useState, useMemo, useCallback } from "react";
import EventCard from "@/components/EventCard";
import EventsMap from "@/components/EventsMap";
import { useUserLocation } from "@/hooks/use-user-location";
import { getMockEvents, getMockPrecincts } from "@/data/mock-events";

export default function EventsPage() {
  const { location } = useUserLocation();
  const [view, setView] = useState<"list" | "map">("map");
  const [districtName, setDistrictName] = useState<string>("");

  const activeCoords = useMemo(() => {
    if (location.residential) {
      return { lat: location.residential.lat, lng: location.residential.lng };
    }
    return { lat: 33.749, lng: -84.388 };
  }, [location]);

  const events = useMemo(() => getMockEvents(activeCoords.lat, activeCoords.lng), [activeCoords]);
  const precincts = useMemo(() => getMockPrecincts(activeCoords.lat, activeCoords.lng), [activeCoords]);

  const handleDistrictName = useCallback((name: string) => {
    setDistrictName(name);
  }, []);

  const locationLabel = location.residential
    ? `${location.residential.city || "Near you"}${location.residential.state ? `, ${location.residential.state}` : ""}`
    : "Your area";

  // Group events by time period
  const now = new Date();
  const thisWeekEnd = new Date(now);
  thisWeekEnd.setDate(now.getDate() + 7);

  const thisWeek = events.filter((e) => e.date <= thisWeekEnd);
  const later = events.filter((e) => e.date > thisWeekEnd);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-5 pt-3 pb-3.5 bg-dark-char flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-card">Events</h2>
            {districtName && <p className="text-xs font-semibold text-primary tracking-wide mt-0.5">{districtName}</p>}
            <p className="text-xs text-card/40 mt-0.5">
              {events.length} upcoming near {locationLabel}
            </p>
          </div>

          {/* View toggle */}
          <div className="flex bg-card/10 rounded-[10px] overflow-hidden border border-card/10">
            <button
              onClick={() => setView("list")}
              className={`py-[7px] px-4 text-[11px] font-extrabold cursor-pointer border-none font-body transition-all ${
                view === "list" ? "bg-gradient-to-br from-orange-light to-burnt text-card rounded-lg" : "text-card/45 bg-transparent"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView("map")}
              className={`py-[7px] px-4 text-[11px] font-extrabold cursor-pointer border-none font-body transition-all ${
                view === "map" ? "bg-gradient-to-br from-orange-light to-burnt text-card rounded-lg" : "text-card/45 bg-transparent"
              }`}
            >
              Map
            </button>
          </div>
        </div>

      </div>

      {/* Map view */}
      {view === "map" && (
        <div className="h-64 sm:h-72 flex-shrink-0">
          <EventsMap
            center={[activeCoords.lng, activeCoords.lat]}
            events={events}
            precincts={precincts}
            userLocation={[activeCoords.lng, activeCoords.lat]}
            onDistrictName={handleDistrictName}
          />
        </div>
      )}

      {/* Event list */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 pb-24">
        {thisWeek.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-muted-foreground tracking-widest uppercase">This Week</h2>
            {thisWeek.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        )}
        {later.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-muted-foreground tracking-widest uppercase">Next Month</h2>
            {later.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
