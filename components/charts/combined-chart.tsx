"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EChartsHorizontalBar } from "@/components/charts/echarts-horizontal-bar";
import { FacilityStatistic } from "@/types/healthcare";
import { FilterDisplay } from "@/components/analytics/filters/filter-display";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface CombinedChartProps {
  filteredFacilities: FacilityStatistic[];
  selectedDistricts: string[];
  selectedFacilityTypes: string[];
  selectedBedProfiles: string[];
  searchQuery: string;
}

export function CombinedChart({
  filteredFacilities,
  selectedDistricts,
  selectedFacilityTypes,
  selectedBedProfiles,
  searchQuery,
}: CombinedChartProps) {
  // Функция для генерации цветов на основе позиции в отсортированном массиве
  const generateColors = (data: any[], baseColor: string) => {
    if (data.length === 0) return data;

    return data.map((item, index) => {
      // Для красного базового цвета (смертность)
      if (baseColor === "red") {
        const redColors = ["#970900", "#C40D01", "#FF4033", "#FF8C84"];

        // Просто берем цвет по индексу (данные уже отсортированы по убыванию)
        const colorIndex = Math.min(index, redColors.length - 1);

        return {
          ...item,
          color: redColors[colorIndex],
        };
      }

      // Для синего базового цвета (простой коек)
      if (baseColor === "blue") {
        const blueColors = ["#1D4ED8", "#2563EB", "#3B82F6", "#60A5FA"];

        // Просто берем цвет по индексу (данные уже отсортированы по убыванию)
        const colorIndex = Math.min(index, blueColors.length - 1);

        return {
          ...item,
          color: blueColors[colorIndex],
        };
      }

      return item;
    });
  };
  // Показатели смертности по профилям коек
  const mortalityByProfile = (() => {
    const profileData = [
      ...new Set(filteredFacilities.map((f) => f.bed_profile)),
    ].map((profile) => {
      const facilities = filteredFacilities.filter(
        (f) => f.bed_profile === profile
      );
      const totalDeaths = facilities.reduce(
        (sum, f) => sum + (f.death_smp || 0) + (f.death_vtmp || 0),
        0
      );
      const totalPatients = facilities.reduce(
        (sum, f) => sum + (f.total_admitted_patients || 0),
        0
      );
      const mortalityRate =
        totalPatients > 0 ? (totalDeaths / totalPatients) * 100 : 0;

      return {
        name: profile || "Не указан",
        value: Number(mortalityRate.toFixed(2)),
      };
    });

    const sortedData = profileData
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
    return generateColors(sortedData, "red");
  })();

  // Простой коек в разрезе по типам
  const bedIdleByType = (() => {
    const typeData = [
      ...new Set(filteredFacilities.map((f) => f.facility_type)),
    ].map((type) => {
      const facilities = filteredFacilities.filter(
        (f) => f.facility_type === type
      );

      const avgIdle =
        facilities.reduce((sum, f) => {
          const facticalBedDays =
            240 * (f.beds_deployed_withdrawn_for_rep_avg_annual || 0);
          const bedDaysPercentage =
            facticalBedDays > 0
              ? ((f.total_inpatient_bed_days || 0) / facticalBedDays) * 100
              : 0;
          const idlePercentage = 100 - bedDaysPercentage;
          return sum + (idlePercentage > 0 ? idlePercentage : 0);
        }, 0) / (facilities.length || 1);

      return {
        name: type || "Не указан",
        value: Number(avgIdle.toFixed(1)),
      };
    });

    const sortedData = typeData.sort((a, b) => b.value - a.value).slice(0, 10);
    return generateColors(sortedData, "blue");
  })();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Показатели смертности по профилям коек */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col gap-1">
            <span>Показатели смертности по профилям коек</span>
            <FilterDisplay
              selectedDistricts={selectedDistricts}
              selectedFacilityTypes={selectedFacilityTypes}
              selectedBedProfiles={selectedBedProfiles}
              searchQuery={searchQuery}
            />
          </CardTitle>
          <CardDescription>
            Средний процент летальности (смертей/общ кол-во пролеченных)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              mortality: {
                label: "Смертность %",
                color: "#8B0000",
              },
            }}
            className="h-[350px]"
          >
            <BarChart
              data={mortalityByProfile}
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <YAxis tickFormatter={(value) => `${value}%`} fontSize={11} />
              <Tooltip
                content={<ChartTooltipContent />}
                formatter={(value: any) => [`${value}%`, "Смертность"]}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {mortalityByProfile.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  offset={8}
                  fontSize={11}
                  formatter={(value: any) => `${value}%`}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Простой коек в разрезе по типам */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col gap-1">
            <span>Простой коек в разрезе по типам</span>
            <FilterDisplay
              selectedDistricts={selectedDistricts}
              selectedFacilityTypes={selectedFacilityTypes}
              selectedBedProfiles={selectedBedProfiles}
              searchQuery={searchQuery}
            />
          </CardTitle>
          <CardDescription>
            Анализ недогрузки коечного фонда по типам медицинских отделений
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EChartsHorizontalBar
            data={bedIdleByType}
            height={Math.max(300, bedIdleByType.length * 30)}
            showAsPercentage={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
