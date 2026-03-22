import { format } from "date-fns";
import type { PolitiUEvent } from "@/types/events";

interface EventCardProps {
  event: PolitiUEvent;
}

export default function EventCard({ event }: EventCardProps) {
  const month = format(event.date, "MMM").toUpperCase();
  const day = format(event.date, "d");

  const typeLabel = event.type === "town-hall" ? "Town Hall" : event.type.charAt(0).toUpperCase() + event.type.slice(1);

  return (
    <div className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border shadow-sm animate-fade-up">
      {/* Date badge */}
      <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-dark-char flex flex-col items-center justify-center">
        <span className="text-xs font-bold text-primary tracking-wider">{month}</span>
        <span className="text-2xl font-display font-bold text-card">{day}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <h3 className="font-bold text-base text-foreground leading-tight">{event.title}</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span className="text-primary">📍</span>
          <span className="truncate">{event.location}</span>
          {event.distance && (
            <>
              <span>·</span>
              <span>{event.distance}</span>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <span className={`badge-event-type ${event.type === "election" ? "election" : event.type === "rally" ? "rally" : "speech"}`}>
            {typeLabel}
          </span>
          <span className={`badge-event-type ${event.scope === "local" ? "local" : "state"}`}>
            {event.scope.charAt(0).toUpperCase() + event.scope.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
