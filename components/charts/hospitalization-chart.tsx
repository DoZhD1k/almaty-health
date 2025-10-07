"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Янв", adults: 1200, children: 340, rural: 280 },
  { month: "Фев", adults: 1150, children: 320, rural: 260 },
  { month: "Мар", adults: 1300, children: 380, rural: 310 },
  { month: "Апр", adults: 1250, children: 360, rural: 290 },
  { month: "Май", adults: 1400, children: 420, rural: 340 },
  { month: "Июн", adults: 1350, children: 400, rural: 320 },
  { month: "Июл", adults: 1450, children: 440, rural: 360 },
  { month: "Авг", adults: 1380, children: 410, rural: 330 },
  { month: "Сен", adults: 1320, children: 390, rural: 300 },
  { month: "Окт", adults: 1280, children: 370, rural: 285 },
  { month: "Ноя", adults: 1350, children: 395, rural: 315 },
  { month: "Дек", adults: 1420, children: 425, rural: 345 },
];

export function HospitalizationChart() {
  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-4 border-b border-gray-100">
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          Динамика госпитализаций по месяцам
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Сравнительный анализ госпитализаций различных категорий пациентов
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
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
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
            <Line
              type="monotone"
              dataKey="adults"
              stroke="#3B82F6"
              strokeWidth={3}
              name="Взрослые"
              dot={{ fill: "#3B82F6", r: 4 }}
              activeDot={{
                r: 6,
                stroke: "#3B82F6",
                strokeWidth: 2,
                fill: "white",
              }}
            />
            <Line
              type="monotone"
              dataKey="children"
              stroke="#10B981"
              strokeWidth={3}
              name="Дети"
              dot={{ fill: "#10B981", r: 4 }}
              activeDot={{
                r: 6,
                stroke: "#10B981",
                strokeWidth: 2,
                fill: "white",
              }}
            />
            <Line
              type="monotone"
              dataKey="rural"
              stroke="#F59E0B"
              strokeWidth={3}
              name="Сельские жители"
              dot={{ fill: "#F59E0B", r: 4 }}
              activeDot={{
                r: 6,
                stroke: "#F59E0B",
                strokeWidth: 2,
                fill: "white",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
