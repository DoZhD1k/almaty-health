import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Bed,
  Users,
  TrendingUp,
  MapPin,
  Heart,
  Baby,
  Zap,
  Stethoscope,
  Shield,
  Activity,
  Building2,
} from "lucide-react"

interface MedicalFacility {
  id: number
  name: string
  address: string
  district: string
  beds: number
  currentLoad: number
  hospitalizations: number
  discharges: number
  deaths: number
  ruralPatients: number
  loadStatus: string
  profile: string
  facilityType: string
}

interface MedicalFacilityCardProps {
  facility: MedicalFacility
}

const getLoadColor = (status: string) => {
  switch (status) {
    case "low":
      return "bg-gray-500"
    case "optimal":
      return "bg-green-500"
    case "high":
      return "bg-yellow-500"
    case "critical":
      return "bg-orange-500"
    case "overload":
      return "bg-red-500"
    case "extreme":
      return "bg-red-800"
    default:
      return "bg-gray-500"
  }
}

const getLoadLabel = (status: string) => {
  switch (status) {
    case "low":
      return "Низкая"
    case "optimal":
      return "Оптимальная"
    case "high":
      return "Высокая"
    case "critical":
      return "Критическая"
    case "overload":
      return "Перегруз"
    case "extreme":
      return "Критический"
    default:
      return "Неизвестно"
  }
}

const getMedicalIcon = (profile: string, facilityType: string) => {
  // Specialized profiles get specific icons
  if (profile.includes("Кардиология")) return Heart
  if (profile.includes("Педиатрия")) return Baby
  if (profile.includes("Онкология")) return Shield
  if (profile.includes("Травматология")) return Zap
  if (profile.includes("Неврология")) return Activity

  // General hospitals get different icons based on type
  if (facilityType === "Частная") return Building2
  if (facilityType === "Республиканская") return Stethoscope

  // Default for city hospitals
  return MapPin
}

export function MedicalFacilityCard({ facility }: MedicalFacilityCardProps) {
  const IconComponent = getMedicalIcon(facility.profile, facility.facilityType)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center mt-1"
              style={{ backgroundColor: `hsl(var(--load-${facility.loadStatus}))` }}
            >
              <IconComponent className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg leading-tight">{facility.name}</CardTitle>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                {facility.address}
              </div>
              <div className="text-sm text-muted-foreground">{facility.district} район</div>
            </div>
          </div>
          <Badge className={`${getLoadColor(facility.loadStatus)} text-white`}>
            {getLoadLabel(facility.loadStatus)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Load indicator */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Текущая загрузка</span>
            <span className="font-semibold">{facility.currentLoad}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getLoadColor(facility.loadStatus)}`}
              style={{ width: `${Math.min(facility.currentLoad, 100)}%` }}
            />
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Bed className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-semibold">{facility.beds}</div>
              <div className="text-xs text-muted-foreground">коек</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-semibold">{facility.ruralPatients}%</div>
              <div className="text-xs text-muted-foreground">сельские</div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span>Госпитализации:</span>
            <span className="font-semibold">{facility.hospitalizations}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Выписано:</span>
            <span className="font-semibold">{facility.discharges}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Летальные исходы:</span>
            <span className="font-semibold">{facility.deaths}</span>
          </div>
        </div>

        {/* Mini trend chart placeholder */}
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Динамика загрузки</span>
          </div>
          <div className="h-16 bg-muted/20 rounded flex items-end justify-center gap-1 p-2">
            {/* Simple bar chart simulation */}
            {[65, 72, 68, 75, 82, facility.currentLoad].map((value, index) => (
              <div
                key={index}
                className="bg-primary/60 rounded-sm flex-1 transition-all"
                style={{ height: `${(value / 120) * 100}%` }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
