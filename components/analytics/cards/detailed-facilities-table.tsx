"use client";

import { useState } from "react";
import {
  TrendingUp,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FacilityStatistic, CityMedicalOrganization } from "@/types/healthcare";

interface DetailedFacilitiesTableProps {
  filteredFacilities: FacilityStatistic[];
  cityOrganizations: CityMedicalOrganization[];
  isLoading: boolean;
}

type SortKey =
  | "name"
  | "profile"
  | "beds"
  | "occupancy"
  | "bedDays"
  | "idle"
  | "beds2024"
  | "beds2025"
  | "reduction";
type SortDirection = "asc" | "desc";

// Функция для форматирования чисел с пробелами
const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export function DetailedFacilitiesTable({
  filteredFacilities,
  cityOrganizations,
  isLoading,
}: DetailedFacilitiesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("occupancy");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Отладочная информация
  console.log("City Organizations count:", cityOrganizations.length);
  console.log("City Organizations sample:", cityOrganizations.slice(0, 3));
  console.log("Facilities count:", filteredFacilities.length);
  console.log(
    "Facilities sample:",
    filteredFacilities.slice(0, 3).map((f) => ({
      name: f.medical_organization,
      beds: f.beds_deployed_withdrawn_for_rep_avg_annual,
    }))
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <ChevronsUpDown className="h-4 w-4 ml-1 text-muted-foreground" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  // Создаем Map для быстрого поиска: facility.id → cityOrg.med_fk
  const cityOrgByMedFk = new Map(
    cityOrganizations.map((org) => [org.med_fk, org])
  );

  // Поиск городской организации: facility.id === cityOrg.med_fk
  const findCityOrg = (facility: FacilityStatistic) => {
    if (!facility || !facility.id) return null;
    return cityOrgByMedFk.get(facility.id) || null;
  };

  const sortedFacilities = () => {
    const facilities = filteredFacilities.filter(
      (f) => f.occupancy_rate_percent !== null && f.occupancy_rate_percent > 0
    );

    return facilities.sort((a, b) => {
      let aValue, bValue;

      switch (sortKey) {
        case "name":
          aValue = a.medical_organization || "";
          bValue = b.medical_organization || "";
          break;
        case "profile":
          aValue = a.bed_profile || "";
          bValue = b.bed_profile || "";
          break;
        case "beds":
          aValue = a.beds_deployed_withdrawn_for_rep_avg_annual || 0;
          bValue = b.beds_deployed_withdrawn_for_rep_avg_annual || 0;
          break;
        case "beds2024":
          const cityOrgA = findCityOrg(a);
          const cityOrgB = findCityOrg(b);
          aValue = cityOrgA?.bed_count_2024 || 0;
          bValue = cityOrgB?.bed_count_2024 || 0;
          break;
        case "beds2025":
          const cityOrgA2 = findCityOrg(a);
          const cityOrgB2 = findCityOrg(b);
          aValue = cityOrgA2?.bed_count_2025 || 0;
          bValue = cityOrgB2?.bed_count_2025 || 0;
          break;
        case "reduction":
          const cityOrgA3 = findCityOrg(a);
          const cityOrgB3 = findCityOrg(b);
          aValue =
            (cityOrgA3?.bed_count_2024 || 0) - (cityOrgA3?.bed_count_2025 || 0);
          bValue =
            (cityOrgB3?.bed_count_2024 || 0) - (cityOrgB3?.bed_count_2025 || 0);
          break;
        case "occupancy":
          // Используем расчетную загруженность
          const facticalBedDaysA =
            240 * (a.beds_deployed_withdrawn_for_rep_avg_annual || 0);
          const calculatedOccupancyA =
            facticalBedDaysA > 0
              ? ((a.total_inpatient_bed_days || 0) / facticalBedDaysA) * 100
              : 0;
          const facticalBedDaysB =
            240 * (b.beds_deployed_withdrawn_for_rep_avg_annual || 0);
          const calculatedOccupancyB =
            facticalBedDaysB > 0
              ? ((b.total_inpatient_bed_days || 0) / facticalBedDaysB) * 100
              : 0;
          aValue = calculatedOccupancyA;
          bValue = calculatedOccupancyB;
          break;
        case "bedDays":
          const bedsA = a.beds_deployed_withdrawn_for_rep_avg_annual || 0;
          const totalBedDaysA = a.total_inpatient_bed_days || 0;
          const avgPerMonthPerBedA = bedsA > 0 ? totalBedDaysA / 8 / bedsA : 0;

          const bedsB = b.beds_deployed_withdrawn_for_rep_avg_annual || 0;
          const totalBedDaysB = b.total_inpatient_bed_days || 0;
          const avgPerMonthPerBedB = bedsB > 0 ? totalBedDaysB / 8 / bedsB : 0;

          aValue = avgPerMonthPerBedA;
          bValue = avgPerMonthPerBedB;
          break;
        case "idle":
          const facticalBedDaysAIdle =
            240 * (a.beds_deployed_withdrawn_for_rep_avg_annual || 0);
          const bedDaysPercentageA =
            facticalBedDaysAIdle > 0
              ? ((a.total_inpatient_bed_days || 0) / facticalBedDaysAIdle) * 100
              : 0;
          const idlePercentageA = 100 - bedDaysPercentageA;

          const facticalBedDaysBIdle =
            240 * (b.beds_deployed_withdrawn_for_rep_avg_annual || 0);
          const bedDaysPercentageB =
            facticalBedDaysBIdle > 0
              ? ((b.total_inpatient_bed_days || 0) / facticalBedDaysBIdle) * 100
              : 0;
          const idlePercentageB = 100 - bedDaysPercentageB;

          aValue = idlePercentageA > 0 ? idlePercentageA : 0;
          bValue = idlePercentageB > 0 ? idlePercentageB : 0;
          break;
        default:
          return 0;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        const result = aValue.localeCompare(bValue, "ru");
        return sortDirection === "asc" ? result : -result;
      }

      const result = (aValue as number) - (bValue as number);
      return sortDirection === "asc" ? result : -result;
    });
  };
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>
          Объединенная таблица МО: эффективность и сокращение коек
        </CardTitle>
        <CardDescription>
          Все учреждения с данными загруженности и сокращения коек 2024-2025
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    Медицинская организация
                    {getSortIcon("name")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort("profile")}
                >
                  <div className="flex items-center">
                    Профиль
                    {getSortIcon("profile")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none text-center"
                  onClick={() => handleSort("beds")}
                >
                  <div className="flex items-center justify-center">
                    Коек
                    {getSortIcon("beds")}
                  </div>
                </TableHead>
                <TableHead
                  className="text-center cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort("beds2024")}
                >
                  <div className="flex items-center justify-center">
                    2024
                    {getSortIcon("beds2024")}
                  </div>
                </TableHead>
                <TableHead
                  className="text-center cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort("beds2025")}
                >
                  <div className="flex items-center justify-center">
                    2025
                    {getSortIcon("beds2025")}
                  </div>
                </TableHead>
                <TableHead
                  className="text-center cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort("reduction")}
                >
                  <div className="flex items-center justify-center">
                    Δ{getSortIcon("reduction")}
                  </div>
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort("occupancy")}
                >
                  <div className="flex items-center justify-end">
                    Загруж.
                    {getSortIcon("occupancy")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none text-center"
                  onClick={() => handleSort("bedDays")}
                >
                  <div className="flex items-center justify-center">
                    К-д/мес
                    {getSortIcon("bedDays")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none text-center"
                  onClick={() => handleSort("idle")}
                >
                  <div className="flex items-center justify-center">
                    Простой%
                    {getSortIcon("idle")}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                if (isLoading) {
                  return (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Загрузка данных...
                      </TableCell>
                    </TableRow>
                  );
                }

                const allFacilities = sortedFacilities();

                if (allFacilities.length === 0) {
                  return (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Нет данных о загруженности
                      </TableCell>
                    </TableRow>
                  );
                }

                return allFacilities.map((facility, index) => {
                  // Получаем данные о городской организации по med_fk
                  const cityOrg = findCityOrg(facility);
                  const bedReduction = cityOrg
                    ? (cityOrg.bed_count_2024 || 0) -
                      (cityOrg.bed_count_2025 || 0)
                    : 0;
                  const hasReduction = bedReduction > 0;

                  return (
                    <TableRow
                      key={facility.id}
                      className={
                        hasReduction && bedReduction > 50
                          ? "bg-red-50 dark:bg-red-900/20"
                          : index < 3
                          ? "bg-yellow-50 dark:bg-yellow-900/20"
                          : ""
                      }
                    >
                      <TableCell className="font-medium text-xs">
                        {index + 1}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div
                          className="truncate text-xs"
                          title={facility.medical_organization}
                        >
                          {facility.medical_organization}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {facility.bed_profile || "Не указан"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-sm text-blue-600">
                          {facility.beds_deployed_withdrawn_for_rep_avg_annual}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {cityOrg ? (
                          <span className="font-medium text-xs text-blue-600">
                            {formatNumber(cityOrg.bed_count_2024 || 0)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {cityOrg ? (
                          <span className="font-medium text-xs text-green-600">
                            {formatNumber(cityOrg.bed_count_2025 || 0)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {cityOrg ? (
                          <span
                            className={`font-medium text-xs ${
                              bedReduction > 50
                                ? "text-red-600"
                                : bedReduction > 0
                                ? "text-orange-600"
                                : bedReduction < 0
                                ? "text-green-600"
                                : "text-gray-600"
                            }`}
                          >
                            {bedReduction > 0 && "-"}
                            {bedReduction < 0 && "+"}
                            {formatNumber(Math.abs(bedReduction))}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className="font-semibold text-sm text-blue-600"
                          title={`Расчет: койко-дни / (240 дней × ${
                            facility.beds_deployed_withdrawn_for_rep_avg_annual ||
                            0
                          } коек)`}
                        >
                          {(() => {
                            const facticalBedDays =
                              240 *
                              (facility.beds_deployed_withdrawn_for_rep_avg_annual ||
                                0);
                            const calculatedOccupancy =
                              facticalBedDays > 0
                                ? ((facility.total_inpatient_bed_days || 0) /
                                    facticalBedDays) *
                                  100
                                : 0;
                            return Math.round(calculatedOccupancy);
                          })()}
                          %
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-sm text-blue-600">
                          {(() => {
                            const months = 8;
                            const beds =
                              facility.beds_deployed_withdrawn_for_rep_avg_annual ||
                              0;
                            const totalBedDays =
                              facility.total_inpatient_bed_days || 0;
                            const avgPerMonthPerBed =
                              beds > 0 ? totalBedDays / months / beds : 0;
                            return Math.round(avgPerMonthPerBed);
                          })()}
                        </span>
                      </TableCell>

                      <TableCell className="text-center">
                        <span className="font-semibold text-sm text-gray-600">
                          {(() => {
                            const facticalBedDays =
                              240 *
                              (facility.beds_deployed_withdrawn_for_rep_avg_annual ||
                                0);
                            const bedDaysPercentage =
                              facticalBedDays > 0
                                ? ((facility.total_inpatient_bed_days || 0) /
                                    facticalBedDays) *
                                  100
                                : 0;
                            const idlePercentage = 100 - bedDaysPercentage;
                            return Math.round(
                              idlePercentage > 0 ? idlePercentage : 0
                            );
                          })()}
                          %
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                });
              })()}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Комплексный анализ эффективности <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none text-xs">
          Объединенные данные о загруженности и сокращении коек. Организации с
          сокращением &gt;50 коек выделены красным, топ-3 по загруженности —
          желтым.
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Всего МО с данными загруженности:{" "}
          {
            filteredFacilities.filter(
              (f) =>
                f.occupancy_rate_percent !== null &&
                f.occupancy_rate_percent > 0
            ).length
          }{" "}
          | Городских МО загружено: {cityOrganizations.length} | С сокращениями:{" "}
          {
            cityOrganizations.filter(
              (org) => (org.bed_count_2024 || 0) - (org.bed_count_2025 || 0) > 0
            ).length
          }{" "}
          | Совпадений найдено:{" "}
          {
            filteredFacilities.filter(
              (f) => findCityOrg(f) !== null
            ).length
          }
        </div>
      </CardFooter>
    </Card>
  );
}
