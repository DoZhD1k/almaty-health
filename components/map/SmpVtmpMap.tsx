"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { useMapInitialization } from "@/hooks/use-map-initialization";
import { FacilityStatistic } from "@/types/healthcare";
import { GEOJSON_LAYERS, loadGeoJSON, GeoJSONLayer } from "@/lib/utils/geojson";
import { LayerControlPanel } from "./LayerControlPanel";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface SmpVtmpMapProps {
  facilities?: FacilityStatistic[];
  className?: string;
}

interface DistrictFeature {
  type: string;
  geometry: any;
  properties: {
    id: number;
    name_ru: string;
    name_kz: string;
    marker: [number, number];
  };
}

// Функция для получения цвета статуса по загруженности
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

export function SmpVtmpMap({
  facilities = [],
  className = "",
}: SmpVtmpMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { mapRef, isLoading, zoomIn, zoomOut, resetView } =
    useMapInitialization(containerRef);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [districts, setDistricts] = useState<DistrictFeature[]>([]);
  const [layers, setLayers] = useState<GeoJSONLayer[]>(GEOJSON_LAYERS);
  const [showApiFacilities, setShowApiFacilities] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  // Слушаем событие загрузки карты
  useEffect(() => {
    console.log(
      "SmpVtmpMap: mapRef.current =",
      !!mapRef.current,
      "mapReady =",
      mapReady
    );

    if (!mapRef.current || mapReady) return;

    const map = mapRef.current;

    const onMapLoad = () => {
      console.log("Map loaded in SmpVtmpMap");
      setMapReady(true);
    };

    const onMapError = (e: any) => {
      console.error("Map error in SmpVtmpMap:", e);
    };

    if (map.loaded()) {
      console.log("Map already loaded, setting ready");
      setMapReady(true);
    } else {
      console.log("Waiting for map to load...");
      map.on("load", onMapLoad);
      map.on("error", onMapError);
    }

    return () => {
      map.off("load", onMapLoad);
      map.off("error", onMapError);
    };
  }, [mapRef, mapReady]);

  // Загрузка данных районов
  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const response = await fetch("/geo-files/districts.geojson");
        if (response.ok) {
          const data = await response.json();
          setDistricts(data.features);
        }
      } catch (error) {
        console.error("Error loading districts:", error);
      }
    };
    loadDistricts();
  }, []);

  // Обновление маркеров учреждений
  useEffect(() => {
    if (!mapRef.current || !mapReady || !showApiFacilities) {
      // Удаляем все маркеры если карта не готова или показ отключен
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      return;
    }

    // Удаляем существующие маркеры
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Фильтруем учреждения, которые оказывают СМП или ВТМП
    const smpVtmpFacilities = facilities.filter(
      (facility) =>
        (facility.released_smp && facility.released_smp > 0) ||
        (facility.death_smp && facility.death_smp > 0) ||
        (facility.released_vtmp && facility.released_vtmp > 0) ||
        (facility.death_vtmp && facility.death_vtmp > 0)
    );

    // Добавляем маркеры для СМП/ВТМП учреждений
    smpVtmpFacilities.forEach((facility) => {
      if (facility.latitude && facility.longitude && mapRef.current) {
        const occupancyRate = facility.occupancy_rate_percent || 0;
        const statusColor = getStatusColor(occupancyRate);
        const statusText = getStatusText(occupancyRate);

        // Вычисляем данные СМП и ВТМП
        const smpTotal =
          (facility.released_smp || 0) + (facility.death_smp || 0);
        const vtmpTotal =
          (facility.released_vtmp || 0) + (facility.death_vtmp || 0);
        const smpMortality =
          smpTotal > 0
            ? (((facility.death_smp || 0) / smpTotal) * 100).toFixed(1)
            : "0";
        const vtmpMortality =
          vtmpTotal > 0
            ? (((facility.death_vtmp || 0) / vtmpTotal) * 100).toFixed(1)
            : "0";

        // Определяем тип учреждения по преобладающему виду помощи
        const facilityType = smpTotal > vtmpTotal ? "СМП" : "ВТМП";
        const typeColor = smpTotal > vtmpTotal ? "#3b82f6" : "#22c55e";

        // Создаем элемент маркера
        const markerElement = document.createElement("div");
        markerElement.className = "relative";
        markerElement.innerHTML = `
          <div class="w-4 h-4 rounded-full border-2 border-white shadow-md" 
               style="background-color: ${statusColor}"></div>
          <div class="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white" 
               style="background-color: ${typeColor}"></div>
        `;

        // Создаем popup
        const popup = new maplibregl.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: false,
        }).setHTML(`
          <div class="p-3 min-w-72">
            <h3 class="font-semibold text-sm mb-2 text-gray-900">${
              facility.medical_organization
            }</h3>
            <div class="space-y-2 text-xs">
              <div class="grid grid-cols-2 gap-2">
                <div class="bg-blue-50 p-2 rounded">
                  <div class="font-medium text-blue-800">СМП</div>
                  <div class="text-blue-600">Пациентов: ${smpTotal}</div>
                  <div class="text-blue-600">Летальность: ${smpMortality}%</div>
                </div>
                <div class="bg-green-50 p-2 rounded">
                  <div class="font-medium text-green-800">ВТМП</div>
                  <div class="text-green-600">Пациентов: ${vtmpTotal}</div>
                  <div class="text-green-600">Летальность: ${vtmpMortality}%</div>
                </div>
              </div>
              <div class="border-t pt-2">
                <div><span class="font-medium">Тип собственности:</span> ${
                  facility.bed_profile || "Не указан"
                }</div>
                <div><span class="font-medium">Район:</span> ${
                  facility.district || "Не указан"
                }</div>
                <div><span class="font-medium">Загруженность:</span> 
                  <span style="color: ${statusColor}; font-weight: 500">${Math.round(
          occupancyRate * 100
        )}% (${statusText})</span>
                </div>
                <div><span class="font-medium">Адрес:</span> ${
                  facility.address || "Не указан"
                }</div>
              </div>
            </div>
          </div>
        `);

        // Создаем и добавляем маркер
        const marker = new maplibregl.Marker({
          element: markerElement,
        })
          .setLngLat([facility.longitude, facility.latitude])
          .setPopup(popup)
          .addTo(mapRef.current);

        markersRef.current.push(marker);
      }
    });
  }, [facilities, showApiFacilities, mapRef, mapReady]);

  // Обработка переключения слоев
  const handleLayerToggle = async (layerId: string, visible: boolean) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, visible } : layer
      )
    );

    if (!mapRef.current || !mapReady) return;

    if (visible) {
      try {
        const layer = layers.find((l) => l.id === layerId);
        if (layer) {
          const geoJsonData = await loadGeoJSON(layer.url);

          // Добавляем источник данных
          if (!mapRef.current.getSource(layerId)) {
            mapRef.current.addSource(layerId, {
              type: "geojson",
              data: geoJsonData,
            });
          }

          // Добавляем слой
          if (!mapRef.current.getLayer(layerId)) {
            mapRef.current.addLayer({
              id: layerId,
              type: "fill",
              source: layerId,
              paint: {
                "fill-color": layer.style?.fillColor || "#3388ff",
                "fill-opacity": layer.style?.fillOpacity || 0.1,
              },
            });

            // Добавляем границы
            mapRef.current.addLayer({
              id: `${layerId}-line`,
              type: "line",
              source: layerId,
              paint: {
                "line-color": layer.style?.color || "#3388ff",
                "line-width": layer.style?.weight || 2,
                "line-opacity": layer.style?.opacity || 0.8,
              },
            });
          }
        }
      } catch (error) {
        console.error(`Error loading layer ${layerId}:`, error);
      }
    } else {
      // Удаляем слой с безопасной проверкой
      try {
        const map = mapRef.current;
        if (map && !map._removed) {
          if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
          }
          if (map.getLayer(`${layerId}-line`)) {
            map.removeLayer(`${layerId}-line`);
          }
          if (map.getSource(layerId)) {
            map.removeSource(layerId);
          }
        }
      } catch (error) {
        console.warn(`Error removing layer ${layerId}:`, error);
      }
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      try {
        markersRef.current.forEach((marker) => {
          if (marker && typeof marker.remove === "function") {
            marker.remove();
          }
        });
        markersRef.current = [];
      } catch (error) {
        console.warn("Error cleaning up markers:", error);
      }
    };
  }, []);

  if (isLoading || !mapReady) {
    return (
      <div
        className={`flex items-center justify-center h-96 bg-gray-100 rounded-lg ${className}`}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Загрузка карты...</p>
          {!isLoading && !mapReady && (
            <p className="text-gray-500 text-sm mt-1">
              Инициализация компонентов карты...
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className="w-full h-96 rounded-lg overflow-hidden shadow-md"
      />

      {/* Панель управления слоями */}
      <div className="absolute top-4 left-4">
        <LayerControlPanel
          layers={layers}
          onLayerToggle={handleLayerToggle}
          showApiFacilities={showApiFacilities}
          onApiFacilitiesToggle={setShowApiFacilities}
        />
      </div>

      {/* Кнопки управления картой */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <Button
          variant="outline"
          size="icon"
          onClick={zoomIn}
          className="bg-white/90 hover:bg-white"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={zoomOut}
          className="bg-white/90 hover:bg-white"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={resetView}
          className="bg-white/90 hover:bg-white"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Легенда */}
      <div className="absolute bottom-4 right-4 bg-white/90 p-3 rounded-lg shadow-md">
        <h4 className="font-medium text-sm mb-2">Легенда</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Преобладает СМП</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Преобладает ВТМП</span>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            <div>Размер маркера = загруженность</div>
          </div>
        </div>
      </div>
    </div>
  );
}
