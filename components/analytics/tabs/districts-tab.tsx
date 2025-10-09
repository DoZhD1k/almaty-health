"use client";

import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { FacilityStatistic } from "@/types/healthcare";
import { FilterDisplay } from "../filters/filter-display";

interface DistrictsTabProps {
  filteredFacilities: FacilityStatistic[];
  selectedDistricts: string[];
  selectedFacilityTypes: string[];
  selectedBedProfiles: string[];
  searchQuery: string;
}

// Функция для форматирования чисел с пробелами
const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export function DistrictsTab({
  filteredFacilities,
  selectedDistricts,
  selectedFacilityTypes,
  selectedBedProfiles,
  searchQuery,
}: DistrictsTabProps) {
  return (
    <div className="space-y-4">
      {/* Верхний ряд: Количество пациентов и Средняя загрузка */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Столбчатая диаграмма - количество пациентов по районам */}
        <Card>
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-sm flex flex-col gap-1">
              <span>Количество пациентов по районным стационарам</span>
              <FilterDisplay
                selectedDistricts={selectedDistricts}
                selectedFacilityTypes={selectedFacilityTypes}
                selectedBedProfiles={selectedBedProfiles}
                searchQuery={searchQuery}
              />
            </CardTitle>
            <CardDescription className="text-xs">
              Общее количество госпитализаций с процентами
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <ChartContainer
              config={{
                patients: {
                  label: "Пациентов",
                  color: "#3772ff",
                },
              }}
              className="h-[350px]"
            >
              <BarChart
                data={(() => {
                  const districts = [
                    "Алмалинский",
                    "Ауэзовский",
                    "Бостандыкский",
                    "Медеуский",
                    "Наурызбайский",
                    "Турксибский",
                    "Алатауский",
                    "Жетысуский",
                  ];

                  const districtData = districts.map((district) => {
                    const districtFacilities = filteredFacilities.filter((f) =>
                      f.district?.includes(district)
                    );
                    const totalPatients = districtFacilities.reduce(
                      (sum, f) => sum + (f.total_admitted_patients || 0),
                      0
                    );
                    return {
                      district: district,
                      patients: totalPatients,
                    };
                  });

                  const total = districtData.reduce(
                    (sum, d) => sum + d.patients,
                    0
                  );

                  return districtData.map((d) => ({
                    ...d,
                    percentage:
                      total > 0 ? ((d.patients / total) * 100).toFixed(1) : "0",
                  }));
                })()}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="district"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis tickFormatter={(value) => formatNumber(value)} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value: any, name: string, props: any) => [
                    `${formatNumber(Number(value))}`,
                    " Пациентов",
                  ]}
                />
                <Bar dataKey="patients" fill="#3772ff" radius={4}>
                  <LabelList
                    dataKey="percentage"
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                    formatter={(value: any) => `${value}%`}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Столбчатая диаграмма - средняя загрузка по районам */}
        <Card>
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-sm flex flex-col gap-1">
              <span>Средняя загрузка стационаров по районам</span>
              <FilterDisplay
                selectedDistricts={selectedDistricts}
                selectedFacilityTypes={selectedFacilityTypes}
                selectedBedProfiles={selectedBedProfiles}
                searchQuery={searchQuery}
              />
            </CardTitle>
            <CardDescription className="text-xs">
              Процент загрузки медицинских учреждений
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <ChartContainer
              config={{
                occupancy: {
                  label: "Загрузка %",
                  color: "#2c5bcc",
                },
              }}
              className="h-[350px]"
            >
              <BarChart
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
                    f.district?.includes(district)
                  );
                  const avgLoad =
                    districtFacilities.length > 0
                      ? districtFacilities.reduce(
                          (sum, f) =>
                            sum + (f.occupancy_rate_percent || 0) * 100,
                          0
                        ) / districtFacilities.length
                      : 0;
                  return {
                    district: district,
                    occupancy: Math.round(avgLoad),
                  };
                })}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="district"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis domain={[0, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="occupancy" fill="#2c5bcc" radius={4}>
                  <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                    formatter={(value: any) => `${value}%`}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Нижний ряд: Смертность и Распределение учреждений */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Столбчатая диаграмма - смертность по районам */}
        <Card>
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-sm flex flex-col gap-1">
              <span>Смертность по районным стационарам</span>
              <FilterDisplay
                selectedDistricts={selectedDistricts}
                selectedFacilityTypes={selectedFacilityTypes}
                selectedBedProfiles={selectedBedProfiles}
                searchQuery={searchQuery}
              />
            </CardTitle>
            <CardDescription className="text-xs">
              Процент летальности (смертей/общ кол-во пролеченных)
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <ChartContainer
              config={{
                mortalityRate: {
                  label: "Смертность %",
                  color: "#214499",
                },
              }}
              className="h-[350px]"
            >
              <BarChart
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
                    f.district?.includes(district)
                  );
                  const totalDeaths = districtFacilities.reduce(
                    (sum, f) => sum + (f.death_smp || 0) + (f.death_vtmp || 0),
                    0
                  );
                  const totalTreated = districtFacilities.reduce(
                    (sum, f) => sum + (f.total_admitted_patients || 0),
                    0
                  );
                  const mortalityRate =
                    totalTreated > 0
                      ? ((totalDeaths / totalTreated) * 100).toFixed(2)
                      : "0";

                  return {
                    district: district,
                    deaths: totalDeaths,
                    treated: totalTreated,
                    mortalityRate: parseFloat(mortalityRate),
                  };
                })}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="district"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(value) => `${value}%`}
                  domain={[0, "dataMax"]}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value: any, name: string, props: any) => [
                    `Смертность (${formatNumber(
                      props.payload.deaths
                    )} из ${formatNumber(props.payload.treated)})`,
                  ]}
                />
                <Bar dataKey="mortalityRate" fill="#214499" radius={4}>
                  <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                    formatter={(value: any) => `${value}%`}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Круговая диаграмма - распределение учреждений по районам */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-2 pt-3">
            <CardTitle className="text-sm flex flex-col gap-1 text-center">
              <span>Распределение стационаров по районам</span>
              <FilterDisplay
                selectedDistricts={selectedDistricts}
                selectedFacilityTypes={selectedFacilityTypes}
                selectedBedProfiles={selectedBedProfiles}
                searchQuery={searchQuery}
              />
            </CardTitle>
            <CardDescription className="text-xs">
              Количество медицинских организаций с процентами
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-2">
            <EChartsPieChart
              data={(() => {
                const districts = [
                  "Алмалинский",
                  "Ауэзовский",
                  "Бостандыкский",
                  "Медеуский",
                  "Наурызбайский",
                  "Турксибский",
                  "Алатауский",
                  "Жетысуский",
                ];

                // Используем blue palette градиент от светлого к темному
                const colors = [
                  "#3772ff", // Normal
                  "#2c5bcc", // Normal :active
                  "#2956bf", // Dark
                  "#214499", // Dark :hover
                  "#193373", // Dark :active
                  "#132859", // Darker
                  "#c1d3ff", // Light :active
                  "#e1eaff", // Light :hover
                ];

                return districts.map((district, index) => {
                  const districtFacilities = filteredFacilities.filter((f) =>
                    f.district?.includes(district)
                  );
                  return {
                    name: district,
                    value: districtFacilities.length,
                    itemStyle: {
                      color: colors[index % colors.length],
                    },
                  };
                });
              })()}
              height={300}
              showLegend={true}
              legendPosition="right"
              className="mx-auto"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
