"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const districtData = [
  { district: "Алмалинский", facilities: 4, avgLoad: 82, totalBeds: 890 },
  { district: "Ауэзовский", facilities: 6, avgLoad: 75, totalBeds: 1240 },
  { district: "Бостандыкский", facilities: 5, avgLoad: 89, totalBeds: 1050 },
  { district: "Медеуский", facilities: 3, avgLoad: 95, totalBeds: 680 },
  { district: "Наурызбайский", facilities: 4, avgLoad: 78, totalBeds: 920 },
  { district: "Турксибский", facilities: 5, avgLoad: 68, totalBeds: 1150 },
];

export function DistrictComparison() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Сравнение по районам</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={districtData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" className="text-xs" />
              <YAxis
                dataKey="district"
                type="category"
                width={120}
                className="text-xs"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Bar
                dataKey="avgLoad"
                fill="hsl(var(--primary))"
                name="Средняя загрузка (%)"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {districtData.map((district) => (
          <Card key={district.district}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{district.district}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">МО:</span>
                <span className="font-semibold">{district.facilities}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Коек:</span>
                <span className="font-semibold">{district.totalBeds}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Загрузка:
                  </span>
                  <span className="font-semibold">{district.avgLoad}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      district.avgLoad > 90
                        ? "bg-red-500"
                        : district.avgLoad > 80
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${district.avgLoad}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
