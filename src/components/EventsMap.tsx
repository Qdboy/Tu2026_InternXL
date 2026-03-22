import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_TOKEN } from "@/lib/mapbox";
import type { PolitiUEvent } from "@/types/events";

interface EventsMapProps {
  center: [number, number]; // [lng, lat]
  events: PolitiUEvent[];
  precincts: { id: string; name: string; coordinates: [number, number] }[];
  userLocation?: [number, number] | null;
  onDistrictName?: (name: string) => void;
}

const TIGERWEB_CD_URL =
  "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Legislative/MapServer/0/query";

async function fetchDistrictGeoJSON(lng: number, lat: number) {
  const params = new URLSearchParams({
    geometry: `${lng},${lat}`,
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "BASENAME,GEOID,CD119,STATE,NAME",
    returnGeometry: "true",
    f: "geojson",
    outSR: "4326",
  });

  const res = await fetch(`${TIGERWEB_CD_URL}?${params}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.features || data.features.length === 0) return null;
  return data;
}

export default function EventsMap({
  center,
  events,
  precincts,
  userLocation,
  onDistrictName,
}: EventsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center,
      zoom: 13,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("load", async () => {
      // User location marker
      if (userLocation) {
        const el = document.createElement("div");
        el.className = "user-marker";
        el.style.cssText = `
          width: 18px; height: 18px;
          background: hsl(22, 90%, 47%);
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(232,86,10,0.4);
        `;
        new mapboxgl.Marker(el).setLngLat(userLocation).addTo(map);
      }

      // Event markers
      events.forEach((evt) => {
        const el = document.createElement("div");
        el.style.cssText = `
          width: 32px; height: 40px;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 40' fill='none'%3E%3Cpath d='M16 0C7.2 0 0 7.2 0 16c0 12 16 24 16 24s16-12 16-24C32 7.2 24.8 0 16 0z' fill='%23454A44'/%3E%3Ccircle cx='16' cy='14' r='6' fill='white'/%3E%3C/svg%3E") no-repeat center/contain;
          cursor: pointer;
        `;

        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
          <div style="font-family:Nunito,sans-serif;padding:4px 0">
            <strong style="font-size:13px">${evt.title}</strong>
            <div style="font-size:11px;color:#607868;margin-top:2px">📍 ${evt.location}</div>
          </div>
        `);

        new mapboxgl.Marker(el).setLngLat(evt.coordinates).setPopup(popup).addTo(map);
      });

      // Precinct markers
      precincts.forEach((p) => {
        const el = document.createElement("div");
        el.style.cssText = `
          width: 28px; height: 36px;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 40' fill='none'%3E%3Cpath d='M16 0C7.2 0 0 7.2 0 16c0 12 16 24 16 24s16-12 16-24C32 7.2 24.8 0 16 0z' fill='%237DA98A'/%3E%3Ccircle cx='16' cy='14' r='6' fill='white'/%3E%3C/svg%3E") no-repeat center/contain;
          cursor: pointer;
        `;

        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
          <div style="font-family:Nunito,sans-serif;padding:4px 0">
            <strong style="font-size:13px">${p.name}</strong>
            <div style="font-size:11px;color:#607868">Voting Precinct</div>
          </div>
        `);

        new mapboxgl.Marker(el).setLngLat(p.coordinates).setPopup(popup).addTo(map);
      });

      // Fetch real congressional district boundary
      try {
        const geojson = await fetchDistrictGeoJSON(center[0], center[1]);
        if (geojson && geojson.features && geojson.features.length > 0) {
          const feature = geojson.features[0];
          const props = feature.properties;
          const districtLabel = props.NAME || props.BASENAME || `District ${props.CD119}`;
          onDistrictName?.(districtLabel);

          map.addSource("district", {
            type: "geojson",
            data: geojson,
          });

          map.addLayer({
            id: "district-fill",
            type: "fill",
            source: "district",
            paint: {
              "fill-color": "hsl(100, 65%, 45%)",
              "fill-opacity": 0.15,
            },
          });

          map.addLayer({
            id: "district-border",
            type: "line",
            source: "district",
            paint: {
              "line-color": "hsl(100, 65%, 35%)",
              "line-width": 3,
              "line-dasharray": [3, 2],
            },
          });
        }
      } catch (err) {
        console.warn("Failed to fetch district boundary:", err);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [center, events, precincts, userLocation, onDistrictName]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
