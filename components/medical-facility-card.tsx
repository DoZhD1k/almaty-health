import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

interface MedicalFacility {
  id: number;
  name: string;
  address: string;
  district: string;
  beds: number;
  currentLoad: number;
  hospitalizations: number;
  discharges: number;
  deaths: number;
  ruralPatients: number;
  loadStatus: string;
  profile: string;
  facilityType: string;
}

interface MedicalFacilityCardProps {
  facility: MedicalFacility;
}

const getLoadColor = (status: string) => {
  switch (status) {
    case "low":
      return "bg-gray-500";
    case "optimal":
      return "bg-green-500";
    case "high":
      return "bg-yellow-500";
    case "critical":
      return "bg-orange-500";
    case "overload":
      return "bg-red-500";
    case "extreme":
      return "bg-red-800";
    default:
      return "bg-gray-500";
  }
};

const getLoadLabel = (status: string) => {
  switch (status) {
    case "low":
      return "Низкая";
    case "optimal":
      return "Оптимальная";
    case "high":
      return "Высокая";
    case "critical":
      return "Критическая";
    case "overload":
      return "Перегруз";
    case "extreme":
      return "Критический";
    default:
      return "Неизвестно";
  }
};

const getMedicalIcon = (profile: string, facilityType: string) => {
  // Specialized profiles get specific icons
  if (profile.includes("Кардиология")) return Heart;
  if (profile.includes("Педиатрия")) return Baby;
  if (profile.includes("Онкология")) return Shield;
  if (profile.includes("Травматология")) return Zap;
  if (profile.includes("Неврология")) return Activity;

  // General hospitals get different icons based on type
  if (facilityType === "Частная") return Building2;
  if (facilityType === "Республиканская") return Stethoscope;

  // Default for city hospitals
  return MapPin;
};

export function MedicalFacilityCard({ facility }: MedicalFacilityCardProps) {
  const IconComponent = getMedicalIcon(facility.profile, facility.facilityType);

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div
              className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg ${getLoadColor(
                facility.loadStatus
              )}`}
            >
              <IconComponent className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight mb-2 text-gray-800">
                {facility.name}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{facility.address}</span>
              </div>
              <div className="text-sm font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-lg inline-block">
                {facility.district} район
              </div>
            </div>
          </div>
          <Badge
            className={`${getLoadColor(
              facility.loadStatus
            )} text-white px-3 py-1 text-xs font-semibold shadow-sm`}
          >
            {getLoadLabel(facility.loadStatus)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Load indicator */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between text-sm mb-3">
            <span className="font-medium text-gray-700">Текущая загрузка</span>
            <span className="font-bold text-lg text-gray-800">
              {facility.currentLoad}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${getLoadColor(
                facility.loadStatus
              )} shadow-sm`}
              data-width={Math.min(facility.currentLoad, 100)}
              style={{ width: `${Math.min(facility.currentLoad, 100)}%` }}
            />
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-3 border border-blue-100">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bed className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-blue-700">
                {facility.beds}
              </div>
              <div className="text-xs text-blue-600 font-medium">коек</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-green-50 rounded-xl p-3 border border-green-100">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-green-700">
                {facility.ruralPatients}%
              </div>
              <div className="text-xs text-green-600 font-medium">сельские</div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Статистика
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Госпитализации:</span>
              <span className="font-bold text-gray-800">
                {facility.hospitalizations.toLocaleString("ru-RU")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Выписано:</span>
              <span className="font-bold text-gray-800">
                {facility.discharges.toLocaleString("ru-RU")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Летальные исходы:</span>
              <span className="font-bold text-red-600">{facility.deaths}</span>
            </div>
          </div>
        </div>

        {/* Mini trend chart */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-indigo-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
            </div>
            <span className="text-sm font-semibold text-indigo-700">
              Динамика загрузки
            </span>
          </div>
          <div className="h-20 bg-white/70 rounded-lg flex items-end justify-center gap-1.5 p-3 border border-white/50">
            {/* Simple bar chart simulation */}
            {[65, 72, 68, 75, 82, facility.currentLoad].map((value, index) => {
              const heightClass = `h-[${Math.round((value / 120) * 20)}]`; // max height 20 (5rem)
              return (
                <div
                  key={index}
                  className={`bg-gradient-to-t from-indigo-500 to-purple-500 rounded-sm flex-1 transition-all duration-300 hover:from-indigo-600 hover:to-purple-600 shadow-sm ${heightClass}`}
                />
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
