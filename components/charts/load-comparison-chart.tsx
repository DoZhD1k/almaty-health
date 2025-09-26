"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { month: "Янв", overloads: 2, refusals: 15 },
  { month: "Фев", overloads: 1, refusals: 8 },
  { month: "Мар", overloads: 3, refusals: 22 },
  { month: "Апр", overloads: 2, refusals: 18 },
  { month: "Май", overloads: 4, refusals: 28 },
  { month: "Июн", overloads: 3, refusals: 25 },
  { month: "Июл", overloads: 5, refusals: 35 },
  { month: "Авг", overloads: 4, refusals: 30 },
  { month: "Сен", overloads: 3, refusals: 20 },
  { month: "Окт", overloads: 2, refusals: 16 },
  { month: "Ноя", overloads: 3, refusals: 24 },
  { month: "Дек", overloads: 4, refusals: 32 },
]

export function LoadComparisonChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Динамика отказов и перегрузок</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Legend />
            <Bar dataKey="overloads" fill="hsl(var(--destructive))" name="Перегрузки МО" />
            <Bar dataKey="refusals" fill="hsl(var(--chart-4))" name="Отказы в госпитализации" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
