"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, Layers } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import { createFacilityPopupHTML, popupStyles } from "@/lib/utils/popup-styles";

// Токен Mapbox
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes("example")) {
  console.warn(
    "⚠️ Mapbox token not configured. Please set NEXT_PUBLIC_MAPBOX_TOKEN in .env.local"
  );
}

interface AnalyticsMapProps {
  className?: string;
  filteredFacilities?: any[];
  showRecommendations?: boolean;
}

interface MedicalFacility {
  medical_organization: number | string;
  total_emergency_visits: number;
  hospitalized_emerg: number;
  hospitalization_denied: number;
  rural_patients: number;
  rural_hospitalized: number;
  rural_refused: number;
  fac_stat_id: number;
  occupancy_rate_percent: number;
  bed_profile: string;
  facility_type: string;
  beds_avg_annual: number;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  is_recommended?: boolean;
}

interface AccessibilityLayer {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  type: "polygon" | "line";
  data?: any;
}

// Конфигурация всех слоев
const ACCESSIBILITY_LAYERS: AccessibilityLayer[] = [
  // Зоны доступности дорог (линии)
  {
    id: "roads_accessible_60min",
    name: "60 минут",
    color: "#dc2626", // red-600
    visible: true,
    type: "line",
  },
  {
    id: "roads_accessible_30min",
    name: "30 минут",
    color: "#ea580c", // orange-600
    visible: true,
    type: "line",
  },
  {
    id: "roads_accessible_15min",
    name: "15 минут",
    color: "#eab308", // yellow-500
    visible: true,
    type: "line",
  },
  {
    id: "roads_accessible_10min",
    name: "10 минут",
    color: "#16a34a", // green-600
    visible: true,
    type: "line",
  },
];

