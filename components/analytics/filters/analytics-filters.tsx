"use client";

import { Filter } from "lucide-react";
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
import { FacilityStatistic } from "@/types/healthcare";
import { useMemo } from "react";

interface AnalyticsFiltersProps {
  facilities: FacilityStatistic[];
  selectedDistricts: string[];
  selectedFacilityTypes: string[];
  selectedBedProfiles: string[];
  onDistrictsChange: (districts: string[]) => void;
  onFacilityTypesChange: (types: string[]) => void;
  onBedProfilesChange: (profiles: string[]) => void;
}

export function AnalyticsFilters({
  facilities,
  selectedDistricts,
  selectedFacilityTypes,
  selectedBedProfiles,
  onDistrictsChange,
  onFacilityTypesChange,
  onBedProfilesChange,
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Фильтры
        </CardTitle>
        <CardDescription>
          Выберите параметры для фильтрации данных медицинских организаций
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="district-select">Районы</Label>
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
              <SelectTrigger id="district-select">
                <SelectValue placeholder="Все районы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_districts">Все районы</SelectItem>
                {uniqueDistricts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facility-type-select">Тип учреждения</Label>
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
              <SelectTrigger id="facility-type-select">
                <SelectValue placeholder="Все типы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_types">Все типы</SelectItem>
                {uniqueFacilityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bed-profile-select">Профиль коек</Label>
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
              <SelectTrigger id="bed-profile-select">
                <SelectValue placeholder="Все профили" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_profiles">Все профили</SelectItem>
                {uniqueBedProfiles.map((profile) => (
                  <SelectItem key={profile} value={profile}>
                    {profile}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
