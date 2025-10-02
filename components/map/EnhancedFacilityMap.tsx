"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  GeoJSON,
} from "react-leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FacilityStatistic } from "@/types/healthcare";
import { healthcareApi } from "@/lib/api/healthcare";
import { LayerControlPanel } from "./LayerControlPanel";
import {
  GEOJSON_LAYERS,
  loadGeoJSON,
  getMedicalFacilityStyle,
  getDistrictStyle,
  createMedicalFacilityPopup,
  createDistrictPopup,
  GeoJSONLayer,
} from "@/lib/utils/geojson";
import "leaflet/dist/leaflet.css";

// Константы для центрирования карты на Алматы
const ALMATY_CENTER: [number, number] = [43.2567, 76.9286]; // lat, lng
const DEFAULT_ZOOM = 11;

interface EnhancedFacilityMapProps {
  facilities?: FacilityStatistic[];
  className?: string;
  showLayerControls?: boolean;
  fullscreen?: boolean;
}

const getStatusColor = (statusColor: string, occupancyRate: number) => {
  // Новая схема: 40-70% = зеленый (нормальная), выше 70% = оранжевый/красный
  if (occupancyRate > 0.9) return "#dc2626"; // red-600 - критическая (выше 90%)
  if (occupancyRate > 0.7) return "#ea580c"; // orange-600 - высокая (70-90%)
  if (occupancyRate >= 0.4) return "#16a34a"; // green-600 - нормальная (40-70%)
  return "#6b7280"; // gray-500 - низкая (ниже 40%)
};

const getStatusText = (occupancyRate: number) => {
  if (occupancyRate > 0.9) return "Критическая";
  if (occupancyRate > 0.7) return "Высокая";
  if (occupancyRate >= 0.4) return "Нормальная";
  return "Низкая";
};

const getOccupancyBadgeVariant = (occupancyRate: number) => {
  if (occupancyRate > 0.9) return "destructive";
  if (occupancyRate > 0.7) return "default";
  if (occupancyRate >= 0.4) return "secondary";
  return "outline";
};

