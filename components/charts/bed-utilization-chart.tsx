"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Янв", actual: 24500, normative: 26800 },
  { month: "Фев", actual: 23200, normative: 26800 },
  { month: "Мар", actual: 26100, normative: 26800 },
  { month: "Апр", actual: 25400, normative: 26800 },
  { month: "Май", actual: 28200, normative: 26800 },
  { month: "Июн", actual: 27600, normative: 26800 },
  { month: "Июл", actual: 29100, normative: 26800 },
  { month: "Авг", actual: 27800, normative: 26800 },
  { month: "Сен", actual: 26500, normative: 26800 },
  { month: "Окт", actual: 25800, normative: 26800 },
  { month: "Ноя", actual: 27200, normative: 26800 },
  { month: "Дек", actual: 28450, normative: 26800 },
];

export function BedUtilizationChart() {
  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50">
      <CardHeader className="pb-4 border-b border-gray-100">
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></div>
          Койко-дни: факт vs норматив
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Сравнение фактического использования коек с нормативными показателями
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorNormative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-gray-200 opacity-50"
            />
            <XAxis
              dataKey="month"
              className="text-sm font-medium"
              tick={{ fontSize: 12, fill: "#6B7280" }}
              axisLine={{ stroke: "#D1D5DB" }}
              tickLine={{ stroke: "#D1D5DB" }}
            />
            <YAxis
              className="text-sm font-medium"
              tick={{ fontSize: 12, fill: "#6B7280" }}
              axisLine={{ stroke: "#D1D5DB" }}
              tickLine={{ stroke: "#D1D5DB" }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #E5E7EB",
                borderRadius: "12px",
                boxShadow:
                  "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                fontSize: "14px",
              }}
              cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
              formatter={(value: number) => [value.toLocaleString("ru-RU"), ""]}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
            <Area
              type="monotone"
              dataKey="normative"
              stackId="1"
              stroke="#9CA3AF"
              fill="url(#colorNormative)"
              strokeWidth={2}
              name="Норматив"
            />
            <Area
              type="monotone"
              dataKey="actual"
              stackId="2"
              stroke="#10B981"
              fill="url(#colorActual)"
              strokeWidth={3}
              name="Фактическое использование"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
