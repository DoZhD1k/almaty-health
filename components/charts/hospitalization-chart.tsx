"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

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
]

export function HospitalizationChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Динамика госпитализаций по месяцам</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
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
            <Line type="monotone" dataKey="adults" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Взрослые" />
            <Line type="monotone" dataKey="children" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Дети" />
            <Line type="monotone" dataKey="rural" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Сельские жители" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
