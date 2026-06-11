"use client";

import { useMemo } from "react";
import { Building, BedSingle, Users, Percent, Activity } from "lucide-react";
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
<<<<<<< HEAD
    0,
  );
  const totalPatients = filteredFacilities.reduce(
    (sum, f) => sum + (f.total_admitted_patients || 0),
    0,
=======
    0
  );
  const totalPatients = filteredFacilities.reduce(
    (sum, f) => sum + (f.total_admitted_patients || 0),
    0
>>>>>>> gitlab/main
  );

  // Расчет средней загруженности (как в таблице)
  const avgBedDayPercentage = useMemo(() => {
    const facilitiesWithData = filteredFacilities.filter(
      (f) =>
        f.total_inpatient_bed_days &&
<<<<<<< HEAD
        f.beds_deployed_withdrawn_for_rep_avg_annual,
=======
        f.beds_deployed_withdrawn_for_rep_avg_annual
>>>>>>> gitlab/main
    );

    if (facilitiesWithData.length === 0) return 0;

    // Используем 240 рабочих дней для расчета загруженности (как в таблице)
    const totalPercentage = facilitiesWithData.reduce((sum, f) => {
      const facticalBedDays =
        240 * f.beds_deployed_withdrawn_for_rep_avg_annual;
      const percentage =
        facticalBedDays > 0
          ? (f.total_inpatient_bed_days / facticalBedDays) * 100
          : 0;
      return sum + percentage;
    }, 0);

    return totalPercentage / facilitiesWithData.length;
  }, [filteredFacilities]);

  // Расчет средней смертности
  const avgMortalityRate = useMemo(() => {
    const totalDeaths = filteredFacilities.reduce(
      (sum, f) => sum + (f.death_smp || 0) + (f.death_vtmp || 0),
<<<<<<< HEAD
      0,
    );
    const totalAdmitted = filteredFacilities.reduce(
      (sum, f) => sum + (f.total_admitted_patients || 0),
      0,
=======
      0
    );
    const totalAdmitted = filteredFacilities.reduce(
      (sum, f) => sum + (f.total_admitted_patients || 0),
      0
>>>>>>> gitlab/main
    );

    return totalAdmitted > 0 ? (totalDeaths / totalAdmitted) * 100 : 0;
  }, [filteredFacilities]);

  return (
<<<<<<< HEAD
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
=======
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
>>>>>>> gitlab/main
      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/60 border border-[rgb(var(--blue-light-active))]/50">
        <div className="p-1.5 rounded-md bg-[rgb(var(--blue-light))]">
          <Building className="h-3 w-3 text-[rgb(var(--blue-normal))]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-medium text-[rgb(var(--grey-normal))] opacity-70">
            Учреждений
          </div>
          <div className="text-base font-bold text-[rgb(var(--blue-normal))]">
            {formatNumber(totalFacilities)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/60 border border-[rgb(var(--blue-light-active))]/50">
        <div className="p-1.5 rounded-md bg-[rgb(var(--blue-light))]">
          <BedSingle className="h-3 w-3 text-[rgb(var(--blue-dark))]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-medium text-[rgb(var(--grey-normal))] opacity-70">
            Коечный фонд
          </div>
          <div className="text-base font-bold text-[rgb(var(--blue-dark))]">
            {formatNumber(totalBeds)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/60 border border-[rgb(var(--blue-light-active))]/50">
        <div className="p-1.5 rounded-md bg-[rgb(var(--blue-light))]">
          <Users className="h-3 w-3 text-[rgb(var(--blue-dark-hover))]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-medium text-[rgb(var(--grey-normal))] opacity-70">
            Пациентов
          </div>
          <div className="text-base font-bold text-[rgb(var(--blue-dark-hover))]">
            {formatNumber(totalPatients)}
          </div>
        </div>
      </div>

      <div
        className={`flex items-center gap-2 p-2 rounded-lg bg-white/60 border ${
          Math.round(avgBedDayPercentage) >= 40 &&
          Math.round(avgBedDayPercentage) <= 70
            ? "border-emerald-500/50"
            : Math.round(avgBedDayPercentage) > 70
<<<<<<< HEAD
              ? "border-orange-500/50"
              : "border-gray-500/50"
=======
            ? "border-orange-500/50"
            : "border-gray-500/50"
>>>>>>> gitlab/main
        }`}
      >
        <div
          className={`p-1.5 rounded-md ${
            Math.round(avgBedDayPercentage) >= 40 &&
            Math.round(avgBedDayPercentage) <= 70
              ? "bg-emerald-100"
              : Math.round(avgBedDayPercentage) > 70
<<<<<<< HEAD
                ? "bg-orange-100"
                : "bg-gray-100"
=======
              ? "bg-orange-100"
              : "bg-gray-100"
>>>>>>> gitlab/main
          }`}
        >
          <Percent
            className={`h-3 w-3 ${
              Math.round(avgBedDayPercentage) >= 40 &&
              Math.round(avgBedDayPercentage) <= 70
                ? "text-emerald-600"
                : Math.round(avgBedDayPercentage) > 70
<<<<<<< HEAD
                  ? "text-orange-600"
                  : "text-gray-600"
=======
                ? "text-orange-600"
                : "text-gray-600"
>>>>>>> gitlab/main
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-medium text-gray-600">
            Загруженность
          </div>
          <div
            className={`text-base font-bold ${
              Math.round(avgBedDayPercentage) >= 40 &&
              Math.round(avgBedDayPercentage) <= 70
                ? "text-emerald-600"
                : Math.round(avgBedDayPercentage) > 70
<<<<<<< HEAD
                  ? "text-orange-600"
                  : "text-gray-600"
=======
                ? "text-orange-600"
                : "text-gray-600"
>>>>>>> gitlab/main
            }`}
          >
            {Math.round(avgBedDayPercentage)}%
          </div>
        </div>
      </div>

      <div
        className={`flex items-center gap-2 p-2 rounded-lg bg-white/60 border ${
          avgMortalityRate <= 1
            ? "border-emerald-500/50"
            : avgMortalityRate <= 3
<<<<<<< HEAD
              ? "border-orange-500/50"
              : "border-red-500/50"
=======
            ? "border-orange-500/50"
            : "border-red-500/50"
>>>>>>> gitlab/main
        }`}
      >
        <div
          className={`p-1.5 rounded-md ${
            avgMortalityRate <= 1
              ? "bg-emerald-100"
              : avgMortalityRate <= 3
<<<<<<< HEAD
                ? "bg-orange-100"
                : "bg-red-100"
=======
              ? "bg-orange-100"
              : "bg-red-100"
>>>>>>> gitlab/main
          }`}
        >
          <Activity
            className={`h-3 w-3 ${
              avgMortalityRate <= 1
                ? "text-emerald-600"
                : avgMortalityRate <= 3
<<<<<<< HEAD
                  ? "text-orange-600"
                  : "text-red-600"
=======
                ? "text-orange-600"
                : "text-red-600"
>>>>>>> gitlab/main
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-medium text-gray-600">
            Смертность
          </div>
          <div
            className={`text-base font-bold ${
              avgMortalityRate <= 1
                ? "text-emerald-600"
                : avgMortalityRate <= 3
<<<<<<< HEAD
                  ? "text-orange-600"
                  : "text-red-600"
=======
                ? "text-orange-600"
                : "text-red-600"
>>>>>>> gitlab/main
            }`}
          >
            {avgMortalityRate.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}