export function AnalyticsMap({
  className = "",
  filteredFacilities = [],
  showRecommendations = false,
}: AnalyticsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [facilities, setFacilities] = useState<MedicalFacility[]>([]);
  const [recommendedFacilities, setRecommendedFacilities] = useState<
    MedicalFacility[]
  >([]);
  const [layers, setLayers] =
    useState<AccessibilityLayer[]>(ACCESSIBILITY_LAYERS);
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
      zoom: 10,
      maxZoom: 18,
      minZoom: 9,
    });

    mapRef.current = map;

    // Inject popup styles
    const styleEl = document.createElement("style");
    styleEl.textContent = popupStyles;
    document.head.appendChild(styleEl);

    map.on("load", () => {
      console.log("Analytics Map: Map loaded successfully");
      setIsLoading(false);
    });

    map.on("error", (e: any) => {
      console.error("Analytics Map: Map error:", e);
      setIsLoading(false);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Загрузка данных медучреждений - координаты из файла, детали из API
  useEffect(() => {
    const loadFacilities = async () => {
      try {
        console.log("Loading medical facilities...");

        // Загружаем координаты из локального GeoJSON файла (53 точки с координатами)
        const fileResponse = await fetch(`${BASE_PATH}/api/gpkg?layer=hospitals`);
        const fileData = await fileResponse.json();

        // Загружаем детальные данные из API (с пагинацией)
        const apiDataMap: Map<number, any> = new Map();
        try {
          let nextUrl: string | null =
            "https://admin.smartalmaty.kz/api/v1/healthcare/extra-mo-refusal/?limit=200?limit=100";

          while (nextUrl) {
            const response: Response = await fetch(nextUrl);
            if (response.ok) {
              const data: any = await response.json();
              const facilities = data.results || data;
              if (Array.isArray(facilities)) {
                facilities.forEach((f: any) => {
                  apiDataMap.set(f.medical_organization, f);
                });
              }
              nextUrl = data.next
                ? data.next.replace("http://", "https://")
                : null;
            } else {
              break;
            }
          }
          console.log("Loaded API data for", apiDataMap.size, "facilities");
        } catch (apiError) {
          console.warn("Could not load API data:", apiError);
        }

        if (fileData.features && Array.isArray(fileData.features)) {
          // Используем координаты из файла, обогащаем данными из API
          const facilitiesData = fileData.features
            .filter((feature: any) => {
              const coords = feature.geometry?.coordinates;
              return coords && coords[0] && coords[1];
            })
            .map((feature: any) => {
              const props = feature.properties;
              const orgId =
                props.medical_organization_id || props.medical_organization;
              const apiData = apiDataMap.get(orgId);

              return {
                medical_organization: orgId,
                total_emergency_visits:
                  props.total_emergency_visits ||
                  apiData?.total_emergency_visits ||
                  0,
                hospitalized_emerg:
                  props.hospitalized_emerg || apiData?.hospitalized_emerg || 0,
                hospitalization_denied:
                  props.hospitalization_denied ||
                  apiData?.hospitalization_denied ||
                  0,
                rural_patients: apiData?.rural_patients || 0,
                rural_hospitalized: apiData?.rural_hospitalized || 0,
                rural_refused: apiData?.rural_refused || 0,
                fac_stat_id: apiData?.fac_stat_id || orgId,
                occupancy_rate_percent: apiData?.occupancy_rate_percent ?? 0.5,
                bed_profile: apiData?.bed_profile || "Неизвестно",
                facility_type: apiData?.facility_type || "Неизвестно",
                beds_avg_annual: apiData?.beds_avg_annual || 0,
                address: props.address || apiData?.address || "Адрес не указан",
                district:
                  props.district || apiData?.district || "Район не указан",
                // Координаты ВСЕГДА из файла
                latitude: feature.geometry.coordinates[1],
                longitude: feature.geometry.coordinates[0],
              };
            });

          setFacilities(facilitiesData);
          console.log(`Loaded ${facilitiesData.length} facilities from file`);
        }
      } catch (error) {
        console.error("Error loading facilities:", error);
      }
    };

    // Загрузка рекомендуемых СМП
    const loadRecommendedFacilities = async () => {
      try {
        const response = await fetch(`${BASE_PATH}/geo-files/Recommended_MO.geojson`);
        if (!response.ok) {
          console.warn("Recommended_MO.geojson not found");
          return;
        }
        const data = await response.json();
        if (data.features && Array.isArray(data.features)) {
          const recommended = data.features.map((feature: any) => {
            const props = feature.properties;
            return {
              medical_organization:
                props.medical_organization || props.Extra_MO,
              total_emergency_visits:
                parseInt(props["Patients admitted total"]) || 0,
              hospitalized_emerg: 0,
              hospitalization_denied: 0,
              rural_patients: parseInt(props["Rural residents"]) || 0,
              rural_hospitalized: 0,
              rural_refused: 0,
              fac_stat_id: 0,
              occupancy_rate_percent:
                parseFloat(props.Overload?.replace("%", "")) / 100 || 0,
              bed_profile: props.Bed_Profile || props.type || "Рекомендуемое",
              facility_type: props.type || "Рекомендуемое СМП",
              beds_avg_annual:
                parseInt(props["Number_of_ beds_actually_deployed_closed"]) ||
                0,
              address: props.found_address_2gis || "Рекомендуемое расположение",
              district: props.district_2gis || "Район не определён",
              latitude: feature.geometry.coordinates[1],
              longitude: feature.geometry.coordinates[0],
              is_recommended: true,
            };
          });
          setRecommendedFacilities(recommended);
          console.log(`Loaded ${recommended.length} recommended facilities`);
        }
      } catch (error) {
        console.error("Error loading recommended facilities:", error);
      }
    };

    loadFacilities();
    loadRecommendedFacilities();
  }, []);

  // Добавление маркеров медучреждений на карту
  useEffect(() => {
    if (!mapRef.current || isLoading || facilities.length === 0) return;

    const map = mapRef.current;

    // Удаляем существующие источники и слои
    if (map.getLayer("facilities-layer")) map.removeLayer("facilities-layer");
    if (map.getLayer("recommended-facilities-layer"))
      map.removeLayer("recommended-facilities-layer");
    if (map.getSource("facilities")) map.removeSource("facilities");
    if (map.getSource("recommended-facilities"))
      map.removeSource("recommended-facilities");

    // Преобразуем данные API в GeoJSON
    const geoJsonFeatures = facilities.map((facility) => ({
      type: "Feature" as const,
      properties: {
        medical_organization: facility.medical_organization,
        facility_type: facility.facility_type,
        bed_profile: facility.bed_profile,
        occupancy_rate: facility.occupancy_rate_percent,
        beds_avg_annual: facility.beds_avg_annual,
        address: facility.address,
        district: facility.district,
        total_emergency_visits: facility.total_emergency_visits,
        hospitalized_emerg: facility.hospitalized_emerg,
        hospitalization_denied: facility.hospitalization_denied,
        rural_patients: facility.rural_patients,
        is_recommended: false,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [facility.longitude, facility.latitude],
      },
    }));

    console.log(`Creating ${geoJsonFeatures.length} facility markers on map`);

    // Добавляем источник данных для существующих учреждений
    map.addSource("facilities", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: geoJsonFeatures,
      },
    });

    // Функция для определения цвета маркера по загруженности
    const getMarkerColor = (occupancyRate: number) => {
      if (occupancyRate > 0.95) return "#dc2626"; // red-600 - критическая (выше 95%)
      if (occupancyRate > 0.8) return "#ea580c"; // orange-600 - высокая (80-95%)
      if (occupancyRate >= 0.5) return "#16a34a"; // green-600 - нормальная (50-80%)
      return "#6b7280"; // gray-500 - низкая (ниже 50%)
    };

    // Функция для получения текста статуса
    const getStatusText = (occupancyRate: number) => {
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
        "circle-radius": [
          "case",
          ["==", ["get", "bed_profile"], "Частные МО"],
          8,
          10,
        ],
        "circle-color": [
          "case",
          // Критическая загруженность (>95%)
          [">", ["get", "occupancy_rate"], 0.95],
          "#dc2626", // red-600
          // Высокая загруженность (80-95%)
          [">", ["get", "occupancy_rate"], 0.8],
          "#ea580c", // orange-600
          // Нормальная загруженность (50-80%)
          [">=", ["get", "occupancy_rate"], 0.5],
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

      const popupHTML = createFacilityPopupHTML({
        name: `МО №${props.medical_organization}`,
        district: props.district ? `${props.district} район` : undefined,
        facilityType: props.facility_type,
        bedProfile: props.bed_profile,
        occupancyRate: props.occupancy_rate || 0,
        totalBeds: props.beds_avg_annual || 0,
        emergencyVisits: props.total_emergency_visits,
      });

      new mapboxgl.Popup({ maxWidth: "340px" })
        .setLngLat(e.lngLat)
        .setHTML(popupHTML)
        .addTo(map);
    });

    // Меняем курсор при наведении
    map.on("mouseenter", "facilities-layer", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "facilities-layer", () => {
      map.getCanvas().style.cursor = "";
    });

    // Добавляем рекомендуемые СМП если включен режим рекомендаций
    console.log(
      `showRecommendations: ${showRecommendations}, recommendedFacilities: ${recommendedFacilities.length}`
    );
    if (showRecommendations && recommendedFacilities.length > 0) {
      const recommendedGeoJson = recommendedFacilities.map((facility) => ({
        type: "Feature" as const,
        properties: {
          medical_organization: facility.medical_organization,
          facility_type: facility.facility_type,
          bed_profile: facility.bed_profile,
          occupancy_rate: facility.occupancy_rate_percent,
          beds_avg_annual: facility.beds_avg_annual,
          address: facility.address,
          district: facility.district,
          is_recommended: true,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [facility.longitude, facility.latitude],
        },
      }));

      map.addSource("recommended-facilities", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: recommendedGeoJson,
        },
      });

      // Слой для рекомендуемых СМП - зелёные маркеры с пульсацией
      map.addLayer({
        id: "recommended-facilities-layer",
        type: "circle",
        source: "recommended-facilities",
        paint: {
          "circle-radius": 12,
          "circle-color": "#10b981", // emerald-500
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 3,
          "circle-opacity": 0.9,
        },
      });

      // Попапы для рекомендуемых СМП
      map.on("click", "recommended-facilities-layer", (e: any) => {
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0] as any;
        const props = feature.properties;

        const popupHTML = createFacilityPopupHTML({
          name: props.medical_organization || "Рекомендуемая МО",
          district: props.district ? `${props.district} район` : undefined,
          facilityType: props.facility_type,
          bedProfile: props.bed_profile,
          occupancyRate: props.occupancy_rate || 0,
          totalBeds: props.beds_avg_annual || 0,
          isRecommended: true,
          recommendationType: "smp",
        });

        new mapboxgl.Popup({ maxWidth: "340px" })
          .setLngLat(e.lngLat)
          .setHTML(popupHTML)
          .addTo(map);
      });

      map.on("mouseenter", "recommended-facilities-layer", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "recommended-facilities-layer", () => {
        map.getCanvas().style.cursor = "";
      });

      console.log(
        `Added ${recommendedFacilities.length} recommended facilities`
      );
    }

    console.log(
      `Added ${facilities.length} medical facilities to analytics map`
    );
  }, [
    mapRef.current,
    isLoading,
    facilities,
    showRecommendations,
    recommendedFacilities,
  ]);

  // Загрузка и отображение слоев доступности дорог из GPKG
  useEffect(() => {
    if (!mapRef.current || isLoading) return;

    const map = mapRef.current;

    const loadAccessibilityLayers = async () => {
      for (const layer of layers) {
        const sourceId = `accessibility-${layer.id}`;
        const layerId = `${sourceId}-fill`;
        const strokeId = `${sourceId}-stroke`;
        const lineId = `${sourceId}-line`;

        // Удаляем существующие слои
        if (map.getLayer(lineId)) map.removeLayer(lineId);
        if (map.getLayer(strokeId)) map.removeLayer(strokeId);
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);

        if (!layer.visible) continue;

        try {
          console.log(`Loading layer: ${layer.name}`);
          const response = await fetch(`/api/gpkg?layer=${layer.id}`);

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

          if (layer.type === "polygon") {
            // Слои зон доступности (полигоны)
            map.addLayer({
              id: layerId,
              type: "fill",
              source: sourceId,
              paint: {
                "fill-color": layer.color,
                "fill-opacity": 0.15,
              },
            });

            // Границы зон
            map.addLayer({
              id: strokeId,
              type: "line",
              source: sourceId,
              paint: {
                "line-color": layer.color,
                "line-width": 1.5,
                "line-opacity": 0.6,
              },
            });
          } else if (layer.type === "line") {
            // Дорожная сеть (линии) - слои доступности
            map.addLayer({
              id: lineId,
              type: "line",
              source: sourceId,
              paint: {
                "line-color": layer.color,
                "line-width": 1.5,
                "line-opacity": 0.7,
              },
            });
          }

          // Перемещаем слой с больницами на передний план, если он существует
          if (map.getLayer("facilities-layer")) {
            map.moveLayer("facilities-layer");
          }

          console.log(`Successfully loaded layer: ${layer.name}`);
        } catch (error) {
          console.error(`Error loading layer ${layer.name}:`, error);
        }
      }
    };

    loadAccessibilityLayers();
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
    <div className={`relative min-h-[500px] h-full w-full ${className}`}>
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
        <div>Медучреждений на карте: {facilities.length}</div>
        {showRecommendations && recommendedFacilities.length > 0 && (
          <div className="text-emerald-600 font-medium">
            + {recommendedFacilities.length} рекомендуемых СМП
          </div>
        )}
        <div>
          Слои доступности: {layers.filter((l) => l.visible).length}/
          {layers.length}
        </div>
        <div>Статус: {isLoading ? "Загрузка..." : "Готово"}</div>
      </div>

      {/* Легенда */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3">
        <h4 className="text-xs font-semibold mb-2">Слои карты</h4>

        {/* Дорожная сеть */}
        <div className="mb-2">
          <h5 className="text-xs font-medium mb-1">Дорожная сеть</h5>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-gray-800"></div>
              <span>Магистрали</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-gray-700"></div>
              <span>Основные дороги</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-gray-500"></div>
              <span>Второстепенные</span>
            </div>
          </div>
        </div>

        {/* Зоны доступности */}
        <div className="mb-2">
          <h5 className="text-xs font-medium mb-1">Доступность по времени</h5>
          <div className="space-y-1 text-xs">
            {layers
              .filter((layer) => layer.type === "polygon")
              .map((layer) => (
                <div key={layer.id} className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-sm ${
                      layer.id === "roads_accessible_10min"
                        ? "bg-green-600"
                        : layer.id === "roads_accessible_15min"
                        ? "bg-yellow-500"
                        : layer.id === "roads_accessible_30min"
                        ? "bg-orange-600"
                        : layer.id === "roads_accessible_60min"
                        ? "bg-red-600"
                        : "bg-gray-500"
                    }`}
                  ></div>
                  <span>{layer.name}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Загруженность медучреждений */}
        <div className="border-t border-gray-200 pt-2">
          <h5 className="text-xs font-medium mb-1">Загруженность коек</h5>
          <div className="space-y-1 text-xs">
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
          </div>
        </div>

        {/* Рекомендуемые СМП */}
        {showRecommendations && (
          <div className="border-t border-gray-200 pt-2">
            <h5 className="text-xs font-medium mb-1 text-emerald-700">
              Рекомендуемые СМП
            </h5>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow"></div>
                <span>Новые СМП ({recommendedFacilities.length})</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Контролы масштаба */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLayerPanel(!showLayerPanel)}
          className={showLayerPanel ? "bg-blue-100" : ""}
        >
          <Layers className="h-4 w-4" />
        </Button>
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
      {showLayerPanel && (
        <div className="absolute top-4 right-20 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs z-10">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Управление слоями
          </h4>
          <div className="space-y-3">
            {/* Дорожная сеть */}
            <div>
              <h5 className="text-xs font-medium mb-1">Дорожная сеть</h5>
              {layers
                .filter((layer) => layer.type === "line")
                .map((layer) => (
                  <div
                    key={layer.id}
                    className="flex items-center space-x-2 ml-2"
                  >
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
                      <div className="w-3 h-1 bg-gray-700"></div>
                      <span>{layer.name}</span>
                    </label>
                  </div>
                ))}
            </div>

            {/* Зоны доступности */}
            <div>
              <h5 className="text-xs font-medium mb-1">Зоны доступности</h5>
              {layers
                .filter((layer) => layer.type === "polygon")
                .map((layer) => (
                  <div
                    key={layer.id}
                    className="flex items-center space-x-2 ml-2"
                  >
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
                      <div
                        className={`w-3 h-3 rounded-sm ${
                          layer.id === "roads_accessible_10min"
                            ? "bg-green-600"
                            : layer.id === "roads_accessible_15min"
                            ? "bg-yellow-500"
                            : layer.id === "roads_accessible_30min"
                            ? "bg-orange-600"
                            : layer.id === "roads_accessible_60min"
                            ? "bg-red-600"
                            : "bg-gray-500"
                        }`}
                      ></div>
                      <span>{layer.name}</span>
                    </label>
                  </div>
                ))}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-600">
            Активно слоев: {layers.filter((l) => l.visible).length}/
            {layers.length}
          </div>
        </div>
      )}
    </div>
  );
}
