import { useState, useMemo, useCallback } from "react";
import { Calendar, MapPin, Star, Clock } from "lucide-react";
import EventCard from "@/components/EventCard";
import EventsMap from "@/components/EventsMap";
import { useUserLocation } from "@/hooks/use-user-location";
import { getMockEvents, getMockPrecincts } from "@/data/mock-events";

const FEATURED_EVENT = {
  title: "Youth Voter Registration Drive & Town Hall",
  description: "Join local civic leaders for a free voter registration drive, followed by a town hall Q&A with candidates running for City Council. Food trucks, live music, and free merch for first-time voters!",
  date: "Saturday, April 5, 2025",
  time: "11:00 AM – 3:00 PM",
  location: "Piedmont Park – Midtown, Atlanta",
  tags: ["🗳️ Voter Registration", "🎤 Town Hall", "🎶 Live Music"],
  attendees: 243,
  image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&q=80",
};

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
            <h2 className="font-display text-xl font-bold text-on-dark">Events</h2>
            {districtName && <p className="text-xs font-semibold text-primary tracking-wide mt-0.5">{districtName}</p>}
            <p className="text-xs text-on-dark/40 mt-0.5">
              {events.length} upcoming near {locationLabel}
            </p>
          </div>

          <div className="flex bg-on-dark/10 rounded-[10px] overflow-hidden border border-on-dark/10">
            <button
              onClick={() => setView("list")}
              className={`py-[7px] px-4 text-[11px] font-extrabold cursor-pointer border-none font-body transition-all ${
                view === "list" ? "bg-gradient-to-br from-orange-light to-burnt text-on-dark rounded-lg" : "text-on-dark/45 bg-transparent"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView("map")}
              className={`py-[7px] px-4 text-[11px] font-extrabold cursor-pointer border-none font-body transition-all ${
                view === "map" ? "bg-gradient-to-br from-orange-light to-burnt text-on-dark rounded-lg" : "text-on-dark/45 bg-transparent"
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
        {/* Featured Event */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-primary fill-primary" />
            <h2 className="text-xs font-bold text-primary tracking-widest uppercase">Featured Event</h2>
          </div>
          <div className="rounded-2xl overflow-hidden border border-primary/20 shadow-[0_4px_20px_rgba(232,86,10,0.12)]">
            <div className="h-36 relative overflow-hidden">
              <img
                src={FEATURED_EVENT.image}
                alt={FEATURED_EVENT.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-char/80 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="font-display text-[15px] font-bold text-on-dark leading-tight">{FEATURED_EVENT.title}</h3>
              </div>
            </div>
            <div className="bg-card p-3.5 space-y-2.5">
              <p className="text-[11px] text-muted-foreground leading-relaxed">{FEATURED_EVENT.description}</p>
              <div className="flex items-center gap-3 text-[10px] font-bold text-foreground">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-primary" />{FEATURED_EVENT.date}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold text-foreground">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-primary" />{FEATURED_EVENT.time}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" />{FEATURED_EVENT.location}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {FEATURED_EVENT.tags.map((tag) => (
                  <span key={tag} className="py-[3px] px-2.5 rounded-full text-[10px] font-bold bg-orange-pale text-primary">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-muted-foreground font-semibold">{FEATURED_EVENT.attendees} attending</span>
                <button className="py-1.5 px-4 rounded-full bg-gradient-to-br from-orange-light to-burnt text-on-dark text-[10px] font-extrabold border-none cursor-pointer uppercase tracking-wider">
                  RSVP
                </button>
              </div>
            </div>
          </div>
        </div>

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
