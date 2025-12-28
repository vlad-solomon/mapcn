"use client";

import { useEffect, useState } from "react";
import {
  Map,
  MapMarker,
  MarkerContent,
  MapRoute,
  MarkerLabel,
} from "@/registry/map";
import { Loader2 } from "lucide-react";

const start = { name: "Times Square", lng: -73.9855, lat: 40.758 };
const end = { name: "Central Park", lng: -73.9654, lat: 40.7829 };

export function OsrmRouteExample() {
  const [route, setRoute] = useState<[number, number][] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRoute() {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
        );
        const data = await response.json();

        if (data.routes?.[0]?.geometry?.coordinates) {
          setRoute(data.routes[0].geometry.coordinates);
        }
      } catch (error) {
        console.error("Failed to fetch route:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRoute();
  }, []);

  return (
    <div className="h-[400px] w-full overflow-hidden relative">
      <Map center={[-73.975, 40.77]} zoom={12.5}>
        {route && (
          <MapRoute
            coordinates={route}
            color="#6366f1"
            width={5}
            opacity={0.85}
          />
        )}

        <MapMarker longitude={start.lng} latitude={start.lat}>
          <MarkerContent>
            <div className="size-5 rounded-full bg-green-500 border-2 border-white shadow-lg" />
            <MarkerLabel position="bottom">Start: {start.name}</MarkerLabel>
          </MarkerContent>
        </MapMarker>

        <MapMarker longitude={end.lng} latitude={end.lat}>
          <MarkerContent>
            <div className="size-5 rounded-full bg-red-500 border-2 border-white shadow-lg" />
            <MarkerLabel position="bottom">End: {end.name}</MarkerLabel>
          </MarkerContent>
        </MapMarker>
      </Map>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
