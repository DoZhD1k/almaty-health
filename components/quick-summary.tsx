"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, TrendingUp, AlertTriangle, Users } from "lucide-react";
import { FacilityStatistic } from "@/types/healthcare";

interface SummaryData {
  totalFacilities: number;
  averageOccupancy: number;
  overloadedCount: number;
  totalBeds: number;
  highLoadCount: number;
  normalLoadCount: number;
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
      (f) => f.occupancy_rate_percent <= 0.7
    ).length;

    return {
      totalFacilities,
      averageOccupancy,
      overloadedCount,
      totalBeds,
      highLoadCount,
      normalLoadCount,
    };
  }, [facilities]);

  return (
    <Card className={`${className} mb-4`}>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* Всего МО */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {summaryData.totalFacilities}
              </div>
              <div className="text-xs text-muted-foreground">Всего МО</div>
            </div>
          </div>

          {/* Средняя загруженность */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {summaryData.averageOccupancy}%
              </div>
              <div className="text-xs text-muted-foreground">Средняя загр.</div>
            </div>
          </div>

          {/* Перегруженные */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {summaryData.overloadedCount}
              </div>
              <div className="text-xs text-muted-foreground">Перегружено</div>
            </div>
          </div>

          {/* Всего коек */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {summaryData.totalBeds}
              </div>
              <div className="text-xs text-muted-foreground">Всего коек</div>
            </div>
          </div>

          {/* Высокая загрузка */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-100">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            </div>
            <div>
              <div className="text-xl font-bold text-orange-600">
                {summaryData.highLoadCount}
              </div>
              <div className="text-xs text-muted-foreground">Высокая</div>
            </div>
          </div>

          {/* Нормальная загрузка */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-600">
                {summaryData.normalLoadCount}
              </div>
              <div className="text-xs text-muted-foreground">Нормальная</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
