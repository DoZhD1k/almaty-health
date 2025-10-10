"use client";

import { useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { FacilityStatistic } from "@/types/healthcare";

interface ProblemsAlertProps {
  filteredFacilities: FacilityStatistic[];
}

// Функция для форматирования чисел с пробелами
const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export function ProblemsAlert({ filteredFacilities }: ProblemsAlertProps) {
  const problems = useMemo(() => {
    const issues = [];

    // 1. Анализ высокой смертности
    const totalDeaths = filteredFacilities.reduce(
      (sum, f) => sum + (f.death_smp || 0) + (f.death_vtmp || 0),
      0
    );
    const totalAdmitted = filteredFacilities.reduce(
      (sum, f) => sum + (f.total_admitted_patients || 0),
      0
    );
    const avgMortality =
      totalAdmitted > 0 ? (totalDeaths / totalAdmitted) * 100 : 0;

    // Всегда показываем анализ смертности для диагностики
    if (totalAdmitted > 0) {
      // Найдем наиболее проблемные районы по смертности
      const districtMortality = Array.from(
        new Set(filteredFacilities.map((f) => f.district))
      )
        .map((district) => {
          const districtFacilities = filteredFacilities.filter(
            (f) => f.district === district
          );
          const districtDeaths = districtFacilities.reduce(
            (sum, f) => sum + (f.death_smp || 0) + (f.death_vtmp || 0),
            0
          );
          const districtAdmitted = districtFacilities.reduce(
            (sum, f) => sum + (f.total_admitted_patients || 0),
            0
          );
          const mortality =
            districtAdmitted > 0
              ? (districtDeaths / districtAdmitted) * 100
              : 0;
          return { district, mortality };
        })
        .filter((d) => d.mortality > 0) // Показываем все районы с данными
        .sort((a, b) => b.mortality - a.mortality);

      // Найдем наиболее проблемные профили
      const profileMortality = Array.from(
        new Set(filteredFacilities.map((f) => f.bed_profile))
      )
        .map((profile) => {
          const profileFacilities = filteredFacilities.filter(
            (f) => f.bed_profile === profile
          );
          const profileDeaths = profileFacilities.reduce(
            (sum, f) => sum + (f.death_smp || 0) + (f.death_vtmp || 0),
            0
          );
          const profileAdmitted = profileFacilities.reduce(
            (sum, f) => sum + (f.total_admitted_patients || 0),
            0
          );
          const mortality =
            profileAdmitted > 0 ? (profileDeaths / profileAdmitted) * 100 : 0;
          return { profile, mortality };
        })
        .filter((p) => p.mortality > 0) // Показываем все профили с данными
        .sort((a, b) => b.mortality - a.mortality);

      // Анализ по типу собственности
      const ownershipMortality = Array.from(
        new Set(filteredFacilities.map((f) => f.ownership_type))
      )
        .map((ownership) => {
          const ownershipFacilities = filteredFacilities.filter(
            (f) => f.ownership_type === ownership
          );
          const ownershipDeaths = ownershipFacilities.reduce(
            (sum, f) => sum + (f.death_smp || 0) + (f.death_vtmp || 0),
            0
          );
          const ownershipAdmitted = ownershipFacilities.reduce(
            (sum, f) => sum + (f.total_admitted_patients || 0),
            0
          );
          const mortality =
            ownershipAdmitted > 0
              ? (ownershipDeaths / ownershipAdmitted) * 100
              : 0;
          return { ownership, mortality };
        })
        .filter((o) => o.mortality > 0) // Показываем все типы с данными
        .sort((a, b) => b.mortality - a.mortality);

      // Определяем максимальную смертность для заголовка
      const maxMortality = Math.max(
        districtMortality.length > 0 ? districtMortality[0].mortality : 0,
        profileMortality.length > 0 ? profileMortality[0].mortality : 0,
        ownershipMortality.length > 0 ? ownershipMortality[0].mortality : 0
      );

      const mortalityStatus =
        maxMortality > 1.0 ? "Высокая смертность" : "Смертность";

      issues.push({
        type: mortalityStatus,
        description: `Максимальная смертность ${maxMortality.toFixed(1)}%`,
        details: [
          districtMortality.length > 0
            ? `• **районы** (макс): ${districtMortality
                .slice(0, 3)
                .map((d) => `${d.district} (${d.mortality.toFixed(1)}%)`)
                .join(", ")}`
            : "нет данных по районам",
          profileMortality.length > 0
            ? `• **профили** (макс): ${profileMortality
                .slice(0, 2)
                .map((p) => `${p.profile} (${p.mortality.toFixed(1)}%)`)
                .join(", ")}`
            : "нет данных по профилям",
          ownershipMortality.length > 0
            ? `• **собственность** (макс): ${ownershipMortality
                .map((o) => `${o.ownership} (${o.mortality.toFixed(1)}%)`)
                .join(", ")}`
            : "нет данных по собственности",
        ].filter(Boolean),
      });
    }

    // 2. Анализ перегруженных учреждений (95%+)
    const overloadedFacilities = filteredFacilities.filter((f) => {
      const facticalBedDays =
        240 * (f.beds_deployed_withdrawn_for_rep_avg_annual || 0);
      const loadPercentage =
        facticalBedDays > 0
          ? ((f.total_inpatient_bed_days || 0) / facticalBedDays) * 100
          : 0;
      return loadPercentage >= 95;
    });

    if (overloadedFacilities.length > 0) {
      // Анализ по районам
      const overloadedByDistrict = Array.from(
        new Set(overloadedFacilities.map((f) => f.district))
      )
        .map((district) => ({
          district,
          count: overloadedFacilities.filter((f) => f.district === district)
            .length,
        }))
        .sort((a, b) => b.count - a.count);

      // Анализ по типам учреждений
      const overloadedByType = Array.from(
        new Set(overloadedFacilities.map((f) => f.facility_type))
      )
        .map((type) => ({
          type,
          count: overloadedFacilities.filter((f) => f.facility_type === type)
            .length,
        }))
        .sort((a, b) => b.count - a.count);

      // Анализ по профилям
      const overloadedByProfile = Array.from(
        new Set(overloadedFacilities.map((f) => f.bed_profile))
      )
        .map((profile) => ({
          profile,
          count: overloadedFacilities.filter((f) => f.bed_profile === profile)
            .length,
        }))
        .sort((a, b) => b.count - a.count);

      issues.push({
        type: "Перегруженные (95%+)",
        description: `${formatNumber(overloadedFacilities.length)} МО`,
        details: [
          `• **типы**: ${overloadedByType
            .slice(0, 3)
            .map((t) => `${t.type} (${t.count})`)
            .join(", ")}`,
          `• **районы**: ${overloadedByDistrict
            .slice(0, 3)
            .map((d) => `${d.district} (${d.count})`)
            .join(", ")}`,
          `• **профили**: ${overloadedByProfile
            .slice(0, 2)
            .map((p) => `${p.profile} (${p.count})`)
            .join(", ")}`,
        ],
      });
    }

    // 3. Анализ недогруженных учреждений (<50%)
    const underloadedFacilities = filteredFacilities.filter((f) => {
      const facticalBedDays =
        240 * (f.beds_deployed_withdrawn_for_rep_avg_annual || 0);
      const loadPercentage =
        facticalBedDays > 0
          ? ((f.total_inpatient_bed_days || 0) / facticalBedDays) * 100
          : 0;
      return loadPercentage < 50 && loadPercentage > 0;
    });

    if (underloadedFacilities.length > 0) {
      // Анализ по районам
      const underloadedByDistrict = Array.from(
        new Set(underloadedFacilities.map((f) => f.district))
      )
        .map((district) => ({
          district,
          count: underloadedFacilities.filter((f) => f.district === district)
            .length,
        }))
        .sort((a, b) => b.count - a.count);

      // Анализ по типам учреждений
      const underloadedByType = Array.from(
        new Set(underloadedFacilities.map((f) => f.facility_type))
      )
        .map((type) => ({
          type,
          count: underloadedFacilities.filter((f) => f.facility_type === type)
            .length,
        }))
        .sort((a, b) => b.count - a.count);

      // Анализ по профилям
      const underloadedByProfile = Array.from(
        new Set(underloadedFacilities.map((f) => f.bed_profile))
      )
        .map((profile) => ({
          profile,
          count: underloadedFacilities.filter((f) => f.bed_profile === profile)
            .length,
        }))
        .sort((a, b) => b.count - a.count);

      issues.push({
        type: "Недогруженные (<50%)",
        description: `${formatNumber(underloadedFacilities.length)} МО`,
        details: [
          `• **типы**: ${underloadedByType
            .slice(0, 3)
            .map((t) => `${t.type} (${t.count})`)
            .join(", ")}`,
          `• **районы**: ${underloadedByDistrict
            .slice(0, 3)
            .map((d) => `${d.district} (${d.count})`)
            .join(", ")}`,
          `• **профили**: ${underloadedByProfile
            .slice(0, 2)
            .map((p) => `${p.profile} (${p.count})`)
            .join(", ")}`,
        ],
      });
    }

    return issues;
  }, [filteredFacilities]);

  if (problems.length === 0) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <AlertTriangle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Нет данных для анализа.</strong> Недостаточно данных для
          формирования отчета.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <div className="space-y-3">
          <strong>Выявленные проблемы:</strong>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {problems.map((problem, index) => (
              <div
                key={index}
                className="bg-white/50 p-3 rounded-lg border border-orange-200"
              >
                <div className="font-medium text-sm mb-2 text-orange-900">
                  {problem.type}
                </div>
                <div className="text-sm font-semibold mb-2 text-orange-800">
                  {problem.description}
                </div>
                <div className="space-y-1">
                  {problem.details.map((detail, detailIndex) => (
                    <div
                      key={detailIndex}
                      className="text-sm font-light tracking-tight text-orange-700 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: detail.replace(
                          /\*\*([^*]+)\*\*/g,
                          "<strong>$1</strong>"
                        ),
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
