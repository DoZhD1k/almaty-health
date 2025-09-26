"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FacilityStatistic } from "@/types/healthcare";
import { healthcareApi } from "@/lib/api/healthcare";
import "leaflet/dist/leaflet.css";

// Константы для центрирования карты на Алматы
const ALMATY_CENTER: [number, number] = [43.2567, 76.9286]; // lat, lng
const DEFAULT_ZOOM = 11;

interface FacilityMapProps {
  facilities?: FacilityStatistic[];
  className?: string;
}

const getStatusColor = (statusColor: string, occupancyRate: number) => {
  // Используем цвет из API или вычисляем по загруженности
  if (statusColor === "red" || occupancyRate > 0.9) return "#dc2626"; // red-600
  if (statusColor === "orange" || occupancyRate > 0.7) return "#ea580c"; // orange-600
  if (statusColor === "green" || occupancyRate <= 0.7) return "#16a34a"; // green-600
  return "#6b7280"; // gray-500
};

const getStatusText = (occupancyRate: number) => {
  if (occupancyRate > 0.9) return "Критическая";
  if (occupancyRate > 0.7) return "Высокая";
  return "Нормальная";
};

const getOccupancyBadgeVariant = (occupancyRate: number) => {
  if (occupancyRate > 0.9) return "destructive";
  if (occupancyRate > 0.7) return "default";
  return "secondary";
};

export function FacilityMap({
  facilities: propFacilities,
  className,
}: FacilityMapProps) {
  const [facilities, setFacilities] = useState<FacilityStatistic[]>(
    propFacilities || []
  );
  const [loading, setLoading] = useState(!propFacilities);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propFacilities) {
      loadFacilities();
    } else {
      setFacilities(propFacilities);
    }
  }, [propFacilities]);

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

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Карта загруженности стационаров</CardTitle>
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
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Карта загруженности стационаров</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-red-500">Ошибка: {error}</p>
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
    );
  }

  // Фильтруем объекты с валидными координатами
  const validFacilities = facilities.filter(
    (facility) =>
      facility.latitude != null &&
      facility.longitude != null &&
      !isNaN(facility.latitude) &&
      !isNaN(facility.longitude)
  );

  // Используем правильные данные для статистики
  const displayFacilities =
    facilities.length > 0 ? facilities : validFacilities;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Карта загруженности стационаров
          <div className="flex gap-2 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span>Нормальная</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-600"></div>
              <span>Высокая</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span>Критическая</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[600px] w-full rounded-lg overflow-hidden">
          <MapContainer
            center={ALMATY_CENTER}
            zoom={DEFAULT_ZOOM}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {validFacilities.map((facility) => (
              <CircleMarker
                key={facility.id}
                center={[facility.latitude, facility.longitude]}
                radius={Math.max(
                  8,
                  Math.min(
                    20,
                    (facility.beds_deployed_withdrawn_for_rep || 50) / 10
                  )
                )}
                fillColor={getStatusColor(
                  facility.occupancy_status_color,
                  facility.occupancy_rate_percent
                )}
                color={getStatusColor(
                  facility.occupancy_status_color,
                  facility.occupancy_rate_percent
                )}
                weight={2}
                opacity={0.8}
                fillOpacity={0.6}
              >
                <Popup>
                  <div className="min-w-64 p-2">
                    <h3 className="font-semibold text-lg mb-2">
                      {facility.medical_organization}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {facility.address}
                    </p>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Статус:</span>
                        <Badge
                          variant={
                            getOccupancyBadgeVariant(
                              facility.occupancy_rate_percent
                            ) as
                              | "default"
                              | "destructive"
                              | "outline"
                              | "secondary"
                              | null
                              | undefined
                          }
                        >
                          {getStatusText(facility.occupancy_rate_percent)}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Загруженность:</span>
                        <span className="font-semibold">
                          {Math.round(facility.occupancy_rate_percent * 100)}%
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Коек развернуто:</span>
                        <span className="font-semibold">
                          {facility.beds_deployed_withdrawn_for_rep}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Тип:</span>
                        <span className="text-sm">
                          {facility.facility_type}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Пациентов принято:</span>
                        <span className="text-sm">
                          {facility.total_admitted_patients}
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            facility.occupancy_rate_percent > 0.9
                              ? "bg-red-600"
                              : facility.occupancy_rate_percent > 0.7
                              ? "bg-orange-600"
                              : "bg-green-600"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {/* Статистика внизу карты */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-semibold">Всего стационаров</div>
            <div className="text-2xl font-bold text-blue-600">
              {displayFacilities.length}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-semibold">На карте</div>
            <div className="text-2xl font-bold text-green-600">
              {validFacilities.length}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-semibold">Средняя загруженность</div>
            <div className="text-2xl font-bold text-orange-600">
              {displayFacilities.length > 0
                ? Math.round(
                    (displayFacilities.reduce(
                      (sum, f) => sum + f.occupancy_rate_percent,
                      0
                    ) /
                      displayFacilities.length) *
                      100
                  )
                : 0}
              %
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
