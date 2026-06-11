import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";

const DEFAULT_CENTER: [number, number] = [76.886, 43.238];
const DEFAULT_ZOOM = 11;
const API_KEY = "9zZ4lJvufSPFPoOGi6yZ";

export const useMapInitialization = (
  containerRef: React.RefObject<HTMLDivElement | null>
) => {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log(
      "useMapInitialization: Effect triggered, mapRef.current:",
      !!mapRef.current,
      "containerRef.current:",
      !!containerRef.current
    );

    if (mapRef.current || !containerRef.current) {
      console.log(
        "useMapInitialization: Skipping - map exists or no container"
      );
      return;
    }

    console.log("useMapInitialization: Starting map initialization");
    setIsLoading(true);

    try {
      console.log("useMapInitialization: Creating new MapLibre map");
      mapRef.current = new maplibregl.Map({
        container: containerRef.current,
        style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${API_KEY}`,
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        attributionControl: false,
        maxZoom: 18,
        minZoom: 9,
      });

      console.log("useMapInitialization: Map instance created");

      mapRef.current.on("load", () => {
        console.log("useMapInitialization: Map loaded successfully");
        setIsLoading(false);
      });

      mapRef.current.on("error", (e) => {
        console.error("useMapInitialization: Map error:", e);
        setIsLoading(false);
      });
    } catch (error) {
      console.error("useMapInitialization: Error initializing map:", error);
      setIsLoading(false);
    }

    return () => {
      if (mapRef.current && !mapRef.current._removed) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [containerRef]);

  const zoomIn = () => mapRef.current?.zoomIn({ duration: 300 });
  const zoomOut = () => mapRef.current?.zoomOut({ duration: 300 });
  const resetView = () => {
    mapRef.current?.flyTo({
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      duration: 1000,
    });
  };

  return { mapRef, isLoading, zoomIn, zoomOut, resetView };
};
