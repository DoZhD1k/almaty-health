"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, TrendingUp, AlertTriangle, Bed } from "lucide-react";
import { FacilityStatistic } from "@/types/healthcare";

interface SummaryData {
  totalFacilities: number;
  averageOccupancy: number;
  overloadedCount: number;
  totalBeds: number;
  highLoadCount: number;
  normalLoadCount: number;
  lowLoadCount: number;
}

interface QuickSummaryProps {
  facilities: FacilityStatistic[];
  className?: string;
}

export function QuickSummary({ facilities, className }: QuickSummaryProps) {
  const summaryData: SummaryData = useMemo(() => {
    if (!facilities.length) {
      return {
        totalFacilities: 0,
        averageOccupancy: 0,
        overloadedCount: 0,
        totalBeds: 0,
        highLoadCount: 0,
        normalLoadCount: 0,
        lowLoadCount: 0,
      };
    }

    const totalFacilities = facilities.length;
    const totalOccupancy = facilities.reduce(
      (sum, f) => sum + f.occupancy_rate_percent,
      0
    );
    const averageOccupancy = Math.round(
      (totalOccupancy / totalFacilities) * 100
    );
    const overloadedCount = facilities.filter(
      (f) => f.occupancy_rate_percent > 0.9
    ).length;
    const totalBeds = facilities.reduce(
      (sum, f) => sum + (f.beds_deployed_withdrawn_for_rep || 0),
      0
    );
    const highLoadCount = facilities.filter(
      (f) => f.occupancy_rate_percent > 0.7 && f.occupancy_rate_percent <= 0.9
    ).length;
    const normalLoadCount = facilities.filter(
      (f) => f.occupancy_rate_percent >= 0.4 && f.occupancy_rate_percent <= 0.7
    ).length;
    const lowLoadCount = facilities.filter(
      (f) => f.occupancy_rate_percent < 0.4
    ).length;

    return {
      totalFacilities,
      averageOccupancy,
      overloadedCount,
      totalBeds,
      highLoadCount,
      normalLoadCount,
      lowLoadCount,
    };
  }, [facilities]);

  return (
    <Card className={`${className} shadow-xl backdrop-blur-sm bg-white/95`}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* Всего МО */}
          <div className="flex items-center gap-3 border-b pb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgb(var(--blue-normal))]">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-600 mb-0.5">Всего МО</div>
              <div className="text-2xl font-bold text-[rgb(var(--blue-normal))]">
                {summaryData.totalFacilities}
              </div>
            </div>
          </div>

          {/* Всего коек */}
          <div className="flex items-center gap-3 border-b pb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
              <Bed className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-600 mb-0.5">Всего коек</div>
              <div className="text-2xl font-bold text-blue-600">
                {summaryData.totalBeds}
              </div>
            </div>
          </div>

          {/* Средняя загруженность */}
          <div className="flex items-center gap-3 border-b pb-3">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                summaryData.averageOccupancy >= 40 &&
                summaryData.averageOccupancy <= 70
                  ? "bg-green-100"
                  : summaryData.averageOccupancy > 70
                  ? "bg-orange-100"
                  : "bg-gray-100"
              }`}
            >
              <TrendingUp
                className={`h-5 w-5 ${
                  summaryData.averageOccupancy >= 40 &&
                  summaryData.averageOccupancy <= 70
                    ? "text-green-600"
                    : summaryData.averageOccupancy > 70
                    ? "text-orange-600"
                    : "text-gray-600"
                }`}
              />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-600 mb-0.5">Средняя загруженность</div>
              <div
                className={`text-2xl font-bold ${
                  summaryData.averageOccupancy >= 40 &&
                  summaryData.averageOccupancy <= 70
                    ? "text-green-600"
                    : summaryData.averageOccupancy > 70
                    ? "text-orange-600"
                    : "text-gray-600"
                }`}
              >
                {summaryData.averageOccupancy}%
              </div>
            </div>
          </div>

          {/* Перегруженные */}
          <div className="flex items-center gap-3 border-b pb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-600 mb-0.5">Критическая (&gt; 90%)</div>
              <div className="text-2xl font-bold text-red-600">
                {summaryData.overloadedCount}
              </div>
            </div>
          </div>

          {/* Высокая загрузка */}
          <div className="flex items-center gap-3 border-b pb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-100">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-600 mb-0.5">Высокая (70-90%)</div>
              <div className="text-2xl font-bold text-orange-600">
                {summaryData.highLoadCount}
              </div>
            </div>
          </div>

          {/* Нормальная загрузка */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-600 mb-0.5">Нормальная (40-70%)</div>
              <div className="text-2xl font-bold text-green-600">
                {summaryData.normalLoadCount}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
