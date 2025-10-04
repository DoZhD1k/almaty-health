"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  BarChart3,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { healthcareApi } from "@/lib/api/healthcare";
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
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  Tooltip,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { EChartsPieChart } from "@/components/charts/echarts-pie-chart";
import { EChartsHorizontalBar } from "@/components/charts/echarts-horizontal-bar";
import { FacilityStatistic, CityMedicalOrganization } from "@/types/healthcare";
import { AdditionalCharts } from "../cards/additional-charts";
import { DetailedFacilitiesTable } from "../cards/detailed-facilities-table";

interface ComparisonTabProps {
  filteredFacilities: FacilityStatistic[];
}

// Функция для форматирования чисел с пробелами
const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export function ComparisonTab({ filteredFacilities }: ComparisonTabProps) {
  const [cityOrganizations, setCityOrganizations] = useState<
    CityMedicalOrganization[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortKey, setSortKey] = useState<
    "name" | "beds2024" | "beds2025" | "reduction"
  >("reduction");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetchCityOrganizations = async () => {
      try {
        setIsLoading(true);
        const response = await healthcareApi.getCityMedicalOrganizations();
        setCityOrganizations(response.results || []);
      } catch (error) {
        console.error(
          "Ошибка загрузки данных городских медицинских организаций:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCityOrganizations();
  }, []);

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (key: typeof sortKey) => {
    if (sortKey !== key) {
      return <ChevronsUpDown className="h-4 w-4 ml-1 text-muted-foreground" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  const sortedCityOrganizations = () => {
    return [...cityOrganizations].sort((a, b) => {
      let aValue, bValue;

      switch (sortKey) {
        case "name":
          aValue = a.full_name || "";
          bValue = b.full_name || "";
          break;
        case "beds2024":
          aValue = a.bed_count_2024 || 0;
          bValue = b.bed_count_2024 || 0;
          break;
        case "beds2025":
          aValue = a.bed_count_2025 || 0;
          bValue = b.bed_count_2025 || 0;
          break;
        case "reduction":
          // Вычисляем сокращение коек самостоятельно для сортировки
          aValue = (a.bed_count_2024 || 0) - (a.bed_count_2025 || 0);
          bValue = (b.bed_count_2024 || 0) - (b.bed_count_2025 || 0);
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Кольцевая диаграмма сравнения по профилям коек */}
        <Card>
          <CardHeader>
            <CardTitle>Сравнение по профилям коек</CardTitle>
            <CardDescription>
              Распределение медицинских организаций по профилям коек
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EChartsPieChart
              data={[
                ...new Set(filteredFacilities.map((f) => f.bed_profile)),
              ].map((bedProfile, index) => {
                const facilities = filteredFacilities.filter(
                  (f) => f.bed_profile === bedProfile
                );
                const colors = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b"];

                return {
                  value: facilities.length,
                  name: bedProfile || "Не указан",
                  itemStyle: {
                    color: colors[index % colors.length],
                  },
                };
              })}
              height={300}
              radius={["40%", "80%"]}
              showLegend={true}
              legendPosition="right"
            />
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 leading-none font-medium">
              Анализ по типам собственности <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              Всего учреждений: {filteredFacilities.length}
            </div>
          </CardFooter>
        </Card>

        {/* Таблица урезанных коек за 2024-2025 годы */}
        <Card>
          <CardHeader>
            <CardTitle>Урезанные койки за 2024-2025 годы</CardTitle>
            <CardDescription>
              Городские медицинские организации с данными о сокращении коек
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 select-none w-2/5"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        Организация
                        {getSortIcon("name")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-center cursor-pointer hover:bg-muted/50 select-none w-20"
                      onClick={() => handleSort("beds2024")}
                    >
                      <div className="flex items-center justify-center">
                        2024
                        {getSortIcon("beds2024")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-center cursor-pointer hover:bg-muted/50 select-none w-20"
                      onClick={() => handleSort("beds2025")}
                    >
                      <div className="flex items-center justify-center">
                        2025
                        {getSortIcon("beds2025")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-right cursor-pointer hover:bg-muted/50 select-none w-24"
                      onClick={() => handleSort("reduction")}
                    >
                      <div className="flex items-center justify-end">
                        Δ{getSortIcon("reduction")}
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
                            colSpan={5}
                            className="text-center py-8 text-muted-foreground"
                          >
                            Загрузка данных...
                          </TableCell>
                        </TableRow>
                      );
                    }

                    const sortedOrganizations = sortedCityOrganizations();

                    if (sortedOrganizations.length === 0) {
                      return (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-8 text-muted-foreground"
                          >
                            Нет данных о городских медицинских организациях
                          </TableCell>
                        </TableRow>
                      );
                    }

                    return sortedOrganizations.map((organization, index) => {
                      // Вычисляем сокращение коек самостоятельно
                      const calculatedReduction =
                        (organization.bed_count_2024 || 0) -
                        (organization.bed_count_2025 || 0);
                      const bedReduction = Math.abs(calculatedReduction);
                      const hasReduction = bedReduction > 0;

                      return (
                        <TableRow
                          key={organization.id}
                          className={
                            hasReduction && index < 3
                              ? "bg-red-50 dark:bg-red-900/20"
                              : ""
                          }
                        >
                          <TableCell className="font-medium w-12">
                            {index + 1}
                          </TableCell>
                          <TableCell className="w-2/5">
                            <div
                              className="font-medium truncate cursor-help"
                              title={organization.full_name}
                            >
                              {organization.short_name}
                            </div>
                          </TableCell>
                          <TableCell className="text-center w-20">
                            <span className="font-medium text-blue-600">
                              {formatNumber(organization.bed_count_2024 || 0)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center w-20">
                            <span className="font-medium text-green-600">
                              {formatNumber(organization.bed_count_2025 || 0)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right w-24">
                            <span
                              className={`font-medium ${
                                hasReduction
                                  ? index < 3
                                    ? "text-red-600"
                                    : "text-orange-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {hasReduction ? "-" : ""}
                              {formatNumber(bedReduction)}
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
              Анализ сокращения коек <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              Городские медицинские организации с наибольшим сокращением коек
              выделены красным
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Всего организаций: {cityOrganizations.length} | С сокращениями:{" "}
              {
                cityOrganizations.filter((org) => {
                  // Вычисляем сокращение коек самостоятельно для фильтрации
                  const calculatedReduction =
                    (org.bed_count_2024 || 0) - (org.bed_count_2025 || 0);
                  return calculatedReduction > 0;
                }).length
              }
            </div>
          </CardFooter>
        </Card>

        {/* График иногородних пациентов по типу профиля (facility_type) */}
        <Card>
          <CardHeader>
            <CardTitle>Иногородние пациенты по типу профиля</CardTitle>
            <CardDescription>
              Распределение иногородних пациентов по типам медицинских профилей
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EChartsHorizontalBar
              data={(() => {
                const profileData = [
                  ...new Set(filteredFacilities.map((f) => f.facility_type)),
                ].map((facilityType) => {
                  const facilities = filteredFacilities.filter(
                    (f) => f.facility_type === facilityType
                  );
                  // Используем данные admitted_rural_residents как иногородних
                  const outOfTownPatients = facilities.reduce(
                    (sum, f) => sum + (f.admitted_rural_residents || 0),
                    0
                  );

                  return {
                    name: facilityType || "Не указан",
                    value: outOfTownPatients,
                    color: "#8b5cf6",
                  };
                });

                // Вычисляем общее количество для расчета процентов
                const total = profileData.reduce(
                  (sum, item) => sum + item.value,
                  0
                );

                // Преобразуем в проценты
                return profileData.map((item) => ({
                  ...item,
                  value:
                    total > 0
                      ? Number(((item.value / total) * 100).toFixed(1))
                      : 0,
                }));
              })()}
              title="Иногородние пациенты по типу профиля (%)"
              height={300}
              showAsPercentage={true}
            />
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 leading-none font-medium">
              Анализ иногородних пациентов по профилям{" "}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              Горизонтальная диаграмма показывает процентное соотношение
              иногородних пациентов по типам медицинских профилей
            </div>
          </CardFooter>
        </Card>
      </div>
      <DetailedFacilitiesTable filteredFacilities={filteredFacilities} />

      {/* Дополнительные диаграммы */}
      <AdditionalCharts filteredFacilities={filteredFacilities} />
    </div>
  );
}
