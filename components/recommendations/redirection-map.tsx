"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { FacilityStatistic } from "@/types/healthcare";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation, X, MapPin, AlertTriangle, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormulaInfoDialog } from "./formula-info-dialog";

interface RedirectionMapProps {
  source: FacilityStatistic | null;
  targets: FacilityStatistic[]; // Массив альтернатив
  onClose?: () => void;
}

export function RedirectionMap({
  source,
  targets,
  onClose,
}: RedirectionMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isFormulaDialogOpen, setIsFormulaDialogOpen] = useState(false);

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
    if (!map.current || !mapLoaded || !source || targets.length === 0) return;

    // Clear previous markers and routes
    const markersToRemove = document.querySelectorAll(".maplibregl-marker");
    markersToRemove.forEach((marker) => marker.remove());

    // Remove old route layers
    for (let i = 0; i < 10; i++) {
      if (map.current.getLayer(`route-${i}`)) {
        map.current.removeLayer(`route-${i}`);
      }
      if (map.current.getLayer(`route-arrow-${i}`)) {
        map.current.removeLayer(`route-arrow-${i}`);
      }
      if (map.current.getSource(`route-${i}`)) {
        map.current.removeSource(`route-${i}`);
      }
    }

    // Add source marker (red - overloaded)
    const sourceEl = document.createElement("div");
    sourceEl.className = "marker-source";
    sourceEl.innerHTML = `
      <style>
        @keyframes pulse-red {
          0%, 100% { box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4), 0 0 0 0 rgba(220, 38, 38, 0.7); }
          50% { box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4), 0 0 0 15px rgba(220, 38, 38, 0); }
        }
        .pulse-marker {
          animation: pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      </style>
      <div class="pulse-marker" style="
        background-color: #dc2626;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 4px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        cursor: pointer;
        z-index: 100;
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

    // Add target markers (green - available) and routes
    const bounds = new maplibregl.LngLatBounds().extend([
      source.longitude,
      source.latitude,
    ]);

    targets.forEach((target, index) => {
      // Add target marker
      const targetEl = document.createElement("div");
      targetEl.innerHTML = `
        <div style="
          background-color: #16a34a;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
          color: white;
          cursor: pointer;
        ">
          ${index + 1}
        </div>
      `;

      new maplibregl.Marker({ element: targetEl })
        .setLngLat([target.longitude, target.latitude])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div style="font-family: system-ui; padding: 4px;">
              <div style="font-size: 10px; color: #666; margin-bottom: 2px;">#${
                index + 1
              }</div>
              <div style="font-weight: 600; margin-bottom: 4px;">${
                target.medical_organization
              }</div>
              <div style="font-size: 12px; color: #16a34a; font-weight: 600;">
                Доступно: ${Math.round(target.occupancy_rate_percent * 100)}%
              </div>
            </div>
          `)
        )
        .addTo(map.current!);

      // Draw route line
      const colors = [
        "#3b82f6", // blue
        "#8b5cf6", // purple
        "#ec4899", // pink
        "#f59e0b", // amber
        "#10b981", // emerald
      ];

      map.current!.addSource(`route-${index}`, {
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

      map.current!.addLayer({
        id: `route-${index}`,
        type: "line",
        source: `route-${index}`,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": colors[index % colors.length],
          "line-width": 4,
          "line-opacity": 0.8,
          "line-dasharray": [0, 2, 2],
        },
      });

      // Add arrow symbol layer for direction
      map.current!.addLayer({
        id: `route-arrow-${index}`,
        type: "symbol",
        source: `route-${index}`,
        layout: {
          "symbol-placement": "line",
          "text-field": "→",
          "text-size": 20,
          "symbol-spacing": 100,
          "text-keep-upright": false,
          "text-rotation-alignment": "map",
        },
        paint: {
          "text-color": colors[index % colors.length],
          "text-halo-color": "#ffffff",
          "text-halo-width": 2,
        },
      });

      // Extend bounds to include this target
      bounds.extend([target.longitude, target.latitude]);
    });

    // Fit bounds to show all markers
    map.current.fitBounds(bounds, {
      padding: 80,
      duration: 1000,
    });
  }, [source, targets, mapLoaded]);

  return (
    <div className="space-y-3 h-full flex flex-col">
      {/* Show info/instructions when no selection */}
      {(!source || targets.length === 0) && (
        <Card className="border-dashed border-2 flex-shrink-0">
          <CardContent className="flex items-center justify-center text-center p-6">
            <div>
              <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <h3 className="text-base font-semibold mb-1">
                Выберите больницу
              </h3>
              <p className="text-xs text-muted-foreground">
                Нажмите на перегруженную больницу справа чтобы увидеть все
                маршруты перенаправления на карте
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show source info when selected */}
      {source && targets.length > 0 && (
        <>
          {/* Info Header - Source */}
          <Card className="border-2 border-red-300 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/40 flex-shrink-0">
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600 rounded-lg shadow-md">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-base text-red-900 dark:text-red-100">
                    {source.medical_organization}
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {source.district} район • {targets.length} альтернатив
                  </p>
                </div>
                <Badge className="bg-red-600 hover:bg-red-700 text-white text-xl px-4 py-2">
                  {Math.round(source.occupancy_rate_percent * 100)}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Targets List - Compact */}
          {/* <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 flex-shrink-0">
            <CardContent className="p-3">
              <div className="space-y-1.5">
                {targets.map((target, index) => {
                  const distance =
                    Math.sqrt(
                      Math.pow(target.longitude - source.longitude, 2) +
                        Math.pow(target.latitude - source.latitude, 2)
                    ) * 111;

                  const colors = [
                    { bg: "bg-blue-500", text: "text-blue-900" },
                    { bg: "bg-purple-500", text: "text-purple-900" },
                    { bg: "bg-pink-500", text: "text-pink-900" },
                    { bg: "bg-amber-500", text: "text-amber-900" },
                    { bg: "bg-emerald-500", text: "text-emerald-900" },
                  ];

                  const color = colors[index % colors.length];

                  return (
                    <div
                      key={target.id}
                      className="flex items-center gap-2 text-sm bg-white dark:bg-gray-800 p-2 rounded border"
                    >
                      <div
                        className={`w-7 h-7 rounded-full ${color.bg} text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs truncate">
                          {target.medical_organization}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{distance.toFixed(1)} км</span>
                          <span>•</span>
                          <span>~{Math.round((distance / 40) * 60)} мин</span>
                          <span>•</span>
                          <span className="text-green-600 font-medium">
                            {Math.round(target.occupancy_rate_percent * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card> */}
        </>
      )}

      {/* Map */}
      <Card className="overflow-hidden shadow-lg flex-1 min-h-0 p-0">
        <CardContent className="p-0 h-full">
          <div className="flex justify-end p-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFormulaDialogOpen(true)}
              className="flex-shrink-0 gap-2"
            >
              <Calculator className="h-4 w-4" />
              Подробнее
            </Button>
          </div>

          <FormulaInfoDialog
            open={isFormulaDialogOpen}
            onOpenChange={setIsFormulaDialogOpen}
          />
          <div
            ref={mapContainer}
            className="w-full h-full  bg-gray-100 dark:bg-gray-900"
          />
        </CardContent>
      </Card>
    </div>
  );
}
