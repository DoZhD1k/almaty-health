"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { EChartsPieChart } from "./echarts-pie-chart";

const smpData = [
  { name: "Через СМП", value: 65, color: "hsl(var(--chart-1))" },
  { name: "Плановые", value: 35, color: "hsl(var(--chart-2))" },
];

const vtmpData = [
  { name: "ВТМП", value: 28, color: "hsl(var(--chart-3))" },
  { name: "Обычная помощь", value: 72, color: "hsl(var(--chart-4))" },
];

const correlationData = [
  { smpPercent: 45, load: 72, name: "Детская больница" },
  { smpPercent: 78, load: 95, name: "Кардиоцентр" },
  { smpPercent: 82, load: 105, name: "Онкоцентр" },
  { smpPercent: 65, load: 85, name: "ГКБ №1" },
  { smpPercent: 55, load: 58, name: "ЦГБ" },
  { smpPercent: 88, load: 112, name: "Травмацентр" },
];

export function SMPVTMPAnalysis() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Доля пациентов через СМП</CardTitle>
        </CardHeader>
        <CardContent>
          <EChartsPieChart
            data={smpData.map((item) => ({
              value: item.value,
              name: item.name,
              itemStyle: {
                color: item.color,
              },
            }))}
            title="Доля пациентов через СМП"
            height={300}
            showLegend={true}
            legendPosition="bottom"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Доля ВТМП</CardTitle>
        </CardHeader>
        <CardContent>
          <EChartsPieChart
            data={vtmpData.map((item) => ({
              value: item.value,
              name: item.name,
              itemStyle: {
                color: item.color,
              },
            }))}
            title="Доля ВТМП"
            height={300}
            showLegend={true}
            legendPosition="bottom"
          />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Корреляция: Доля СМП - Загруженность</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={correlationData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                type="number"
                dataKey="smpPercent"
                name="Доля СМП (%)"
                domain={[40, 90]}
                className="text-xs"
              />
              <YAxis
                type="number"
                dataKey="load"
                name="Загруженность (%)"
                domain={[50, 120]}
                className="text-xs"
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card border border-border rounded-lg p-3">
                        <p className="font-semibold">{data.name}</p>
                        <p className="text-sm">Доля СМП: {data.smpPercent}%</p>
                        <p className="text-sm">Загруженность: {data.load}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter dataKey="load" fill="hsl(var(--primary))" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
