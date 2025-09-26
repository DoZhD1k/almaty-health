"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { TrendingUp, TrendingDown, AlertTriangle, Calendar } from "lucide-react"

const forecastData = [
  { period: "Сегодня", actual: 87, predicted: 87, confidence: 100 },
  { period: "Завтра", actual: null, predicted: 92, confidence: 95 },
  { period: "+2 дня", actual: null, predicted: 89, confidence: 90 },
  { period: "+3 дня", actual: null, predicted: 94, confidence: 85 },
  { period: "+4 дня", actual: null, predicted: 96, confidence: 80 },
  { period: "+5 дня", actual: null, predicted: 91, confidence: 75 },
  { period: "+6 дней", actual: null, predicted: 88, confidence: 70 },
  { period: "+1 неделя", actual: null, predicted: 85, confidence: 65 },
]

const seasonalTrends = [
  { month: "Янв", historical: 82, predicted: 85, factor: "Сезонные заболевания" },
  { month: "Фев", historical: 79, predicted: 82, factor: "Снижение ОРВИ" },
  { month: "Мар", historical: 84, predicted: 87, factor: "Весенние травмы" },
  { month: "Апр", historical: 86, predicted: 89, factor: "Аллергии" },
  { month: "Май", historical: 88, predicted: 91, factor: "Дачный сезон" },
  { month: "Июн", historical: 92, predicted: 95, factor: "Летние травмы" },
  { month: "Июл", historical: 94, predicted: 97, factor: "Пик летнего сезона" },
  { month: "Авг", historical: 91, predicted: 94, factor: "Отпускной период" },
  { month: "Сен", historical: 87, predicted: 90, factor: "Школьный период" },
  { month: "Окт", historical: 85, predicted: 88, factor: "Осенние заболевания" },
  { month: "Ноя", historical: 89, predicted: 92, factor: "Предзимний период" },
  { month: "Дек", historical: 93, predicted: 96, factor: "Зимние травмы" },
]

const facilityForecasts = [
  {
    name: "Травматологический центр",
    currentLoad: 112,
    forecast7d: 118,
    forecast30d: 105,
    trend: "increasing",
    riskLevel: "high",
    factors: ["Зимний травматизм", "Недостаток персонала"],
  },
  {
    name: "Кардиологический центр",
    currentLoad: 95,
    forecast7d: 98,
    forecast30d: 92,
    trend: "stable",
    riskLevel: "medium",
    factors: ["Сезонные обострения", "Плановые операции"],
  },
  {
    name: "Детская больница",
    currentLoad: 72,
    forecast7d: 68,
    forecast30d: 75,
    trend: "decreasing",
    riskLevel: "low",
    factors: ["Снижение ОРВИ", "Каникулы"],
  },
]

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "increasing":
      return <TrendingUp className="h-4 w-4 text-red-500" />
    case "decreasing":
      return <TrendingDown className="h-4 w-4 text-green-500" />
    default:
      return <div className="h-4 w-4 rounded-full bg-yellow-500" />
  }
}

const getRiskColor = (level: string) => {
  switch (level) {
    case "high":
      return "bg-red-500 text-white"
    case "medium":
      return "bg-yellow-500 text-white"
    case "low":
      return "bg-green-500 text-white"
    default:
      return "bg-gray-500 text-white"
  }
}

export function LoadForecasting() {
  return (
    <div className="space-y-6">
      {/* Short-term Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Краткосрочный прогноз (7 дней)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="period" className="text-xs" />
              <YAxis domain={[70, 100]} className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                name="Фактическая загрузка"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Прогнозируемая загрузка"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Facility-specific Forecasts */}
      <Card>
        <CardHeader>
          <CardTitle>Прогноз по медицинским организациям</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {facilityForecasts.map((facility, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{facility.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {getTrendIcon(facility.trend)}
                      <span className="text-sm text-muted-foreground">Текущая загрузка: {facility.currentLoad}%</span>
                    </div>
                  </div>
                  <Badge className={getRiskColor(facility.riskLevel)}>
                    {facility.riskLevel === "high"
                      ? "Высокий риск"
                      : facility.riskLevel === "medium"
                        ? "Средний риск"
                        : "Низкий риск"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold">{facility.forecast7d}%</div>
                    <div className="text-xs text-muted-foreground">Прогноз на 7 дней</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{facility.forecast30d}%</div>
                    <div className="text-xs text-muted-foreground">Прогноз на 30 дней</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">
                      {facility.forecast7d > 100 ? <AlertTriangle className="h-5 w-5 text-red-500 mx-auto" /> : "✓"}
                    </div>
                    <div className="text-xs text-muted-foreground">Статус</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <h5 className="text-sm font-medium">Факторы влияния:</h5>
                  <ul className="text-sm text-muted-foreground">
                    {facility.factors.map((factor, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Seasonal Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Сезонные тренды</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={seasonalTrends}>
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
              <Bar dataKey="historical" fill="hsl(var(--muted))" name="Исторические данные" />
              <Bar dataKey="predicted" fill="hsl(var(--primary))" name="Прогноз" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
