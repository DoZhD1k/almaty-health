"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, MapPin, Phone, Users, Clock } from "lucide-react"

const overloadedFacilities = [
  {
    id: 1,
    name: "Травматологический центр",
    district: "Наурызбайский",
    currentLoad: 112,
    beds: 220,
    occupiedBeds: 246,
    waitingPatients: 15,
    avgWaitTime: 45,
    riskLevel: "extreme",
    recommendations: [
      "Немедленно перенаправить 26 пациентов в соседние МО",
      "Активировать дополнительные койки в коридорах",
      "Ускорить выписку стабильных пациентов",
    ],
  },
  {
    id: 2,
    name: "Онкологический центр",
    district: "Медеуский",
    currentLoad: 105,
    beds: 180,
    occupiedBeds: 189,
    waitingPatients: 8,
    avgWaitTime: 25,
    riskLevel: "overload",
    recommendations: [
      "Перенаправить 9 пациентов в республиканские центры",
      "Оптимизировать график операций",
      "Рассмотреть досрочную выписку под наблюдение",
    ],
  },
  {
    id: 3,
    name: "Республиканский кардиологический центр",
    district: "Бостандыкский",
    currentLoad: 95,
    beds: 320,
    occupiedBeds: 304,
    waitingPatients: 12,
    avgWaitTime: 30,
    riskLevel: "critical",
    recommendations: [
      "Подготовить план перенаправления пациентов",
      "Увеличить пропускную способность приемного отделения",
      "Координация с частными клиниками",
    ],
  },
]

const getRiskColor = (level: string) => {
  switch (level) {
    case "extreme":
      return "bg-red-800 text-white"
    case "overload":
      return "bg-red-500 text-white"
    case "critical":
      return "bg-orange-500 text-white"
    default:
      return "bg-gray-500 text-white"
  }
}

const getRiskLabel = (level: string) => {
  switch (level) {
    case "extreme":
      return "Критический"
    case "overload":
      return "Перегруз"
    case "critical":
      return "Критическая"
    default:
      return "Неизвестно"
  }
}

export function OverloadAlerts() {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Критических</p>
                <p className="text-2xl font-bold text-red-600">1</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Перегруженных</p>
                <p className="text-2xl font-bold text-orange-600">2</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">В очереди</p>
                <p className="text-2xl font-bold">35</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Alerts */}
      <div className="space-y-4">
        {overloadedFacilities.map((facility) => (
          <Card key={facility.id} className="border-l-4 border-l-red-500">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{facility.name}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    {facility.district} район
                  </div>
                </div>
                <Badge className={getRiskColor(facility.riskLevel)}>{getRiskLabel(facility.riskLevel)}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Load Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{facility.currentLoad}%</div>
                  <div className="text-xs text-muted-foreground">Загрузка</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {facility.occupiedBeds}/{facility.beds}
                  </div>
                  <div className="text-xs text-muted-foreground">Коек занято</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{facility.waitingPatients}</div>
                  <div className="text-xs text-muted-foreground">В очереди</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{facility.avgWaitTime} мин</div>
                  <div className="text-xs text-muted-foreground">Ср. ожидание</div>
                </div>
              </div>

              {/* Load Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Загруженность коек</span>
                  <span className="font-semibold">{facility.currentLoad}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-red-500 transition-all"
                    style={{ width: `${Math.min(facility.currentLoad, 100)}%` }}
                  />
                  {facility.currentLoad > 100 && (
                    <div
                      className="h-3 rounded-full bg-red-800 -mt-3 transition-all"
                      style={{ width: `${facility.currentLoad - 100}%`, marginLeft: "100%" }}
                    />
                  )}
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Рекомендации:</h4>
                <ul className="space-y-1">
                  {facility.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="gap-2">
                  <Phone className="h-4 w-4" />
                  Связаться с МО
                </Button>
                <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                  <MapPin className="h-4 w-4" />
                  Показать на карте
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
