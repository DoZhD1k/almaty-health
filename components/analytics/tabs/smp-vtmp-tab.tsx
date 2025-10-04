"use client";

import { TrendingUp, BarChart3, GitCommitVertical } from "lucide-react";
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
  LineChart,
  Line,
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
import { SmpVtmpMapbox } from "@/components/map/SmpVtmpMapbox";
import {
  FacilityStatistic,
  HospitalizationStatistic,
} from "@/types/healthcare";

interface SmpVtmpTabProps {
  filteredFacilities: FacilityStatistic[];
  hospitalizations: HospitalizationStatistic[];
}

// Функция для форматирования чисел с пробелами
const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export function SmpVtmpTab({
  filteredFacilities,
  hospitalizations,
}: SmpVtmpTabProps) {
  // Вычисляем статистику из данных
  const smpStats = {
    admitted: filteredFacilities.reduce(
      (sum, f) => sum + (f.released_smp || 0),
      0
    ),
    deaths: filteredFacilities.reduce((sum, f) => sum + (f.death_smp || 0), 0),
  };

  const vtmpStats = {
    admitted: filteredFacilities.reduce(
      (sum, f) => sum + (f.released_vtmp || 0),
      0
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
      {/* Карта СМП/ВТМП */}
      <Card>
        <CardHeader>
          <CardTitle>Карта медицинских организаций СМП и ВТМП</CardTitle>
          <CardDescription>
            Интерактивная карта размещения учреждений, оказывающих скорую и
            высокотехнологичную медицинскую помощь
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SmpVtmpMapbox className="w-full" />
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            Интерактивная карта СМП/ВТМП <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Синие маркеры - преобладает СМП, зеленые - ВТМП. Цвет границы
            показывает загруженность учреждения.
          </div>
        </CardFooter>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Круговая диаграмма соотношения госпитализированных СМП и ВТМП */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Соотношение госпитализированных СМП и ВТМП</CardTitle>
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
              radius={["40%", "80%"]}
              height={300}
              showLegend={true}
              legendPosition="bottom"
              className="mx-auto"
            />
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 leading-none font-medium">
              Всего госпитализировано:{" "}
              {formatNumber(
                smpVtmpStats.smp.admitted + smpVtmpStats.vtmp.admitted
              )}
            </div>
            <div className="text-muted-foreground leading-none">
              СМП: {formatNumber(smpVtmpStats.smp.admitted)} / ВТМП:{" "}
              {formatNumber(smpVtmpStats.vtmp.admitted)}
            </div>
          </CardFooter>
        </Card>

        {/* График корреляции СМП и ВТМП с двумя осями */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>
              Корреляция СМП/ВТМП: Загруженность vs Количество больниц
            </CardTitle>
            <CardDescription>
              Анализ зависимости между загруженностью и количеством учреждений
              по районам
            </CardDescription>
          </CardHeader>
          <CardContent>
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
              className="h-[400px]"
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

                  const totalSmp = districtFacilities.reduce(
                    (sum, f) =>
                      sum + (f.released_smp || 0) + (f.death_smp || 0),
                    0
                  );

                  const totalVtmp = districtFacilities.reduce(
                    (sum, f) =>
                      sum + (f.released_vtmp || 0) + (f.death_vtmp || 0),
                    0
                  );

                  return {
                    district: district,
                    occupancy: Math.round(avgLoad),
                    hospitals: districtFacilities.length,
                    smp: totalSmp,
                    vtmp: totalVtmp,
                  };
                })}
                margin={{ left: 20, right: 20, top: 20, bottom: 50 }}
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
