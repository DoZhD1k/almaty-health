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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { FacilityStatistic } from "@/types/healthcare";

interface AdditionalChartsProps {
  filteredFacilities: FacilityStatistic[];
}

// Функция для форматирования чисел с пробелами
const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export function AdditionalCharts({
  filteredFacilities,
}: AdditionalChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* График средней смертности по профилям коек */}
      <Card>
        <CardHeader>
          <CardTitle>Показатели смертности по профилям коек</CardTitle>
          <CardDescription>Средний процент летальности</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              mortality: {
                label: "Летальность %",
                color: "#ef4444",
              },
            }}
            className="h-[300px]"
          >
            <BarChart
              data={[
                ...new Set(filteredFacilities.map((f) => f.bed_profile)),
              ].map((bedProfile) => {
                const facilities = filteredFacilities.filter(
                  (f) => f.bed_profile === bedProfile
                );
                const totalAdmitted = facilities.reduce(
                  (sum, f) =>
                    sum +
                    (f.released_smp || 0) +
                    (f.death_smp || 0) +
                    (f.released_vtmp || 0) +
                    (f.death_vtmp || 0),
                  0
                );
                const totalDeaths = facilities.reduce(
                  (sum, f) => sum + (f.death_smp || 0) + (f.death_vtmp || 0),
                  0
                );
                const mortalityRate =
                  totalAdmitted > 0 ? (totalDeaths / totalAdmitted) * 100 : 0;

                return {
                  type: bedProfile || "Не указан",
                  mortality: Number(mortalityRate.toFixed(2)),
                };
              })}
              margin={{ left: 12, right: 12, top: 20, bottom: 50 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="type"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={11}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                domain={[0, "dataMax"]}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
                formatter={(value: any) => [`${value}%`, "Летальность"]}
              />
              <Bar dataKey="mortality" fill="#ef4444" radius={4}>
                <LabelList
                  dataKey="mortality"
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
            Анализ показателей смертности <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Процент летальных исходов по профилям коек
          </div>
        </CardFooter>
      </Card>

      {/* График простоя коек по типам */}
      <Card>
        <CardHeader>
          <CardTitle>Простой коек в разрезе по типам</CardTitle>
          <CardDescription>
            Анализ недогрузки коечного фонда по типам коек
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              therapeutic: {
                label: "Терапевтические",
                color: "#3b82f6",
              },
              surgical: {
                label: "Хирургические",
                color: "#ef4444",
              },
              pediatric: {
                label: "Педиатрические",
                color: "#22c55e",
              },
              maternity: {
                label: "Родильные",
                color: "#f59e0b",
              },
              intensive: {
                label: "Реанимационные",
                color: "#8b5cf6",
              },
            }}
            className="h-[300px]"
          >
            <BarChart
              data={[
                {
                  bedType: "Терапевтические",
                  totalBeds: filteredFacilities.reduce(
                    (sum, f) => sum + (f.total_admitted_patients || 0) * 0.4,
                    0
                  ), // примерные данные
                  occupiedBeds: filteredFacilities.reduce(
                    (sum, f) =>
                      sum +
                      (f.total_admitted_patients || 0) *
                        0.4 *
                        (f.occupancy_rate_percent || 0),
                    0
                  ),
                  idleBeds: 0,
                  idlePercentage: 0,
                  fill: "#3b82f6",
                },
                {
                  bedType: "Хирургические",
                  totalBeds: filteredFacilities.reduce(
                    (sum, f) => sum + (f.total_admitted_patients || 0) * 0.3,
                    0
                  ),
                  occupiedBeds: filteredFacilities.reduce(
                    (sum, f) =>
                      sum +
                      (f.total_admitted_patients || 0) *
                        0.3 *
                        (f.occupancy_rate_percent || 0),
                    0
                  ),
                  idleBeds: 0,
                  idlePercentage: 0,
                  fill: "#ef4444",
                },
                {
                  bedType: "Педиатрические",
                  totalBeds: filteredFacilities.reduce(
                    (sum, f) => sum + (f.total_admitted_patients || 0) * 0.15,
                    0
                  ),
                  occupiedBeds: filteredFacilities.reduce(
                    (sum, f) =>
                      sum +
                      (f.total_admitted_patients || 0) *
                        0.15 *
                        (f.occupancy_rate_percent || 0),
                    0
                  ),
                  idleBeds: 0,
                  idlePercentage: 0,
                  fill: "#22c55e",
                },
                {
                  bedType: "Родильные",
                  totalBeds: filteredFacilities.reduce(
                    (sum, f) => sum + (f.total_admitted_patients || 0) * 0.1,
                    0
                  ),
                  occupiedBeds: filteredFacilities.reduce(
                    (sum, f) =>
                      sum +
                      (f.total_admitted_patients || 0) *
                        0.1 *
                        (f.occupancy_rate_percent || 0),
                    0
                  ),
                  idleBeds: 0,
                  idlePercentage: 0,
                  fill: "#f59e0b",
                },
                {
                  bedType: "Реанимационные",
                  totalBeds: filteredFacilities.reduce(
                    (sum, f) => sum + (f.total_admitted_patients || 0) * 0.05,
                    0
                  ),
                  occupiedBeds: filteredFacilities.reduce(
                    (sum, f) =>
                      sum +
                      (f.total_admitted_patients || 0) *
                        0.05 *
                        (f.occupancy_rate_percent || 0),
                    0
                  ),
                  idleBeds: 0,
                  idlePercentage: 0,
                  fill: "#8b5cf6",
                },
              ].map((item) => {
                const idleBeds = item.totalBeds - item.occupiedBeds;
                const idlePercentage =
                  item.totalBeds > 0 ? (idleBeds / item.totalBeds) * 100 : 0;
                return {
                  ...item,
                  idleBeds: Math.round(idleBeds),
                  idlePercentage: Math.round(idlePercentage),
                };
              })}
              margin={{ left: 12, right: 12, top: 20, bottom: 50 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="bedType"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={11}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatNumber(value)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
                formatter={(value: any, name: string, props: any) => [
                  `${formatNumber(Number(value))} коек (${
                    props.payload.idlePercentage
                  }% простоя)`,
                  "Простаивающих коек",
                ]}
              />
              <Bar dataKey="idleBeds" radius={4}>
                <LabelList
                  dataKey="idlePercentage"
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
            Анализ простоя коечного фонда <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Процент простаивающих коек по типам медицинских отделений
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
