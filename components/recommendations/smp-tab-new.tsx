"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalyticsMap } from "@/components/map/AnalyticsMap";
import { TrendingUp, Users, BedDouble, Activity, UserX } from "lucide-react";

interface ApiStats {
  count: number;
  total_emergency_visits: number;
  total_hospitalized: number;
  total_refused: number;
  refusal_percentage: number;
  avg_occupancy_rate: number;
  rural_patients_total: number;
  rural_percentage: number;
  total_beds_avg_annual: number;
}

export function SmpTab() {
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          "https://admin.smartalmaty.kz/api/v1/healthcare/extra-mo-refusal/?limit=1"
        );
        const data = await response.json();
        setStats({
          count: data.count,
          total_emergency_visits: data.total_emergency_visits,
          total_hospitalized: data.total_hospitalized,
          total_refused: data.total_refused,
          refusal_percentage: data.refusal_percentage,
          avg_occupancy_rate: data.avg_occupancy_rate,
          rural_patients_total: data.rural_patients_total,
          rural_percentage: data.rural_percentage,
          total_beds_avg_annual: data.total_beds_avg_annual,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString("ru-RU");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Карта оптимального покрытия */}
        <Card className="lg:col-span-2 lg:row-span-2 flex flex-col">
          <CardHeader>
            <CardTitle className="flex flex-col gap-1">
              Карта оптимального покрытия доступностью
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-2">
            <AnalyticsMap className="w-full h-full" />
          </CardContent>
        </Card>

        <div className="gap-4 grid grid-cols-1">
          {/* Госпитализация и отказы */}
          <Card className="flex flex-col">
            <CardHeader className="items-center pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5 text-blue-500" />
                <span>Госпитализация</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Всего обращений:
                </span>
                <span className="font-semibold text-lg">
                  {isLoading
                    ? "..."
                    : formatNumber(stats?.total_emergency_visits || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Госпитализировано:
                </span>
                <span className="font-semibold text-lg text-green-600">
                  {isLoading
                    ? "..."
                    : formatNumber(stats?.total_hospitalized || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Отказано:</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg text-red-600">
                    {isLoading
                      ? "..."
                      : formatNumber(stats?.total_refused || 0)}
                  </span>
                  <Badge variant="destructive" className="text-xs">
                    {isLoading
                      ? "..."
                      : `${stats?.refusal_percentage.toFixed(1)}%`}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Сельские жители */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserX className="h-5 w-5 text-amber-500" />
                <span>Сельские жители</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Всего пациентов:
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">
                    {isLoading
                      ? "..."
                      : formatNumber(stats?.rural_patients_total || 0)}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {isLoading
                      ? "..."
                      : `${stats?.rural_percentage.toFixed(1)}%`}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Коечный фонд */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <BedDouble className="h-5 w-5 text-indigo-500" />
                <span>Коечный фонд</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Всего коек:
                </span>
                <span className="font-semibold text-2xl">
                  {isLoading
                    ? "..."
                    : formatNumber(stats?.total_beds_avg_annual || 0)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Средняя загруженность */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-5 w-5 text-emerald-500" />
                <span>Средняя загруженность</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  По всем МО:
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-2xl">
                    {isLoading
                      ? "..."
                      : `${((stats?.avg_occupancy_rate || 0) * 100).toFixed(
                          0
                        )}%`}
                  </span>
                  {stats && stats.avg_occupancy_rate > 0.8 ? (
                    <Badge variant="destructive">Высокая</Badge>
                  ) : stats && stats.avg_occupancy_rate >= 0.5 ? (
                    <Badge variant="default" className="bg-green-500">
                      Нормальная
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Низкая</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
