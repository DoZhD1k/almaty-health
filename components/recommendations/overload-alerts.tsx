"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MapPin, Users, Clock } from "lucide-react";
import { FacilityStatistic } from "@/types/healthcare";
import { healthcareApi } from "@/lib/api/healthcare";

const getRiskColor = (level: string) => {
  switch (level) {
    case "extreme":
      return "bg-red-800 text-white";
    case "overload":
      return "bg-red-500 text-white";
    case "critical":
      return "bg-orange-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

const getRiskLabel = (level: string) => {
  switch (level) {
    case "extreme":
      return "Критический";
    case "overload":
      return "Перегруз";
    case "critical":
      return "Критическая";
    default:
      return "Неизвестно";
  }
};

export function OverloadAlerts() {
  const [facilities, setFacilities] = useState<FacilityStatistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFacilities();
  }, []);

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

  // Фильтруем перегруженные учреждения (загруженность > 70%)
  const overloadedFacilities = facilities
    .filter((facility) => facility.occupancy_rate_percent > 0.7)
    .sort((a, b) => b.occupancy_rate_percent - a.occupancy_rate_percent)
    .map((facility) => ({
      id: facility.id,
      name: facility.medical_organization,
      district: facility.district,
      currentLoad: Math.round(facility.occupancy_rate_percent * 100),
      beds: facility.beds_deployed_withdrawn_for_rep,
      occupiedBeds: Math.round(
        facility.beds_deployed_withdrawn_for_rep *
          facility.occupancy_rate_percent
      ),
      waitingPatients: facility.total_admitted_patients || 0, // Используем реальные данные о пациентах
      avgWaitTime: Math.round(
        (facility.total_inpatient_bed_days || 0) /
          Math.max(facility.total_admitted_patients || 1, 1)
      ), // Среднее время в днях
      riskLevel:
        facility.occupancy_rate_percent > 0.9
          ? "extreme"
          : facility.occupancy_rate_percent > 0.8
          ? "overload"
          : "critical",
      recommendations: generateRecommendations(
        facility.occupancy_rate_percent,
        facility.medical_organization
      ),
    }));

  const criticalCount = overloadedFacilities.filter(
    (f) => f.riskLevel === "extreme"
  ).length;
  const overloadCount = overloadedFacilities.filter(
    (f) => f.riskLevel === "overload"
  ).length;
  const totalWaiting = overloadedFacilities.reduce(
    (sum, f) => sum + f.waitingPatients,
    0
  );

  function generateRecommendations(
    occupancyRate: number,
    facilityName: string
  ): string[] {
    const recommendations = [];

    if (occupancyRate > 0.9) {
      recommendations.push(
        `Немедленно перенаправить ${Math.round(
          (occupancyRate - 0.9) * 100 * 10
        )} пациентов в соседние МО`
      );
      recommendations.push("Активировать дополнительные койки в коридорах");
      recommendations.push("Ускорить выписку стабильных пациентов");
    } else if (occupancyRate > 0.8) {
      recommendations.push(
        `Перенаправить ${Math.round(
          (occupancyRate - 0.8) * 100 * 5
        )} пациентов в региональные центры`
      );
      recommendations.push("Оптимизировать график операций");
      recommendations.push("Рассмотреть досрочную выписку под наблюдение");
    } else {
      recommendations.push("Подготовить план перенаправления пациентов");
      recommendations.push(
        "Увеличить пропускную способность приемного отделения"
      );
      recommendations.push("Координация с частными клиниками");
    }

    return recommendations;
  }

  // Helper function to get progress class
  const getProgressClass = (percentage: number): string => {
    const rounded = Math.round(percentage / 5) * 5; // Round to nearest 5
    return `progress-${Math.min(100, Math.max(0, rounded))}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Загрузка данных...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-2">⚠️</div>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Критических</p>
                <p className="text-2xl font-bold text-red-600">
                  {criticalCount}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Перегруженных</p>
                <p className="text-2xl font-bold text-orange-600">
                  {overloadCount}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего пациентов</p>
                <p className="text-2xl font-bold">{totalWaiting}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {overloadedFacilities.map((facility) => (
          <Card key={facility.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{facility.name}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    {facility.district} район
                  </div>
                </div>
                <Badge className={getRiskColor(facility.riskLevel)}>
                  {getRiskLabel(facility.riskLevel)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Load Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-muted/50 rounded">
                  <div className="text-lg font-bold text-red-600">
                    {facility.currentLoad}%
                  </div>
                  <div className="text-xs text-muted-foreground">Загрузка</div>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded">
                  <div className="text-lg font-bold">
                    {facility.occupiedBeds}/{facility.beds}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Коек занято
                  </div>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded">
                  <div className="text-lg font-bold">
                    {facility.waitingPatients}
                  </div>
                  <div className="text-xs text-muted-foreground">Пациентов</div>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded">
                  <div className="text-lg font-bold">
                    {facility.avgWaitTime} дн.
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Ср. пребывание
                  </div>
                </div>
              </div>

              {/* Load Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Загруженность коек</span>
                  <span className="font-semibold">{facility.currentLoad}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 relative overflow-hidden">
                  {facility.currentLoad <= 100 ? (
                    <div
                      className={`h-3 rounded-full bg-red-500 transition-all ${getProgressClass(
                        facility.currentLoad
                      )}`}
                    />
                  ) : (
                    <>
                      <div className="h-3 rounded-full bg-red-500 transition-all w-full" />
                      <div className="h-3 w-full bg-red-800 rounded-full opacity-50 absolute top-0" />
                    </>
                  )}
                </div>
                {facility.currentLoad > 100 && (
                  <div className="text-xs text-red-600 font-medium">
                    Превышение нормы на {facility.currentLoad - 100}%
                  </div>
                )}
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Рекомендации:</h4>
                <ul className="space-y-1">
                  {facility.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
