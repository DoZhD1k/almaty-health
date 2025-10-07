"use client";

import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { healthcareApi } from "@/lib/api/healthcare";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EChartsPieChart } from "@/components/charts/echarts-pie-chart";
import { EChartsHorizontalBar } from "@/components/charts/echarts-horizontal-bar";
import { FacilityStatistic, CityMedicalOrganization } from "@/types/healthcare";
import { CombinedChart } from "@/components/charts/combined-chart";
import { DetailedFacilitiesTable } from "../cards/detailed-facilities-table";

interface ComparisonTabProps {
  filteredFacilities: FacilityStatistic[];
}

export function ComparisonTab({ filteredFacilities }: ComparisonTabProps) {
  const [cityOrganizations, setCityOrganizations] = useState<
    CityMedicalOrganization[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Объединенная таблица */}
        <DetailedFacilitiesTable
          filteredFacilities={filteredFacilities}
          cityOrganizations={cityOrganizations}
          isLoading={isLoading}
        />

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
                const colors = ["#3772ff", "#2956bf", "#214499", "#193373"];

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
        </Card>

        {/* График иногородних пациентов по типу профиля (facility_type) - ТОП 10 */}
        <Card>
          <CardHeader>
            <CardTitle>Иногородние пациенты по типу профиля (ТОП-10)</CardTitle>
            <CardDescription>
              Топ-10 типов медицинских профилей по количеству иногородних пациентов
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
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
                  color: "#3772ff",
                };
              });

              // Сортируем по убыванию и берем топ-10
              const sortedData = profileData
                .sort((a, b) => b.value - a.value)
                .slice(0, 10);

              // Вычисляем общее количество для расчета процентов
              const total = sortedData.reduce(
                (sum, item) => sum + item.value,
                0
              );

              // Преобразуем в проценты
              const chartData = sortedData.map((item) => ({
                ...item,
                value:
                  total > 0
                    ? Number(((item.value / total) * 100).toFixed(1))
                    : 0,
              }));

              return (
                <EChartsHorizontalBar
                  data={chartData}
                  height={Math.max(300, chartData.length * 30)}
                  showAsPercentage={true}
                />
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Графики смертности и простоя коек */}
      <CombinedChart filteredFacilities={filteredFacilities} />
    </div>
  );
}
