"use client";

import { Filter, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FacilityStatistic } from "@/types/healthcare";
import { useMemo } from "react";

interface AnalyticsFiltersProps {
  facilities: FacilityStatistic[];
  selectedDistricts: string[];
  selectedFacilityTypes: string[];
  selectedBedProfiles: string[];
  searchQuery: string;
  onDistrictsChange: (districts: string[]) => void;
  onFacilityTypesChange: (types: string[]) => void;
  onBedProfilesChange: (profiles: string[]) => void;
  onSearchChange: (query: string) => void;
}

export function AnalyticsFilters({
  facilities,
  selectedDistricts,
  selectedFacilityTypes,
  selectedBedProfiles,
  searchQuery,
  onDistrictsChange,
  onFacilityTypesChange,
  onBedProfilesChange,
  onSearchChange,
}: AnalyticsFiltersProps) {
  // Получение уникальных значений для фильтров
  const uniqueDistricts = useMemo(
    () => [...new Set(facilities.map((f) => f.district).filter(Boolean))],
    [facilities]
  );
  const uniqueFacilityTypes = useMemo(
    () => [...new Set(facilities.map((f) => f.facility_type).filter(Boolean))],
    [facilities]
  );
  const uniqueBedProfiles = useMemo(
    () => [...new Set(facilities.map((f) => f.bed_profile).filter(Boolean))],
    [facilities]
  );

  return (
    <div className="space-y-3">
      {/* Поле поиска - отдельно сверху на всю ширину */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--blue-normal))]" />
        <Input
          type="text"
          placeholder="Поиск по названию, району, адресу, типу организации..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-white h-9 text-sm pl-10 border-2 border-[rgb(var(--blue-light))]/30 focus:border-[rgb(var(--blue-normal))] rounded-lg shadow-sm"
        />
      </div>

      {/* Фильтры в виде карточек */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Фильтр по районам */}
        <div className="bg-white rounded-lg border border-[rgb(var(--grey-light))]/30 p-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 rounded bg-[rgb(var(--blue-light))]/10">
              <Filter className="h-3 w-3 text-[rgb(var(--blue-normal))]" />
            </div>
            <span className="text-xs font-semibold text-[rgb(var(--grey-dark))]">
              Район
            </span>
          </div>
          <Select
            value={
              selectedDistricts.length > 0
                ? selectedDistricts.join(",")
                : "all_districts"
            }
            onValueChange={(value) => {
              onDistrictsChange(
                value === "all_districts" ? [] : value.split(",")
              );
            }}
          >
            <SelectTrigger className="h-8 text-xs border-[rgb(var(--grey-light))]/40">
              <SelectValue placeholder="Все районы" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all_districts" className="text-xs">
                Все районы
              </SelectItem>
              {uniqueDistricts.map((district) => (
                <SelectItem key={district} value={district} className="text-xs">
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Фильтр по типу учреждения */}
        <div className="bg-white rounded-lg border border-[rgb(var(--grey-light))]/30 p-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 rounded bg-[rgb(var(--blue-light))]/10">
              <Filter className="h-3 w-3 text-[rgb(var(--blue-normal))]" />
            </div>
            <span className="text-xs font-semibold text-[rgb(var(--grey-dark))]">
              Тип учреждения
            </span>
          </div>
          <Select
            value={
              selectedFacilityTypes.length > 0
                ? selectedFacilityTypes.join(",")
                : "all_types"
            }
            onValueChange={(value) => {
              onFacilityTypesChange(
                value === "all_types" ? [] : value.split(",")
              );
            }}
          >
            <SelectTrigger className="h-8 text-xs border-[rgb(var(--grey-light))]/40">
              <SelectValue placeholder="Все типы" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all_types" className="text-xs">
                Все типы
              </SelectItem>
              {uniqueFacilityTypes.map((type) => (
                <SelectItem key={type} value={type} className="text-xs">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Фильтр по профилю коек */}
        <div className="bg-white rounded-lg border border-[rgb(var(--grey-light))]/30 p-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 rounded bg-[rgb(var(--blue-light))]/10">
              <Filter className="h-3 w-3 text-[rgb(var(--blue-normal))]" />
            </div>
            <span className="text-xs font-semibold text-[rgb(var(--grey-dark))]">
              Профиль коек
            </span>
          </div>
          <Select
            value={
              selectedBedProfiles.length > 0
                ? selectedBedProfiles.join(",")
                : "all_profiles"
            }
            onValueChange={(value) => {
              onBedProfilesChange(
                value === "all_profiles" ? [] : value.split(",")
              );
            }}
          >
            <SelectTrigger className="h-8 text-xs border-[rgb(var(--grey-light))]/40">
              <SelectValue placeholder="Все профили" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all_profiles" className="text-xs">
                Все профили
              </SelectItem>
              {uniqueBedProfiles.map((profile) => (
                <SelectItem key={profile} value={profile} className="text-xs">
                  {profile}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
