"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { FacilityStatistic } from "@/types/healthcare";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RedirectionMapProps {
  source: FacilityStatistic | null;
  target: FacilityStatistic | null;
  onClose?: () => void;
}

export function RedirectionMap({
  source,
  target,
  onClose,
}: RedirectionMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return; // already initialized

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [76.9286, 43.2566], // Almaty coordinates
      zoom: 11,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded || !source || !target) return;

    // Clear previous markers and routes
    const markersToRemove = document.querySelectorAll(".maplibregl-marker");
    markersToRemove.forEach((marker) => marker.remove());

    if (map.current.getLayer("route")) {
      map.current.removeLayer("route");
    }
    if (map.current.getSource("route")) {
      map.current.removeSource("route");
    }

    // Add source marker (red - overloaded)
    const sourceEl = document.createElement("div");
    sourceEl.className = "marker-source";
    sourceEl.innerHTML = `
      <div style="
        background-color: #dc2626;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        cursor: pointer;
      ">
        🏥
      </div>
    `;

    new maplibregl.Marker({ element: sourceEl })
      .setLngLat([source.longitude, source.latitude])
      .setPopup(
        new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div style="font-family: system-ui; padding: 4px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${
              source.medical_organization
            }</div>
            <div style="font-size: 12px; color: #dc2626; font-weight: 600;">
              Перегружено: ${Math.round(source.occupancy_rate_percent * 100)}%
            </div>
          </div>
        `)
      )
      .addTo(map.current);

    // Add target marker (green - available)
    const targetEl = document.createElement("div");
    targetEl.innerHTML = `
      <div style="
        background-color: #16a34a;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        cursor: pointer;
      ">
        🏥
      </div>
    `;

    new maplibregl.Marker({ element: targetEl })
      .setLngLat([target.longitude, target.latitude])
      .setPopup(
        new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div style="font-family: system-ui; padding: 4px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${
              target.medical_organization
            }</div>
            <div style="font-size: 12px; color: #16a34a; font-weight: 600;">
              Доступно: ${Math.round(target.occupancy_rate_percent * 100)}%
            </div>
          </div>
        `)
      )
      .addTo(map.current);

    // Draw route line
    map.current.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [source.longitude, source.latitude],
            [target.longitude, target.latitude],
          ],
        },
      },
    });

    map.current.addLayer({
      id: "route",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#3b82f6",
        "line-width": 4,
        "line-dasharray": [2, 2],
      },
    });

    // Fit bounds to show both markers
    const bounds = new maplibregl.LngLatBounds()
      .extend([source.longitude, source.latitude])
      .extend([target.longitude, target.latitude]);

    map.current.fitBounds(bounds, {
      padding: 100,
      duration: 1000,
    });
  }, [source, target, mapLoaded]);

  if (!source || !target) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center h-96 text-center p-6">
          <div>
            <Navigation className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Выберите маршрут</h3>
            <p className="text-sm text-muted-foreground">
              Нажмите &quot;На карте&quot; рядом с рекомендацией для отображения
              маршрута
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Вычисляем расстояние для отображения
  const distance =
    Math.sqrt(
      Math.pow(target.longitude - source.longitude, 2) +
        Math.pow(target.latitude - source.latitude, 2)
    ) * 111; // приблизительный расчет в км

  return (
    <div className="space-y-3">
      {/* Info Section - Compact */}
      <div className="grid grid-cols-5 gap-3">
        <Card className="border border-red-300 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/40 dark:to-red-900/20 col-span-2">
          <CardContent className="p-3">
            <Badge className="bg-red-600 hover:bg-red-700 text-white shadow-sm mb-2 text-xs">
              Откуда
            </Badge>
            <p className="font-semibold text-sm leading-tight mb-1.5 line-clamp-2">
              {source.medical_organization}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <MapPin className="h-3 w-3" />
              {source.district}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-red-600 font-bold text-2xl">
                {Math.round(source.occupancy_rate_percent * 100)}%
              </span>
              <span className="text-xs text-muted-foreground">загрузка</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-green-300 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/40 dark:to-green-900/20 col-span-2">
          <CardContent className="p-3">
            <Badge className="bg-green-600 hover:bg-green-700 text-white shadow-sm mb-2 text-xs">
              Куда
            </Badge>
            <p className="font-semibold text-sm leading-tight mb-1.5 line-clamp-2">
              {target.medical_organization}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <MapPin className="h-3 w-3" />
              {target.district}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-green-600 font-bold text-2xl">
                {Math.round(target.occupancy_rate_percent * 100)}%
              </span>
              <span className="text-xs text-muted-foreground">загрузка</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40">
          <CardContent className="p-3 flex flex-col items-center justify-center h-full">
            <div className="p-2 bg-blue-600 rounded-lg shadow-md mb-2">
              <Navigation className="h-5 w-5 text-white" />
            </div>
            <p className="font-bold text-lg text-blue-900 dark:text-blue-100">
              {distance.toFixed(1)} км
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              ~{Math.round((distance / 40) * 60)} мин
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <Card className="overflow-hidden shadow-lg">
        <CardContent className="p-0">
          <div
            ref={mapContainer}
            className="w-full min-h-[450px] bg-gray-100 dark:bg-gray-900"
          />
        </CardContent>
      </Card>
    </div>
  );
}