export function EnhancedFacilityMap({
  facilities: propFacilities,
  className,
  showLayerControls = true,
  fullscreen = false,
}: EnhancedFacilityMapProps) {
  const [facilities, setFacilities] = useState<FacilityStatistic[]>(
    propFacilities || []
  );
  const [loading, setLoading] = useState(!propFacilities);
  const [error, setError] = useState<string | null>(null);

  // Состояние для GeoJSON слоев
  const [layers, setLayers] = useState<GeoJSONLayer[]>(GEOJSON_LAYERS);
  const [geoJsonData, setGeoJsonData] = useState<Record<string, any>>({});
  const [loadingLayers, setLoadingLayers] = useState<Set<string>>(new Set());

  // Добавляем контроль для отображения данных из API
  const [showApiFacilities, setShowApiFacilities] = useState(true);

  useEffect(() => {
    if (!propFacilities) {
      loadFacilities();
    } else {
      setFacilities(propFacilities);
    }
  }, [propFacilities]);

  // Загружаем видимые слои
  useEffect(() => {
    const visibleLayers = layers.filter(
      (layer) => layer.visible && !geoJsonData[layer.id]
    );
    if (visibleLayers.length > 0) {
      loadGeoJsonLayers(visibleLayers);
    }
  }, [layers]);

  const loadFacilities = async () => {
    setLoading(true);
    try {
      const response = await healthcareApi.getFacilityStatistics();
      if (response.results && response.results.length > 0) {
        setFacilities(response.results);
      } else {
        setError("Нет данных для отображения");
      }
    } catch (error) {
      console.error("Error loading facilities:", error);
      setError("Ошибка подключения к серверу");
    } finally {
      setLoading(false);
    }
  };

  const loadGeoJsonLayers = async (layersToLoad: GeoJSONLayer[]) => {
    const newLoadingLayers = new Set(loadingLayers);

    for (const layer of layersToLoad) {
      newLoadingLayers.add(layer.id);
    }
    setLoadingLayers(newLoadingLayers);

    const loadPromises = layersToLoad.map(async (layer) => {
      try {
        const data = await loadGeoJSON(layer.url);
        return { id: layer.id, data };
      } catch (error) {
        console.error(`Failed to load layer ${layer.id}:`, error);
        return { id: layer.id, data: null };
      }
    });

    const results = await Promise.all(loadPromises);

    setGeoJsonData((prev) => {
      const newData = { ...prev };
      results.forEach(({ id, data }) => {
        if (data) {
          newData[id] = data;
        }
      });
      return newData;
    });

    setLoadingLayers((prev) => {
      const newSet = new Set(prev);
      results.forEach(({ id }) => newSet.delete(id));
      return newSet;
    });
  };

  const handleLayerToggle = useCallback((layerId: string, visible: boolean) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, visible } : layer
      )
    );
  }, []);

  // Функция для создания стиля слоя
  const getLayerStyle = useCallback(
    (layer: GeoJSONLayer, feature: any) => {
      if (layer.id === "districts") {
        return getDistrictStyle(
          feature.properties?.name_ru || "",
          geoJsonData.medical_facilities?.features || []
        );
      }
      return layer.style || {};
    },
    [geoJsonData]
  );

  // Функция для создания popup для разных типов слоев
  const getLayerPopup = useCallback(
    (layer: GeoJSONLayer, feature: any) => {
      if (layer.id === "medical_facilities") {
        return createMedicalFacilityPopup(feature.properties);
      }
      if (layer.id === "districts") {
        return createDistrictPopup(
          feature.properties,
          geoJsonData.medical_facilities?.features || []
        );
      }

      // Базовый popup для других слоев
      const properties = feature.properties || {};
      const title =
        properties.name || properties.note || properties.grid_id || "Объект";
      return `<div class="p-2"><strong>${title}</strong></div>`;
    },
    [geoJsonData]
  );

  if (loading) {
    return (
      <div className={`flex gap-4 ${className}`}>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Интерактивная карта здравоохранения</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Загрузка данных...</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {showLayerControls && (
          <LayerControlPanel
            layers={layers}
            onLayerToggle={handleLayerToggle}
            showApiFacilities={showApiFacilities}
            onApiFacilitiesToggle={setShowApiFacilities}
          />
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex gap-4 ${className}`}>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Интерактивная карта здравоохранения</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="text-red-500 text-xl mb-2">⚠️</div>
                <p className="text-sm text-gray-600">{error}</p>
                <button
                  onClick={loadFacilities}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Повторить
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
        {showLayerControls && (
          <LayerControlPanel
            layers={layers}
            onLayerToggle={handleLayerToggle}
            showApiFacilities={showApiFacilities}
            onApiFacilitiesToggle={setShowApiFacilities}
          />
        )}
      </div>
    );
  }

  // Fullscreen mode - no card wrapper
  if (fullscreen) {
    return (
      <div className={`h-full w-full ${className}`}>
        <MapContainer
          center={ALMATY_CENTER}
          zoom={DEFAULT_ZOOM}
          className="h-full w-full"
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={18}
            tileSize={256}
          />
          {/* Render facilities markers */}
          {showApiFacilities &&
            facilities.map((facility, index) => {
              if (!facility.latitude || !facility.longitude) return null;

              const position: [number, number] = [
                Number(facility.latitude),
                Number(facility.longitude),
              ];
              const occupancyRate = facility.occupancy_rate_percent || 0;
              const color = getStatusColor("", occupancyRate);

              return (
                <CircleMarker
                  key={`facility-${index}`}
                  center={position}
                  radius={8}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.7,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="min-w-[250px]">
                      <h3 className="font-bold text-sm mb-2">
                        {facility.medical_organization}
                      </h3>
                      <div className="space-y-1 text-xs">
                        <p>
                          <strong>Район:</strong> {facility.district}
                        </p>
                        <p>
                          <strong>Тип:</strong> {facility.facility_type}
                        </p>
                        <p>
                          <strong>Профиль:</strong> {facility.bed_profile}
                        </p>
                        <p>
                          <strong>Коек развернуто:</strong>{" "}
                          {facility.beds_deployed_withdrawn_for_rep}
                        </p>
                        <p>
                          <strong>Загруженность:</strong>{" "}
                          <Badge variant={getOccupancyBadgeVariant(occupancyRate)}>
                            {getStatusText(occupancyRate)} ({(occupancyRate * 100).toFixed(1)}%)
                          </Badge>
                        </p>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
        </MapContainer>
      </div>
    );
  }

  return (
    <div className={`flex gap-4 ${className}`}>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Интерактивная карта здравоохранения
            <div className="flex gap-2">
              {Array.from(loadingLayers).map((layerId) => (
                <Badge key={layerId} variant="outline" className="text-xs">
                  Загрузка {layers.find((l) => l.id === layerId)?.name}...
                </Badge>
              ))}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[calc(100vh-280px)] min-h-[500px] w-full">
            <MapContainer
              center={ALMATY_CENTER}
              zoom={DEFAULT_ZOOM}
              className="h-full w-full rounded-b-lg"
              zoomControl={true}
              scrollWheelZoom={true}
            >
              {/* Используем более качественную карту */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={18}
                tileSize={256}
              />

              {/* Рендерим GeoJSON слои */}
              {layers
                .filter((layer) => layer.visible && geoJsonData[layer.id])
                .map((layer) => {
                  const data = geoJsonData[layer.id];
                  if (!data || !data.features) return null;

                  // Для медицинских учреждений используем специальную обработку
                  if (layer.id === "medical_facilities") {
                    return data.features.map((feature: any, index: number) => {
                      if (
                        !feature.geometry ||
                        feature.geometry.type !== "Point"
                      )
                        return null;

                      const [lng, lat] = feature.geometry.coordinates;
                      const style = getMedicalFacilityStyle(
                        feature.properties?.Overload || "0%",
                        feature.properties?.color
                      );

                      return (
                        <CircleMarker
                          key={`${layer.id}-${index}`}
                          center={[lat, lng]}
                          radius={style.radius || 8}
                          pathOptions={{
                            color: style.color,
                            fillColor: style.fillColor,
                            weight: style.weight || 2,
                            opacity: style.opacity || 0.9,
                            fillOpacity: style.fillOpacity || 0.7,
                          }}
                        >
                          <Popup>
                            <div
                              dangerouslySetInnerHTML={{
                                __html: getLayerPopup(layer, feature),
                              }}
                            />
                          </Popup>
                        </CircleMarker>
                      );
                    });
                  }

                  // Для остальных слоев используем стандартный GeoJSON компонент
                  return (
                    <GeoJSON
                      key={layer.id}
                      data={data}
                      style={(feature) => getLayerStyle(layer, feature)}
                      onEachFeature={(feature, leafletLayer) => {
                        leafletLayer.bindPopup(getLayerPopup(layer, feature));
                      }}
                    />
                  );
                })}

              {/* Рендерим facilities из API только если включены */}
              {showApiFacilities &&
                facilities.map((facility) => {
                  if (!facility.latitude || !facility.longitude) {
                    return null;
                  }

                  const occupancyRate = facility.occupancy_rate_percent; // Уже в десятичном формате (0.77 = 77%)

                  return (
                    <CircleMarker
                      key={`api-facility-${facility.id}`}
                      center={[facility.latitude, facility.longitude]}
                      radius={6} // Уменьшаем размер
                      pathOptions={{
                        color: "#ffffff", // Белая обводка для контраста
                        fillColor: getStatusColor(
                          facility.occupancy_status_color || "gray",
                          occupancyRate
                        ),
                        weight: 1.5, // Уменьшаем толщину обводки
                        opacity: 1,
                        fillOpacity: 0.9, // Увеличиваем непрозрачность заливки
                      }}
                    >
                      <Popup>
                        <div className="p-3 min-w-64">
                          <h3 className="font-semibold text-sm mb-2 text-gray-900">
                            {facility.medical_organization}
                          </h3>
                          <div className="space-y-1 text-xs text-gray-600">
                            <div>
                              <span className="font-medium">Район:</span>{" "}
                              {facility.district}
                            </div>
                            <div>
                              <span className="font-medium">Тип:</span>{" "}
                              {facility.facility_type}
                            </div>
                            <div>
                              <span className="font-medium">Профиль:</span>{" "}
                              {facility.bed_profile}
                            </div>
                            <div>
                              <span className="font-medium">Койки:</span>{" "}
                              {facility.beds_deployed_withdrawn_for_rep}
                            </div>
                            <div>
                              <span className="font-medium">
                                Пациентов (всего):
                              </span>{" "}
                              {facility.total_admitted_patients}
                            </div>
                            <div>
                              <span className="font-medium">
                                Загруженность:
                              </span>{" "}
                              <Badge
                                variant={getOccupancyBadgeVariant(
                                  occupancyRate
                                )}
                                className="text-xs"
                              >
                                {Math.round(occupancyRate * 100)}% -{" "}
                                {getStatusText(occupancyRate)}
                              </Badge>
                            </div>
                            {facility.address && (
                              <div>
                                <span className="font-medium">Адрес:</span>{" "}
                                {facility.address}
                              </div>
                            )}
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Панель управления слоями */}
      {showLayerControls && (
        <LayerControlPanel
          layers={layers}
          onLayerToggle={handleLayerToggle}
          showApiFacilities={showApiFacilities}
          onApiFacilitiesToggle={setShowApiFacilities}
        />
      )}
    </div>
  );
}
