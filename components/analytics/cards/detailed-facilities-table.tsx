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
import { FacilityStatistic } from "@/types/healthcare";

interface DetailedFacilitiesTableProps {
  filteredFacilities: FacilityStatistic[];
}

type SortKey = "name" | "profile" | "beds" | "occupancy" | "bedDays" | "idle";
type SortDirection = "asc" | "desc";

export function DetailedFacilitiesTable({
  filteredFacilities,
}: DetailedFacilitiesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("occupancy");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

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
        <CardTitle>МО по эффективности использования коек</CardTitle>
        <CardDescription>
          Все учреждения с сортировкой по загруженности
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
                    Профиль коек
                    {getSortIcon("profile")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort("beds")}
                >
                  <div className="flex items-center">
                    Количество коек
                    {getSortIcon("beds")}
                  </div>
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort("occupancy")}
                >
                  <div className="flex items-center justify-end">
                    Загруженность
                    {getSortIcon("occupancy")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort("bedDays")}
                >
                  <div className="flex items-center">
                    Койко-дни/мес
                    {getSortIcon("bedDays")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort("idle")}
                >
                  <div className="flex items-center">
                    Койко-дни простой%
                    {getSortIcon("idle")}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                const allFacilities = sortedFacilities();

                if (allFacilities.length === 0) {
                  return (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Нет данных о загруженности
                      </TableCell>
                    </TableRow>
                  );
                }

                return allFacilities.map((facility, index) => (
                  <TableRow
                    key={facility.id}
                    className={
                      index < 3 ? "bg-yellow-50 dark:bg-yellow-900/20" : ""
                    }
                  >
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="max-w-xs">
                      <div
                        className="truncate"
                        title={facility.medical_organization}
                      >
                        {facility.medical_organization}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {facility.bed_profile || "Не указан"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`font-semibold text-lg ${
                          index < 3 ? "text-yellow-600" : "text-blue-600"
                        }`}
                      >
                        {facility.beds_deployed_withdrawn_for_rep_avg_annual}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-semibold text-lg ${
                          index < 3 ? "text-yellow-600" : "text-blue-600"
                        }`}
                        title={`API загруженность: ${Math.round(
                          (facility.occupancy_rate_percent || 0) * 100
                        )}%, Расчетная: ${Math.round(
                          240 *
                            (facility.beds_deployed_withdrawn_for_rep_avg_annual ||
                              0) >
                            0
                            ? ((facility.total_inpatient_bed_days || 0) /
                                (240 *
                                  (facility.beds_deployed_withdrawn_for_rep_avg_annual ||
                                    0))) *
                                100
                            : 0
                        )}%`}
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
                          // Используем расчетную загруженность вместо API
                          return Math.round(calculatedOccupancy);
                        })()}
                        %
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`font-semibold text-lg ${
                          index < 3 ? "text-yellow-600" : "text-blue-600"
                        }`}
                        title={`Среднее койко-дней в месяц на 1 койку: ${
                          facility.beds_deployed_withdrawn_for_rep_avg_annual ||
                          0
                        } коек`}
                      >
                        {(() => {
                          const months = 8; // период расчета
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
                      <span
                        className={`font-semibold text-lg ${
                          index < 3 ? "text-red-600" : "text-gray-600"
                        }`}
                      >
                        {(() => {
                          // Повторяем тот же расчет, что и в предыдущей ячейке
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
                          // Простая формула: 100% - койко-дни%
                          const idlePercentage = 100 - bedDaysPercentage;
                          return Math.round(
                            idlePercentage > 0 ? idlePercentage : 0
                          );
                        })()}
                        %
                      </span>
                    </TableCell>
                  </TableRow>
                ));
              })()}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {/* <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Рейтинг эффективности <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Все учреждения с данными загруженности, топ-3 выделены
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Всего МО с данными загруженности:{" "}
          {
            filteredFacilities.filter(
              (f) =>
                f.occupancy_rate_percent !== null &&
                f.occupancy_rate_percent > 0
            ).length
          }
        </div>
      </CardFooter> */}
    </Card>
  );
}
