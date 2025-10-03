"use client";

import { useMemo } from "react";
import { Building, BedSingle, Users, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FacilityStatistic,
  HospitalizationStatistic,
} from "@/types/healthcare";

interface KeyMetricsProps {
  filteredFacilities: FacilityStatistic[];
  hospitalizations: HospitalizationStatistic[];
}

// Функция для форматирования чисел с пробелами
const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export function KeyMetrics({
  filteredFacilities,
  hospitalizations,
}: KeyMetricsProps) {
  // Вычисление ключевых метрик
  const totalFacilities = filteredFacilities.length;
  const totalBeds = filteredFacilities.reduce(
    (sum, f) => sum + (f.beds_deployed_withdrawn_for_rep || 0),
    0
  );
  const totalPatients = filteredFacilities.reduce(
    (sum, f) => sum + (f.total_admitted_patients || 0),
    0
  );

  // Используем total_inpatient_bed_days для расчета
  const avgBedDayPercentage = useMemo(() => {
    const facilitiesWithData = filteredFacilities.filter(
      (f) => f.total_inpatient_bed_days && f.beds_deployed_withdrawn_for_rep
    );

    if (facilitiesWithData.length === 0) return 0;

    // Приблизительно используем 365 дней в году для расчета
    return (
      facilitiesWithData.reduce((sum, f) => {
        const percentage =
          f.total_inpatient_bed_days /
          (365 * f.beds_deployed_withdrawn_for_rep);
        return sum + percentage;
      }, 0) / facilitiesWithData.length
    );
  }, [filteredFacilities]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Всего учреждений
          </CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(totalFacilities)}
          </div>
          <p className="text-xs text-muted-foreground">
            медицинских организаций
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Коечный фонд</CardTitle>
          <BedSingle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(totalBeds)}</div>
          <p className="text-xs text-muted-foreground">всего коек</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Всего пациентов</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(totalPatients)}
          </div>
          <p className="text-xs text-muted-foreground">пациентов обслужено</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Средняя загруженность
          </CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(avgBedDayPercentage * 100)}%
          </div>
          <p className="text-xs text-muted-foreground">
            койко-дней от календарных
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
