"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, Layers } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

// Токен Mapbox - нужно настроить в .env.local
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes("example")) {
  console.warn(
    "⚠️ Mapbox token not configured. Please set NEXT_PUBLIC_MAPBOX_TOKEN in .env.local"
  );
}

interface SmpVtmpMapboxProps {
  className?: string;
}

interface MedicalFacility {
  type: "Feature";
  properties: {
    medical_organization: string;
    type: string;
    type2: string;
    Overload: string;
    color: string;
    Number_of_beds_actually_deployed_closed?: string;
    [key: string]: any;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
}

interface GeoJSONLayer {
  id: string;
  name: string;
  url: string;
  color: string;
  visible: boolean;
  type: "polygon" | "point" | "line";
  icon: string;
}

// Конфигурация всех доступных слоев
const AVAILABLE_LAYERS: GeoJSONLayer[] = [
  {
    id: "districts",
    name: "Районы",
    url: "/geo-files/districts.geojson",
    // color: "#627BC1",
    color: "#e04a3a",
    visible: true,
    type: "polygon",
    icon: "🏛️",
  },
  {
    id: "population_grid",
    name: "Сетка населения",
    url: "/geo-files/pop_grids.geojson",
    color: "#f59e0b",
    visible: true,
    type: "polygon",
    icon: "👥",
  },
  {
    id: "accessibility_30min",
    name: "Доступность (30 мин)",
    url: "/geo-files/30min.geojson",
    color: "#ff9a48",
    visible: true,
    type: "polygon",
    icon: "🚗",
  },
  {
    id: "accessibility_15min",
    name: "Доступность (15 мин)",
    url: "/geo-files/15min.geojson",
    color: "#eedf25",
    visible: true,
    type: "polygon",
    icon: "🚶",
  },
  {
    id: "green_10min",
    name: " (10 мин)",
    url: "/geo-files/10min_green.geojson",
    color: "#26bf32",
    visible: true,
    type: "polygon",
    icon: "🌳",
  },
];

export function SmpVtmpMapbox({ className = "" }: SmpVtmpMapboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [facilities, setFacilities] = useState<MedicalFacility[]>([]);
  const [layers, setLayers] = useState<GeoJSONLayer[]>(AVAILABLE_LAYERS);
  const [showLayerPanel, setShowLayerPanel] = useState(false);

  // Инициализация карты
  useEffect(() => {
    if (!containerRef.current) return;

    // Проверяем наличие токена Mapbox
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes("example")) {
      console.error("Mapbox token not configured properly");
      setIsLoading(false);
      return;
    }

    // Устанавливаем токен Mapbox
    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Создаем карту
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [76.9, 43.25], // Координаты Алматы
      zoom: 11,
      maxZoom: 18,
      minZoom: 9,
    });

    mapRef.current = map;

    map.on("load", () => {
      console.log("Mapbox: Map loaded successfully");
      setIsLoading(false);
    });

