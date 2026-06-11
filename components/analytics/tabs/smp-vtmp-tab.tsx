"use client";

import { TrendingUp, GitCommitVertical } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { EChartsPieChart } from "@/components/charts/echarts-pie-chart";
import { AnalyticsMap } from "@/components/map/AnalyticsMap";
import {
  FacilityStatistic,
  HospitalizationStatistic,
} from "@/types/healthcare";
import { FilterDisplay } from "../filters/filter-display";

interface SmpVtmpTabProps {
  filteredFacilities: FacilityStatistic[];
  hospitalizations: HospitalizationStatistic[];
  selectedDistricts: string[];
  selectedFacilityTypes: string[];
  selectedBedProfiles: string[];
  searchQuery: string;
}

// Функция для форматирования чисел с пробелами
const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export function SmpVtmpTab({
  filteredFacilities,
  hospitalizations,
  selectedDistricts,
  selectedFacilityTypes,
  selectedBedProfiles,
  searchQuery,
}: SmpVtmpTabProps) {
  // Вычисляем статистику из данных
  const smpStats = {
    admitted: filteredFacilities.reduce(
      (sum, f) => sum + (f.released_smp || 0),
      0,
    ),
    deaths: filteredFacilities.reduce((sum, f) => sum + (f.death_smp || 0), 0),
  };

  const vtmpStats = {
    admitted: filteredFacilities.reduce(
      (sum, f) => sum + (f.released_vtmp || 0),
      0,
    ),
    deaths: filteredFacilities.reduce((sum, f) => sum + (f.death_vtmp || 0), 0),
  };

  const smpVtmpStats = {
    smp: {
      admitted: smpStats.admitted,
      deaths: smpStats.deaths,
      mortality:
        smpStats.admitted > 0 ? (smpStats.deaths / smpStats.admitted) * 100 : 0,
    },
    vtmp: {
      admitted: vtmpStats.admitted,
      deaths: vtmpStats.deaths,
      mortality:
        vtmpStats.admitted > 0
          ? (vtmpStats.deaths / vtmpStats.admitted) * 100
          : 0,
    },
  };
  return (
    <div className="space-y-4">
      {/* Сетка: карта на 2 колонки, графики по 1 колонке */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Карта СМП/ВТМП - занимает 2 колонки из 3, скрыта на мобилке */}
        <Card className="hidden sm:flex lg:col-span-2 lg:row-span-2 flex-col">
          <CardHeader>
            <CardTitle className="flex flex-col gap-1">
              <span className="text-sm sm:text-base">
                Карта мобильной доступности учреждений СМП
              </span>
              <FilterDisplay
                selectedDistricts={selectedDistricts}
                selectedFacilityTypes={selectedFacilityTypes}
                selectedBedProfiles={selectedBedProfiles}
                searchQuery={searchQuery}
                defaultText="(все стационары СМП)"
              />
            </CardTitle>
            <CardDescription>
              Интерактивная карта размещения учреждений, оказывающих скорую
              помощь
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <AnalyticsMap
              className="w-full h-full"
              filteredFacilities={filteredFacilities}
            />
          </CardContent>
        </Card>

        {/* Круговая диаграмма - правая колонка, верх */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="flex flex-col gap-1 text-center">
              <span>Соотношение госпитализированных СМП и ВТМП</span>
              <FilterDisplay
                selectedDistricts={selectedDistricts}
                selectedFacilityTypes={selectedFacilityTypes}
                selectedBedProfiles={selectedBedProfiles}
                searchQuery={searchQuery}
              />
            </CardTitle>
            <CardDescription>
              Круговая диаграмма распределения пациентов
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <EChartsPieChart
              data={[
                {
                  name: "СМП",
                  value: smpVtmpStats.smp.admitted,
                  itemStyle: {
                    color: "#3b82f6",
                  },
                },
                {
                  name: "ВТМП",
                  value: smpVtmpStats.vtmp.admitted,
                  itemStyle: {
                    color: "#22c55e",
                  },
                },
              ]}
              radius={["40%", "70%"]}
              height={300}
              showLegend={true}
              legendPosition="right"
              className="mx-auto"
            />
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 leading-none font-medium">
              Всего госпитализировано:{" "}
              {formatNumber(
                smpVtmpStats.smp.admitted + smpVtmpStats.vtmp.admitted,
              )}
            </div>
            <div className="text-muted-foreground leading-none">
              СМП: {formatNumber(smpVtmpStats.smp.admitted)} / ВТМП:{" "}
              {formatNumber(smpVtmpStats.vtmp.admitted)}
            </div>
          </CardFooter>
        </Card>

        {/* График корреляции - правая колонка, низ */}
        <Card>
          <CardHeader className="px-3 sm:px-6">
            <CardTitle className="flex flex-col gap-1">
              <span className="text-sm sm:text-base">Корреляция СМП/ВТМП</span>
              <FilterDisplay
                selectedDistricts={selectedDistricts}
                selectedFacilityTypes={selectedFacilityTypes}
                selectedBedProfiles={selectedBedProfiles}
                searchQuery={searchQuery}
              />
            </CardTitle>
            <CardDescription>
              Анализ зависимости между загруженностью и количеством учреждений
              по районам
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden px-1 sm:px-6">
            <ChartContainer
              config={{
                smp: {
                  label: "СМП",
                  color: "#3b82f6",
                },
                vtmp: {
                  label: "ВТМП",
                  color: "#22c55e",
                },
                hospitals: {
                  label: "Количество больниц",
                  color: "#ef4444",
                },
              }}
              className="h-[280px] sm:h-[400px] w-full"
            >
              <LineChart
                data={[
                  "Алмалинский",
                  "Ауэзовский",
                  "Бостандыкский",
                  "Медеуский",
                  "Наурызбайский",
                  "Турксибский",
                  "Алатауский",
                  "Жетысуский",
                ].map((district) => {
                  const districtFacilities = filteredFacilities.filter((f) =>
                    f.district?.includes(district),
                  );

                  const avgLoad =
                    districtFacilities.length > 0
                      ? districtFacilities.reduce(
                          (sum, f) =>
                            sum + (f.occupancy_rate_percent || 0) * 100,
                          0,
                        ) / districtFacilities.length
                      : 0;

                  const totalSmp = districtFacilities.reduce(
                    (sum, f) =>
                      sum + (f.released_smp || 0) + (f.death_smp || 0),
                    0,
                  );

                  const totalVtmp = districtFacilities.reduce(
                    (sum, f) =>
                      sum + (f.released_vtmp || 0) + (f.death_vtmp || 0),
                    0,
                  );

                  return {
                    district: district,
                    occupancy: Math.round(avgLoad),
                    hospitals: districtFacilities.length,
                    smp: totalSmp,
                    vtmp: totalVtmp,
                  };
                })}
                margin={{ left: 10, right: 10, top: 20, bottom: 50 }}
                width={undefined}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="district"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={11}
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                  formatter={(value: any, name: string) => {
                    if (name === "smp")
                      return [formatNumber(Number(value)), " СМП поступлений"];
                    if (name === "vtmp")
                      return [formatNumber(Number(value)), " ВТМП поступлений"];
                    if (name === "hospitals")
                      return [Number(value), "Количество больниц"];
                    return [`${value}%`, "Загруженность"];
                  }}
                />
                <Line
                  yAxisId="left"
                  dataKey="smp"
                  type="natural"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={({ cx, cy, payload }) => {
                    const r = 18;
                    return (
                      <GitCommitVertical
                        key={payload.district}
                        x={cx - r / 2}
                        y={cy - r / 2}
                        width={r}
                        height={r}
                        fill="hsl(var(--background))"
                        stroke="#3b82f6"
                      />
                    );
                  }}
                />
                <Line
                  yAxisId="left"
                  dataKey="vtmp"
                  type="natural"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={({ cx, cy, payload }) => {
                    const r = 18;
                    return (
                      <GitCommitVertical
                        key={payload.district}
                        x={cx - r / 2}
                        y={cy - r / 2}
                        width={r}
                        height={r}
                        fill="hsl(var(--background))"
                        stroke="#22c55e"
                      />
                    );
                  }}
                />
                <Legend />
              </LineChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 leading-none font-medium">
              Корреляционный анализ СМП и ВТМП{" "}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              Синяя линия - СМП, зеленая линия - ВТМП по районам города
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
