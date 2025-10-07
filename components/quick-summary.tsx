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
      (f) => f.occupancy_rate_percent > 0.95
    ).length;
    const totalBeds = facilities.reduce(
      (sum, f) => sum + (f.beds_deployed_withdrawn_for_rep || 0),
      0
    );
    const highLoadCount = facilities.filter(
      (f) => f.occupancy_rate_percent > 0.8 && f.occupancy_rate_percent <= 0.95
    ).length;
    const normalLoadCount = facilities.filter(
      (f) => f.occupancy_rate_percent >= 0.5 && f.occupancy_rate_percent <= 0.8
    ).length;
    const lowLoadCount = facilities.filter(
      (f) => f.occupancy_rate_percent < 0.5
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
    <Card className={`${className} shadow-lg border-0 bg-white`}>
      <CardContent className="p-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {/* Всего коек */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[rgb(var(--blue-light))] border border-[rgb(var(--blue-light-active))]">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[rgb(var(--blue-normal))]">
              <Bed className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-medium text-[rgb(var(--blue-normal-active))]">
                Всего коек
              </div>
              <div className="text-base font-bold truncate text-[rgb(var(--blue-dark))]">
                {summaryData.totalBeds.toLocaleString("ru-RU")}
              </div>
            </div>
          </div>

          {/* Средняя загруженность */}
          <div
            className={`flex items-center gap-2 p-2 rounded-lg border ${
              summaryData.averageOccupancy >= 40 &&
              summaryData.averageOccupancy <= 70
                ? "bg-green-50 border-green-100"
                : summaryData.averageOccupancy > 70
                ? "bg-orange-50 border-orange-100"
                : "bg-gray-50 border-gray-100"
            }`}
          >
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-lg ${
                summaryData.averageOccupancy >= 40 &&
                summaryData.averageOccupancy <= 70
                  ? "bg-green-500"
                  : summaryData.averageOccupancy > 70
                  ? "bg-orange-500"
                  : "bg-gray-500"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div
                className={`text-[10px] font-medium ${
                  summaryData.averageOccupancy >= 40 &&
                  summaryData.averageOccupancy <= 70
                    ? "text-green-600"
                    : summaryData.averageOccupancy > 70
                    ? "text-orange-600"
                    : "text-gray-600"
                }`}
              >
                Загруженность
              </div>
              <div
                className={`text-base font-bold ${
                  summaryData.averageOccupancy >= 40 &&
                  summaryData.averageOccupancy <= 70
                    ? "text-green-700"
                    : summaryData.averageOccupancy > 70
                    ? "text-orange-700"
                    : "text-gray-700"
                }`}
              >
                {summaryData.averageOccupancy}%
              </div>
            </div>
          </div>

          {/* Всего МО */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[rgb(var(--blue-light))] border border-[rgb(var(--blue-light-active))]">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[rgb(var(--blue-normal))]">
              <Building2 className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-medium text-[rgb(var(--blue-normal-active))]">
                Всего МО
              </div>
              <div className="text-base font-bold text-[rgb(var(--blue-dark))]">
                {summaryData.totalFacilities}
              </div>
            </div>
          </div>

          {/* Критическая */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-100">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-500">
              <AlertTriangle className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-red-600 font-medium">
                Критическая
              </div>
              <div className="text-base font-bold text-red-700">
                {summaryData.overloadedCount}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