    map.on("error", (e: any) => {
      console.error("Mapbox: Map error:", e);
      setIsLoading(false);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Загрузка данных медучреждений
  useEffect(() => {
    const loadFacilities = async () => {
      try {
        console.log("Loading medical facilities from API...");
        const response = await fetch(
          "https://admin.smartalmaty.kz/api/v1/healthcare/extra-mo-refusal/?limit=200"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Loaded facilities data:", data);

        // Преобразуем данные API в формат GeoJSON если необходимо
        if (data.features && Array.isArray(data.features)) {
          setFacilities(data.features);
        } else if (Array.isArray(data)) {
          // Если API возвращает массив объектов, преобразуем в GeoJSON формат
          const geoJsonFeatures: MedicalFacility[] = data.map(
            (facility: any) => ({
              type: "Feature" as const,
              properties: {
                medical_organization:
                  facility.medical_organization || facility.name,
                type: facility.type,
                type2: facility.type2,
                Overload: facility.Overload || facility.overload,
                color: facility.color,
                Number_of_beds_actually_deployed_closed:
                  facility.Number_of_beds_actually_deployed_closed ||
                  facility.beds,
                "Patients admitted total":
                  facility["Patients admitted total"] ||
                  facility.patients_admitted,
                "Rural residents":
                  facility["Rural residents"] || facility.rural_residents,
                ...facility,
              },
              geometry: {
                type: "Point" as const,
                coordinates: [
                  facility.longitude ||
                    facility.lng ||
                    facility.coordinates?.[0],
                  facility.latitude ||
                    facility.lat ||
                    facility.coordinates?.[1],
                ],
              },
            })
          );
          setFacilities(geoJsonFeatures);
        }
      } catch (error) {
        console.error("Error loading facilities from API:", error);
        // Fallback к локальному файлу если API недоступен
        try {
          console.log("Trying fallback to local file...");
          const fallbackResponse = await fetch(
            "/geo-files/Extra_MO_coord.geojson"
          );
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            if (fallbackData.features && Array.isArray(fallbackData.features)) {
              setFacilities(fallbackData.features);
            }
          }
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
        }
      }
    };

    loadFacilities();
  }, []);

  // Добавление маркеров на карту
  useEffect(() => {
    if (!mapRef.current || isLoading || facilities.length === 0) return;

    const map = mapRef.current;

    // Удаляем существующий источник и слой если есть
    if (map.getSource("facilities")) {
      if (map.getLayer("facilities-layer")) {
        map.removeLayer("facilities-layer");
      }
      map.removeSource("facilities");
    }

    // Добавляем источник данных
    map.addSource("facilities", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: facilities,
      },
    });

    // Функция для определения цвета маркера (как на главной странице)
    const getMarkerColor = (overload: string) => {
      const percent = parseInt(overload.replace("%", ""));
      const occupancyRate = percent / 100;

      if (occupancyRate > 0.95) return "#dc2626"; // red-600 - критическая (выше 95%)
      if (occupancyRate > 0.8) return "#ea580c"; // orange-600 - высокая (80-95%)
      if (occupancyRate >= 0.5) return "#16a34a"; // green-600 - нормальная (50-80%)
      return "#6b7280"; // gray-500 - низкая (ниже 50%)
    };

    // Функция для получения текста статуса
    const getStatusText = (overload: string) => {
      const percent = parseInt(overload.replace("%", ""));
      const occupancyRate = percent / 100;

      if (occupancyRate > 0.95) return "Критическая";
      if (occupancyRate > 0.8) return "Высокая";
      if (occupancyRate >= 0.5) return "Нормальная";
      return "Низкая";
    };

    // Добавляем слой с маркерами
    map.addLayer({
      id: "facilities-layer",
      type: "circle",
      source: "facilities",
      paint: {
        "circle-radius": ["case", ["==", ["get", "type2"], "Частные"], 8, 10],
        "circle-color": [
          "case",
          // Критическая загруженность (>95%)
          [
            ">",
            ["/", ["to-number", ["slice", ["get", "Overload"], 0, -1]], 100],
            0.95,
          ],
          "#dc2626", // red-600
          // Высокая загруженность (80-95%)
          [
            ">",
            ["/", ["to-number", ["slice", ["get", "Overload"], 0, -1]], 100],
            0.8,
          ],
          "#ea580c", // orange-600
          // Нормальная загруженность (50-80%)
          [
            ">=",
            ["/", ["to-number", ["slice", ["get", "Overload"], 0, -1]], 100],
            0.5,
          ],
          "#16a34a", // green-600
          // Низкая загруженность (<50%)
          "#6b7280", // gray-500
        ],
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 2,
        "circle-opacity": 0.8,
      },
    });

    // Добавляем всплывающие окна
    map.on("click", "facilities-layer", (e: any) => {
      if (!e.features || e.features.length === 0) return;

      const feature = e.features[0] as any;
      const props = feature.properties;

      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(
          `
          <div class="p-3 max-w-sm">
            <h3 class="font-semibold text-sm mb-2">${
              props.medical_organization
            }</h3>
            <div class="text-xs space-y-1">
              <p><strong>Тип:</strong> ${props.type}</p>
              <p><strong>Форма собственности:</strong> ${props.type2}</p>
              <p><strong>Коек:</strong> ${
                props["Number_of_ beds_actually_deployed_closed"] || "Н/Д"
              }</p>
              <p><strong>Загруженность:</strong> <span class="font-medium" style="color: ${getMarkerColor(
                props.Overload
              )}">${props.Overload} (${getStatusText(
            props.Overload
          )})</span></p>
              <p><strong>Принято пациентов:</strong> ${
                props["Patients admitted total"] || "Н/Д"
              }</p>
              <p><strong>Сельские жители:</strong> ${
                props["Rural residents"] || "Н/Д"
              }</p>
            </div>
          </div>
        `
        )
        .addTo(map);
    });

    // Меняем курсор при наведении
    map.on("mouseenter", "facilities-layer", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "facilities-layer", () => {
      map.getCanvas().style.cursor = "";
    });

    console.log(`Added ${facilities.length} medical facilities to map`);
  }, [mapRef.current, isLoading, facilities]);

