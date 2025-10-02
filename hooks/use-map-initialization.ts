import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';

const DEFAULT_CENTER: [number, number] = [76.886, 43.238];
const DEFAULT_ZOOM = 11;
const API_KEY = '9zZ4lJvufSPFPoOGi6yZ';

export const useMapInitialization = (containerRef: React.RefObject<HTMLDivElement>) => {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    setIsLoading(true);

    try {
      mapRef.current = new maplibregl.Map({
        container: containerRef.current,
        style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${API_KEY}`,
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        attributionControl: false,
        maxZoom: 18,
        minZoom: 9,
      });

      mapRef.current.on('load', () => {
        console.log('Map loaded successfully');
        setIsLoading(false);
      });

      mapRef.current.on('error', (e) => {
        console.error('Map error:', e);
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      setIsLoading(false);
    }

    return () => {
      if (mapRef.current) {
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
