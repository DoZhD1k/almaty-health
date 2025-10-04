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

interface DistrictsTabProps {
  filteredFacilities: FacilityStatistic[];
}

// Функция для форматирования чисел с пробелами
const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export function DistrictsTab({ filteredFacilities }: DistrictsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Столбчатая диаграмма - количество пациентов по районам */}
      <Card>
        <CardHeader>
          <CardTitle>Количество пациентов по районам</CardTitle>
          <CardDescription>
            Общее количество госпитализаций с процентами
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              patients: {
                label: "Пациентов",
                color: "#3b82f6",
              },
            }}
            className="h-[300px]"
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
              <Bar dataKey="patients" fill="#3b82f6" radius={4}>
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
        <CardHeader>
          <CardTitle>Средняя загрузка по районам</CardTitle>
          <CardDescription>
            Процент загрузки медицинских учреждений
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              occupancy: {
                label: "Загрузка %",
                color: "#f59e0b",
              },
            }}
            className="h-[300px]"
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
                        (sum, f) => sum + (f.occupancy_rate_percent || 0) * 100,
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
              <Bar dataKey="occupancy" fill="#f59e0b" radius={4}>
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

      {/* Столбчатая диаграмма - смертность по районам */}
      <Card>
        <CardHeader>
          <CardTitle>Смертность по районам</CardTitle>
          <CardDescription>
            Процент летальности (смертей/общ кол-во пролеченных)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              mortalityRate: {
                label: "Смертность %",
                color: "#ef4444",
              },
            }}
            className="h-[300px]"
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
              <Bar dataKey="mortalityRate" fill="#ef4444" radius={4}>
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
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            Анализ летальности по районам <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Показатель рассчитывается как отношение количества смертей к общему
            количеству пролеченных пациентов
          </div>
        </CardFooter>
      </Card>

      {/* Круговая диаграмма - распределение учреждений по районам */}
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Распределение учреждений по районам</CardTitle>
          <CardDescription>
            Количество медицинских организаций с процентами
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
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

              const colors = [
                "#3b82f6",
                "#ef4444",
                "#22c55e",
                "#f59e0b",
                "#8b5cf6",
                "#06b6d4",
                "#ec4899",
                "#84cc16",
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
            height={250}
            showLegend={true}
            legendPosition="right"
            className="mx-auto"
          />
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 leading-none font-medium">
            Всего учреждений: {filteredFacilities.length}{" "}
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Распределение медицинских организаций по районам города с указанием
            процентов
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