  // Управление GeoJSON слоями
  useEffect(() => {
    if (!mapRef.current || isLoading || facilities.length === 0) return;

    const map = mapRef.current;

    // Проверяем, что слой медучреждений уже существует
    if (!map.getLayer("facilities-layer")) return;

    const loadGeoJSONLayers = async () => {
      for (const layer of layers) {
        const sourceId = `layer-${layer.id}`;
        const layerId = `${sourceId}-fill`;
        const strokeId = `${sourceId}-stroke`;

        // Удаляем существующие слои
        if (map.getLayer(strokeId)) map.removeLayer(strokeId);
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);

        if (!layer.visible) continue;

        try {
          console.log(`Loading layer: ${layer.name}`);
          const response = await fetch(layer.url);

          if (!response.ok) {
            console.warn(`Failed to load ${layer.name}: ${response.status}`);
            continue;
          }

          const data = await response.json();

          // Добавляем источник данных
          map.addSource(sourceId, {
            type: "geojson",
            data,
          });

          // Добавляем слой заливки для полигонов
          if (layer.type === "polygon") {
            map.addLayer(
              {
                id: layerId,
                type: "fill",
                source: sourceId,
                paint: {
                  "fill-color": layer.color,
                  "fill-opacity": 0.3,
                },
              },
              "facilities-layer"
            ); // Добавляем ДО слоя медучреждений

            // Добавляем слой границ
            map.addLayer(
              {
                id: strokeId,
                type: "line",
                source: sourceId,
                paint: {
                  "line-color": layer.color,
                  "line-width": 2,
                  "line-opacity": 1,
                },
              },
              "facilities-layer"
            ); // Добавляем ДО слоя медучреждений
          }

          console.log(`Successfully loaded layer: ${layer.name}`);
        } catch (error) {
          console.error(`Error loading layer ${layer.name}:`, error);
        }
      }
    };

    loadGeoJSONLayers();
  }, [mapRef.current, isLoading, layers, facilities]);

  // Функция для переключения видимости слоя
  const toggleLayer = (layerId: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };

  const zoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const resetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [76.9, 43.25],
        zoom: 11,
        duration: 1000,
      });
    }
  };

  return (
    <div className={`relative h-[500px] w-full ${className}`}>
      {/* Контейнер карты */}
      <div
        ref={containerRef}
        className="h-full w-full rounded-lg overflow-hidden"
      />

      {/* Ошибка настройки токена */}
      {(!MAPBOX_TOKEN || MAPBOX_TOKEN.includes("example")) && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
          <div className="text-center p-8 max-w-md">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-lg font-semibold mb-2">Настройка карты</h3>
            <p className="text-sm text-gray-600 mb-4">
              Для отображения карты необходимо настроить токен Mapbox.
            </p>
            <div className="text-xs text-left bg-gray-50 p-3 rounded border">
              <p className="font-medium mb-2">Инструкция:</p>
              <ol className="space-y-1">
                <li>1. Зарегистрируйтесь на mapbox.com</li>
                <li>2. Получите токен доступа</li>
                <li>3. Добавьте его в .env.local:</li>
                <li className="font-mono text-xs bg-white p-1 rounded">
                  NEXT_PUBLIC_MAPBOX_TOKEN=ваш_токен
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Индикатор загрузки */}
      {isLoading && MAPBOX_TOKEN && !MAPBOX_TOKEN.includes("example") && (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Загрузка карты...</p>
          </div>
        </div>
      )}

      {/* Информация о загруженных данных */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs">
        <div>Медучреждений: {facilities.length}</div>
        <div>Статус: {isLoading ? "Загрузка..." : "Готово"}</div>
      </div>

      {/* Легенда */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3">
        <h4 className="text-xs font-semibold mb-2">Мобильная доступность</h4>
        {/* <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span>Низкая (&lt; 50%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span>Нормальная (50-80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-600"></div>
            <span>Высокая (80-95%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span>Критическая (&gt; 95%)</span>
          </div>
        </div> */}
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600"></div>
            <span>10 минут</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400"></div>
            <span>15 минут</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-600"></div>
            <span>30 минут</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600"></div>
            <span>60 минут</span>
          </div>
        </div>
      </div>

      {/* Контролы масштаба */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
        {/* <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLayerPanel(!showLayerPanel)}
          className={showLayerPanel ? "bg-blue-100" : ""}
        >
          <Layers className="h-4 w-4" />
        </Button> */}
        <Button variant="outline" size="sm" onClick={zoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={zoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={resetView}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Панель управления слоями */}
      {/* {showLayerPanel && (
        <div className="absolute top-4 right-20 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs z-10">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Слои карты
          </h4>
          <div className="space-y-2">
            {layers.map((layer) => (
              <div key={layer.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`layer-${layer.id}`}
                  checked={layer.visible}
                  onChange={() => toggleLayer(layer.id)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor={`layer-${layer.id}`}
                  className="text-xs cursor-pointer flex items-center gap-1 flex-1"
                >
                  <span>{layer.icon}</span>
                  <span>{layer.name}</span>
                </label>
                <div
                  className={`w-3 h-3 rounded-full border border-gray-300 ${
                    layer.id === "districts"
                      ? "bg-blue-500"
                      : layer.id === "green_10min"
                      ? "bg-green-500"
                      : layer.id === "accessibility_15min"
                      ? "bg-yellow-500"
                      : layer.id === "accessibility_30min"
                      ? "bg-orange-500"
                      : layer.id === "population_grid"
                      ? "bg-purple-500"
                      : "bg-gray-500"
                  }`}
                ></div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-600">
            Всего слоев: {layers.filter((l) => l.visible).length}/
            {layers.length}
          </div>
        </div>
      )} */}
    </div>
  );
}
