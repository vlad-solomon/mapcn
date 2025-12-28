"use client";

import { useCallback, useEffect, useState } from "react";
import { Map, MapControls, useMap } from "@/registry/map";
import { Button } from "@/components/ui/button";
import { Layers, X } from "lucide-react";

const geojsonData = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      properties: { name: "Central Park", type: "park" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [
          [
            [-73.9731, 40.7644],
            [-73.9819, 40.7681],
            [-73.958, 40.8006],
            [-73.9493, 40.7969],
            [-73.9731, 40.7644],
          ],
        ],
      },
    },
    {
      type: "Feature" as const,
      properties: { name: "Bryant Park", type: "park" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [
          [
            [-73.9837, 40.7536],
            [-73.9854, 40.7542],
            [-73.984, 40.7559],
            [-73.9823, 40.7553],
            [-73.9837, 40.7536],
          ],
        ],
      },
    },
  ],
};

function CustomLayer() {
  const { map, isLoaded } = useMap();
  const [isLayerVisible, setIsLayerVisible] = useState(false);
  const [hoveredPark, setHoveredPark] = useState<string | null>(null);

  const addLayers = useCallback(() => {
    if (!map) return;
    // Add source if it doesn't exist
    if (!map.getSource("parks")) {
      map.addSource("parks", {
        type: "geojson",
        data: geojsonData,
      });
    }

    // Add fill layer if it doesn't exist
    if (!map.getLayer("parks-fill")) {
      map.addLayer({
        id: "parks-fill",
        type: "fill",
        source: "parks",
        paint: {
          "fill-color": "#22c55e",
          "fill-opacity": 0.4,
        },
        layout: {
          visibility: isLayerVisible ? "visible" : "none",
        },
      });
    }

    // Add outline layer if it doesn't exist
    if (!map.getLayer("parks-outline")) {
      map.addLayer({
        id: "parks-outline",
        type: "line",
        source: "parks",
        paint: {
          "line-color": "#16a34a",
          "line-width": 2,
        },
        layout: {
          visibility: isLayerVisible ? "visible" : "none",
        },
      });
    }
  }, [map, isLayerVisible]);

  useEffect(() => {
    if (!map || !isLoaded) return;

    // Add layers on mount
    addLayers();

    // Hover effect
    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
      setHoveredPark(null);
    };

    const handleMouseMove = (e: maplibregl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["parks-fill"],
      });
      if (features.length > 0) {
        setHoveredPark(features[0].properties?.name || null);
      }
    };

    map.on("mouseenter", "parks-fill", handleMouseEnter);
    map.on("mouseleave", "parks-fill", handleMouseLeave);
    map.on("mousemove", "parks-fill", handleMouseMove);

    return () => {
      map.off("mouseenter", "parks-fill", handleMouseEnter);
      map.off("mouseleave", "parks-fill", handleMouseLeave);
      map.off("mousemove", "parks-fill", handleMouseMove);
    };
  }, [map, isLoaded, isLayerVisible]);

  const toggleLayer = () => {
    if (!map) return;

    const visibility = isLayerVisible ? "none" : "visible";
    map.setLayoutProperty("parks-fill", "visibility", visibility);
    map.setLayoutProperty("parks-outline", "visibility", visibility);
    setIsLayerVisible(!isLayerVisible);
  };

  return (
    <>
      <div className="absolute top-3 left-3 z-10">
        <Button
          size="sm"
          variant={isLayerVisible ? "default" : "secondary"}
          onClick={toggleLayer}
        >
          {isLayerVisible ? (
            <X className="size-4 mr-1.5" />
          ) : (
            <Layers className="size-4 mr-1.5" />
          )}
          {isLayerVisible ? "Hide Parks" : "Show Parks"}
        </Button>
      </div>

      {hoveredPark && (
        <div className="absolute bottom-3 left-3 z-10 rounded-md bg-background/90 backdrop-blur px-3 py-2 text-sm font-medium border">
          {hoveredPark}
        </div>
      )}
    </>
  );
}

export function CustomLayerExample() {
  return (
    <div className="h-[400px] w-full overflow-hidden">
      <Map center={[-73.97, 40.78]} zoom={11.8}>
        <MapControls />
        <CustomLayer />
      </Map>
    </div>
  );
}
