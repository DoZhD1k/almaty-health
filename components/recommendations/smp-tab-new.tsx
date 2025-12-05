"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import {
  TrendingUp,
  Users,
  BedDouble,
  Activity,
  UserX,
  AlertTriangle,
} from "lucide-react";
import { FacilityStatistic } from "@/types/healthcare";

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

interface SmpTabProps {
  facilities?: FacilityStatistic[];
}

interface SmpFacility {
  medical_organization: number;
  occupancy_rate_percent: number;
  facility_type: string;
  district: string;
}

export function SmpTab({ facilities }: SmpTabProps) {
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [smpFacilities, setSmpFacilities] = useState<SmpFacility[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Count overloaded SMP facilities (> 85%)
  const overloadedCount = useMemo(() => {
    return smpFacilities.filter((f) => f.occupancy_rate_percent > 0.85).length;
  }, [smpFacilities]);

  // Calculate top 3 overloaded profiles by average occupancy rate
  const topOverloadedProfiles = useMemo(() => {
    if (smpFacilities.length === 0) return [];

    // Group facilities by facility_type (profile)
    const profileStats = new Map<
      string,
      { total: number; count: number; overloadedCount: number }
    >();

    smpFacilities.forEach((f) => {
      const profile = f.facility_type || "Неизвестно";
      const existing = profileStats.get(profile) || {
        total: 0,
        count: 0,
        overloadedCount: 0,
      };
      existing.total += f.occupancy_rate_percent;
      existing.count += 1;
      if (f.occupancy_rate_percent > 0.85) {
        existing.overloadedCount += 1;
      }
      profileStats.set(profile, existing);
    });

    // Calculate average and sort by it
    const profilesArray = Array.from(profileStats.entries())
      .map(([profile, stats]) => ({
        profile,
        avgOccupancy: stats.total / stats.count,
        count: stats.count,
        overloadedCount: stats.overloadedCount,
      }))
      .filter((p) => p.avgOccupancy > 0.7) // Only show profiles with avg > 70%
      .sort((a, b) => b.avgOccupancy - a.avgOccupancy)
      .slice(0, 3);

    return profilesArray;
  }, [smpFacilities]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch all SMP facilities data
      const response = await fetch(
        "https://admin.smartalmaty.kz/api/v1/healthcare/extra-mo-refusal/?limit=100"
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

      // Store facilities for counting overloaded
      if (data.results) {
        setSmpFacilities(data.results);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("ru-RU");
  };

  return (
    <div className="space-y-4">
      {/* Alert about overloaded SMP facilities */}
      {overloadedCount > 0 && (
        <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
          <CardContent className="py-3">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-orange-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  Обнаружено {overloadedCount} перегруженных СМП МО из{" "}
                  {smpFacilities.length}
                  <Badge variant="destructive" className="text-xs">
                    &gt;85%
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Рекомендуется перенаправление пациентов или увеличение коек
                  для снижения нагрузки на существующие учреждения СМП
                </p>

                {/* Top 3 overloaded profiles */}
                {topOverloadedProfiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">
                      Топ профили:
                    </span>
                    {topOverloadedProfiles.map((p, idx) => (
                      <Badge
                        key={p.profile}
                        variant={idx === 0 ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {p.profile} ({Math.round(p.avgOccupancy * 100)}%)
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Карта оптимального покрытия */}
        <Card className="lg:col-span-2 lg:row-span-2 flex flex-col">
          <CardHeader>
            <CardTitle className="flex flex-col gap-1">
              Карта оптимального покрытия доступностью
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-2">
            <AnalyticsMap
              className="w-full h-full"
              filteredFacilities={facilities}
            />
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
