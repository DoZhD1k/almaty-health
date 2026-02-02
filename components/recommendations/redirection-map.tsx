"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { FacilityStatistic } from "@/types/healthcare";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation, MapPin, AlertTriangle, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormulaInfoDialog } from "./formula-info-dialog";
import {
  findNearbyAlternatives,
  isCompatibleFacilityType,
} from "@/lib/utils/distance";
import {
  createFacilityPopupWithActionsHTML,
  popupStyles,
} from "@/lib/utils/popup-styles";

interface RedirectionMapProps {
  source: FacilityStatistic | null;
  targets: FacilityStatistic[]; // Массив альтернатив
  allFacilities: FacilityStatistic[]; // Все больницы для отображения на карте
  onClose?: () => void;
  onSelectFacility?: (
    source: FacilityStatistic,
    alternatives: FacilityStatistic[],
  ) => void;
}

export function RedirectionMap({
  source,
  targets = [],
  allFacilities = [],
  onClose,
  onSelectFacility,
}: RedirectionMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const currentPopup = useRef<maplibregl.Popup | null>(null);
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
      zoom: 10,
    });

    map.current.on("load", () => {
      setMapLoaded(true);

      // Add unified popup styles
      const style = document.createElement("style");
      style.innerHTML = popupStyles;
      document.head.appendChild(style);
    });

    return () => {
      // Cleanup global functions
      delete (window as any).analyzeOverloaded;
      delete (window as any).analyzeUnderloaded;
      delete (window as any).analyzeFacility;

      // Close current popup if exists
      if (currentPopup.current) {
        currentPopup.current.remove();
        currentPopup.current = null;
      }

      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Helper functions for facility status
  const getStatusColor = (occupancyRate: number) => {
    if (occupancyRate > 0.95) return "#dc2626"; // red-600 - критическая (выше 95%)
    if (occupancyRate > 0.8) return "#ea580c"; // orange-600 - высокая (80-95%)
    if (occupancyRate >= 0.5) return "#16a34a"; // green-600 - нормальная (50-80%)
    return "#6b7280"; // gray-500 - низкая (ниже 50%)
  };

  const getStatusText = (occupancyRate: number) => {
    if (occupancyRate > 0.95) return "Критическая";
    if (occupancyRate > 0.8) return "Высокая";
    if (occupancyRate >= 0.5) return "Нормальная";
    return "Низкая";
  };

  // Функция для поиска перегруженных больниц, которые могут направлять пациентов в выбранную больницу
  const findOverloadedSources = (
    targetFacility: FacilityStatistic,
    allFacilities: FacilityStatistic[],
  ) => {
    return allFacilities.filter((facility) => {
      // Исключаем саму больницу
      if (facility.id === targetFacility.id) return false;

      // Ищем только перегруженные (загрузка > 80%)
      if (facility.occupancy_rate_percent <= 0.8) return false;

      // Проверяем совместимость типов
      if (
        !isCompatibleFacilityType(
          facility.facility_type,
          targetFacility.facility_type,
        )
      ) {
        return false;
      }

      // Должны быть координаты
      if (!facility.latitude || !facility.longitude) return false;

      // Целевая больница должна иметь доступные койки
      if (targetFacility.beds_deployed_withdrawn_for_rep <= 0) return false;

      return true;
    });
  };

  // Effect for displaying all facilities as clickable markers
  useEffect(() => {
    if (
      !map.current ||
      !mapLoaded ||
      !allFacilities ||
      allFacilities.length === 0
    )
      return;

    // Add global functions for popup buttons (with current data)
    (window as any).analyzeOverloaded = (facilityId: string) => {
      const facility = allFacilities.find(
        (f) => f.id.toString() === facilityId,
      );
      if (facility && onSelectFacility) {
        const alternativeResults = findNearbyAlternatives(
          facility,
          allFacilities,
        );
        const alternatives = alternativeResults.map((alt) => alt.facility);
        onSelectFacility(facility, alternatives);
      }
    };

    (window as any).analyzeUnderloaded = (facilityId: string) => {
      const facility = allFacilities.find(
        (f) => f.id.toString() === facilityId,
      );
      if (facility && onSelectFacility) {
        const overloadedSources = findOverloadedSources(
          facility,
          allFacilities,
        );
        if (overloadedSources.length > 0) {
          onSelectFacility(facility, overloadedSources);
        } else {
          onSelectFacility(facility, []);
        }
      }
    };

    (window as any).analyzeFacility = (facilityId: string) => {
      const facility = allFacilities.find(
        (f) => f.id.toString() === facilityId,
      );
      if (facility && onSelectFacility) {
        onSelectFacility(facility, []);
      }
    };

    // Clear previous markers and routes
    const markersToRemove = document.querySelectorAll(".maplibregl-marker");
    markersToRemove.forEach((marker) => marker.remove());

    // Close any open popup before recreating markers
    if (currentPopup.current) {
      currentPopup.current.remove();
      currentPopup.current = null;
    }

    // Remove old route layers
    for (let i = 0; i < 10; i++) {
      if (map.current.getLayer(`route-${i}`)) {
        map.current.removeLayer(`route-${i}`);
      }
      if (map.current.getSource(`route-${i}`)) {
        map.current.removeSource(`route-${i}`);
      }
    }

    // Add all facilities as markers
    allFacilities.forEach((facility) => {
      const color = getStatusColor(facility.occupancy_rate_percent);
      const status = getStatusText(facility.occupancy_rate_percent);
      const isSelected = source?.id === facility.id;
      const isTarget = targets && targets.some((t) => t.id === facility.id);

      // Определяем тип отображения в зависимости от сценария
      const isReverseDirection = source && source.occupancy_rate_percent < 0.7;

      let markerType:
        | "selected-source"
        | "target"
        | "reverse-source"
        | "reverse-target"
        | "normal";

      if (isSelected && isReverseDirection) {
        // Незагруженная больница выбрана - показываем как целевую (зеленая)
        markerType = "reverse-target";
      } else if (isSelected && !isReverseDirection) {
        // Перегруженная больница выбрана - показываем как источник (красная пульсирующая)
        markerType = "selected-source";
      } else if (isTarget && isReverseDirection) {
        // Перегруженные больницы как источники в обратном сценарии (красные с номерами)
        markerType = "reverse-source";
      } else if (isTarget && !isReverseDirection) {
        // Незагруженные больницы как цели в прямом сценарии (зеленые с номерами)
        markerType = "target";
      } else {
        // Обычные больницы
        markerType = "normal";
      }

      // Create marker element
      const el = document.createElement("div");

      if (markerType === "selected-source") {
        // Перегруженная больница выбрана как источник - пульсирующий красный маркер
        el.className = "facility-marker selected-source";
        el.innerHTML = `
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
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            cursor: pointer;
            z-index: 100;
          ">
            🏥
          </div>
        `;
      } else if (markerType === "reverse-target") {
        // Незагруженная больница выбрана как цель - пульсирующий зеленый маркер
        el.className = "facility-marker selected-target";
        el.innerHTML = `
          <style>
            @keyframes pulse-green {
              0%, 100% { box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4), 0 0 0 0 rgba(34, 197, 94, 0.7); }
              50% { box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4), 0 0 0 15px rgba(34, 197, 94, 0); }
            }
            .pulse-marker-green {
              animation: pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
          </style>
          <div class="pulse-marker-green" style="
            background-color: #22c55e;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            cursor: pointer;
            z-index: 100;
          ">
            🎯
          </div>
        `;
      } else if (markerType === "reverse-source") {
        // Перегруженные больницы как источники в обратном сценарии - красные с номерами
        const targetIndex = targets
          ? targets.findIndex((t) => t.id === facility.id)
          : -1;
        el.className = "facility-marker reverse-source";
        el.innerHTML = `
          <div style="
            background-color: #dc2626;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
            color: white;
            cursor: pointer;
          ">
            ${targetIndex + 1}
          </div>
        `;
      } else if (markerType === "target") {
        // Незагруженные больницы как цели в прямом сценарии - зеленые с номерами
        const targetIndex = targets
          ? targets.findIndex((t) => t.id === facility.id)
          : -1;
        el.className = "facility-marker target";
        el.innerHTML = `
          <div style="
            background-color: #16a34a;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
            color: white;
            cursor: pointer;
          ">
            ${targetIndex + 1}
          </div>
        `;
      } else {
        // Обычные больницы
        el.className = "facility-marker";
        el.style.width = "16px";
        el.style.height = "16px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = color;
        el.style.border = "2px solid white";
        el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
        el.style.cursor = "pointer";
      }

      // Calculate additional statistics
      const totalBeds = facility.beds_deployed_withdrawn_for_rep || 0;
      const occupancyPercent = Math.round(
        facility.occupancy_rate_percent * 100,
      );
      const availableBeds = Math.floor(
        totalBeds * (1 - facility.occupancy_rate_percent),
      );
      const occupiedBeds = totalBeds - availableBeds;

      // Create unified popup content with action buttons
      const popupContent = createFacilityPopupWithActionsHTML({
        name: facility.medical_organization,
        district: facility.district ? `${facility.district} район` : undefined,
        facilityType: facility.facility_type,
        bedProfile: facility.bed_profile,
        occupancyRate: facility.occupancy_rate_percent,
        totalBeds: totalBeds,
        id: facility.id.toString(),
        isSelected: isSelected,
        onAnalyzeOverloaded: `window.analyzeOverloaded('${facility.id}')`,
        onAnalyzeUnderloaded: `window.analyzeUnderloaded('${facility.id}')`,
        onAnalyze: `window.analyzeFacility('${facility.id}')`,
      });

      const popup = new maplibregl.Popup({
        offset: 20,
        maxWidth: "350px",
        closeOnClick: false,
        closeButton: true,
      }).setHTML(popupContent);

      // Handle popup open event to close previous popup
      popup.on("open", () => {
        // Close current popup if exists
        if (currentPopup.current && currentPopup.current !== popup) {
          currentPopup.current.remove();
        }
        // Set this popup as current
        currentPopup.current = popup;
      });

      // Handle popup close event
      popup.on("close", () => {
        if (currentPopup.current === popup) {
          currentPopup.current = null;
        }
      });

      // Remove click handler - now using buttons in popup instead

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([Number(facility.longitude), Number(facility.latitude)])
        .setPopup(popup)
        .addTo(map.current!);
    });

    // Add route lines if source and targets are selected
    if (source && targets && targets.length > 0) {
      const bounds = new maplibregl.LngLatBounds().extend([
        source.longitude,
        source.latitude,
      ]);

      // Определяем направление маршрутов
      const isReverseDirection = source.occupancy_rate_percent < 0.7; // незагруженная больница как "источник"

      targets.forEach((target, index) => {
        // Draw route line
        const colors = [
          "#3b82f6", // blue
          "#8b5cf6", // purple
          "#ec4899", // pink
          "#f59e0b", // amber
          "#10b981", // emerald
        ];

        // Для незагруженной больницы (обратное направление): от targets к source
        // Для перегруженной больницы (прямое направление): от source к targets
        const routeCoordinates = isReverseDirection
          ? [
              [target.longitude, target.latitude], // от перегруженной
              [source.longitude, source.latitude], // к незагруженной
            ]
          : [
              [source.longitude, source.latitude], // от перегруженной
              [target.longitude, target.latitude], // к незагруженной
            ];

        map.current!.addSource(`route-${index}`, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: routeCoordinates,
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

        // Add directional animated line (no arrows needed - direction is clear from source to target)
        // The dashed line animation already shows direction

        // Extend bounds to include this target
        bounds.extend([target.longitude, target.latitude]);
      });

      // Fit bounds to show all markers and routes
      map.current.fitBounds(bounds, {
        padding: 50,
        duration: 1000,
      });
    }
  }, [allFacilities, source, targets, mapLoaded, onSelectFacility]);

  return (
    <div className="space-y-3 h-full flex flex-col">
      {/* Show info/instructions when no selection */}
      {(!source || !targets || targets.length === 0) && (
        <Card className="border-dashed border-2 flex-shrink-0">
          <CardContent>
            <div className="flex items-center gap-3">
              <Navigation className="h-5 w-5 text-muted-foreground opacity-50 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-1">
                  Карта больниц Алматы
                </h3>
                <p className="text-xs text-muted-foreground leading-tight">
                  <span className="font-semibold">Красные точки</span>{" "}
                  (перегруженные) - нажмите для поиска куда перенаправить
                  <br />
                  <span className="font-semibold">Зеленые точки</span>{" "}
                  (доступные) - нажмите чтобы увидеть откуда могут направлять
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show source info when selected */}
      {source && targets && targets.length > 0 && (
        <>
          {/* Info Header - показываем разную информацию в зависимости от сценария */}
          {source.occupancy_rate_percent < 0.7 ? (
            // Обратный сценарий: незагруженная больница выбрана
            <Card className="border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 flex-shrink-0">
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-600 rounded-lg shadow-md">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-base text-green-900 dark:text-green-100">
                      {source.medical_organization}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {source.district} район • Может принять из{" "}
                      {targets.length} больниц
                    </p>
                  </div>
                  <Badge className="bg-green-600 hover:bg-green-700 text-white text-xl px-4 py-2">
                    {Math.round(source.occupancy_rate_percent * 100)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Прямой сценарий: перегруженная больница выбрана
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
          )}

          {/* Targets List - Compact */}
          {/* <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 flex-shrink-0">
            <CardContent className="p-3">
              <div className="space-y-1.5">
                {targets && targets.map((target, index) => {
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
