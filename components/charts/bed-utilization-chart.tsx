"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

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
]

export function BedUtilizationChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Койко-дни: факт vs норматив</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
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
            <Area
              type="monotone"
              dataKey="normative"
              stackId="1"
              stroke="hsl(var(--muted-foreground))"
              fill="hsl(var(--muted))"
              name="Норматив"
            />
            <Area
              type="monotone"
              dataKey="actual"
              stackId="2"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.6}
              name="Фактическое использование"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
