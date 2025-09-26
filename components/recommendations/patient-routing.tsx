"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Clock, Bed, Phone, CheckCircle } from "lucide-react"

const routingRecommendations = [
  {
    id: 1,
    patientProfile: "Кардиология, плановая",
    currentDestination: "Кардиологический центр (95% загрузка)",
    alternatives: [
      {
        name: "Частная клиника Медикер",
        district: "Алмалинский",
        distance: "2.3 км",
        travelTime: "8 мин",
        currentLoad: 68,
        availableBeds: 15,
        waitTime: "0 мин",
        cost: "Платно",
        priority: "high",
      },
      {
        name: "Центральная городская больница",
        district: "Турксибский",
        distance: "5.1 км",
        travelTime: "15 мин",
        currentLoad: 58,
        availableBeds: 28,
        waitTime: "0 мин",
        cost: "Бесплатно",
        priority: "medium",
      },
    ],
  },
  {
    id: 2,
    patientProfile: "Травматология, экстренная",
    currentDestination: "Травматологический центр (112% загрузка)",
    alternatives: [
      {
        name: "Городская клиническая больница №1",
        district: "Алмалинский",
        distance: "3.7 км",
        travelTime: "12 мин",
        currentLoad: 85,
        availableBeds: 8,
        waitTime: "15 мин",
        cost: "Бесплатно",
        priority: "high",
      },
      {
        name: "Центральная городская больница",
        district: "Турксибский",
        distance: "6.2 км",
        travelTime: "18 мин",
        currentLoad: 58,
        availableBeds: 22,
        waitTime: "0 мин",
        cost: "Бесплатно",
        priority: "medium",
      },
    ],
  },
]

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-green-500 text-white"
    case "medium":
      return "bg-yellow-500 text-white"
    case "low":
      return "bg-gray-500 text-white"
    default:
      return "bg-gray-500 text-white"
  }
}

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case "high":
      return "Рекомендуется"
    case "medium":
      return "Альтернатива"
    case "low":
      return "Резерв"
    default:
      return "Неизвестно"
  }
}

export function PatientRouting() {
  const [selectedProfile, setSelectedProfile] = useState("")
  const [selectedDistrict, setSelectedDistrict] = useState("")

  return (
    <div className="space-y-6">
      {/* Search Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Поиск оптимального маршрута</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Профиль пациента</Label>
              <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите профиль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardiology">Кардиология</SelectItem>
                  <SelectItem value="trauma">Травматология</SelectItem>
                  <SelectItem value="oncology">Онкология</SelectItem>
                  <SelectItem value="pediatrics">Педиатрия</SelectItem>
                  <SelectItem value="neurology">Неврология</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Район отправления</Label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите район" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="almaly">Алмалинский</SelectItem>
                  <SelectItem value="auezov">Ауэзовский</SelectItem>
                  <SelectItem value="bostandyk">Бостандыкский</SelectItem>
                  <SelectItem value="medeu">Медеуский</SelectItem>
                  <SelectItem value="nauryzbay">Наурызбайский</SelectItem>
                  <SelectItem value="turksib">Турксибский</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button className="w-full gap-2">
                <Navigation className="h-4 w-4" />
                Найти маршрут
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Routing Recommendations */}
      <div className="space-y-4">
        {routingRecommendations.map((recommendation) => (
          <Card key={recommendation.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{recommendation.patientProfile}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Текущее направление: {recommendation.currentDestination}
                  </p>
                </div>
                <Badge variant="destructive">Требует перенаправления</Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <h4 className="font-semibold">Рекомендуемые альтернативы:</h4>

                {recommendation.alternatives.map((alternative, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-semibold">{alternative.name}</h5>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {alternative.district} район
                        </div>
                      </div>
                      <Badge className={getPriorityColor(alternative.priority)}>
                        {getPriorityLabel(alternative.priority)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold">{alternative.distance}</div>
                        <div className="text-xs text-muted-foreground">Расстояние</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{alternative.travelTime}</div>
                        <div className="text-xs text-muted-foreground">В пути</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{alternative.currentLoad}%</div>
                        <div className="text-xs text-muted-foreground">Загрузка</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{alternative.availableBeds}</div>
                        <div className="text-xs text-muted-foreground">Свободных коек</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          Ожидание: {alternative.waitTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <Bed className="h-4 w-4 text-muted-foreground" />
                          {alternative.cost}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="gap-1 bg-transparent">
                          <Phone className="h-4 w-4" />
                          Связаться
                        </Button>
                        <Button size="sm" className="gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Направить
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
