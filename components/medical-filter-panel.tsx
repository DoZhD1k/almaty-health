"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronDown,
  ChevronUp,
  Building2,
  TrendingUp,
  AlertTriangle,
  Bed,
  Search,
} from "lucide-react";
import {
  FacilityStatistic,
  MedicalFilterState,
  FacilityType,
  BedProfile,
  LoadLevel,
} from "@/types/healthcare";

interface MedicalFilterPanelProps {
  onFiltersChange: (filters: MedicalFilterState) => void;
  facilities: FacilityStatistic[];
  className?: string;
}

const loadLevelOptions: LoadLevel[] = [
  { id: "low", label: "Низкая (< 50%)", minOccupancy: 0, maxOccupancy: 0.5 },
  {
    id: "normal",
    label: "Нормальная (50-80%)",
    minOccupancy: 0.5,
    maxOccupancy: 0.8,
  },
  {
    id: "high",
    label: "Высокая (80-95%)",
    minOccupancy: 0.8,
    maxOccupancy: 0.95,
  },
  {
    id: "critical",
    label: "Критическая (> 95%)",
    minOccupancy: 0.95,
    maxOccupancy: 1,
  },
];

export function MedicalFilterPanel({
  onFiltersChange,
  facilities,
  className = "",
}: MedicalFilterPanelProps) {
  const [filters, setFilters] = useState<MedicalFilterState>({
    district: "Все районы",
    facilityTypes: [],
    bedProfiles: [],
    loadLevels: [],
    searchQuery: "",
  });

  const [expandedSections, setExpandedSections] = useState({
    facilityTypes: true,
    bedProfiles: true,
    loadLevels: true,
  });

  // Извлекаем уникальные данные из facilities
  const { districts, facilityTypeOptions, bedProfileOptions } = useMemo(() => {
    const districts = [
      "Все районы",
      ...new Set(facilities.map((f) => f.district).filter(Boolean)),
    ];

    const facilityTypes = [
      ...new Set(facilities.map((f) => f.facility_type).filter(Boolean)),
    ].map((type) => ({ id: type, label: type }));

    const bedProfiles = [
      ...new Set(facilities.map((f) => f.bed_profile).filter(Boolean)),
    ].map((profile) => ({ id: profile, label: profile }));

    return {
      districts,
      facilityTypeOptions: facilityTypes,
      bedProfileOptions: bedProfiles,
    };
  }, [facilities]);

  // Вычисляем статистику на основе отфильтрованных данных
  const summaryData = useMemo(() => {
    const filteredFacilities = facilities.filter((facility) => {
      // Search filter
      if (
        filters.searchQuery &&
        !facility.medical_organization
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase())
      ) {
        return false;
      }

      // District filter
      if (
        filters.district !== "Все районы" &&
        facility.district !== filters.district
      ) {
        return false;
      }

      // Facility type filter
      if (
        filters.facilityTypes.length > 0 &&
        !filters.facilityTypes.includes(facility.facility_type)
      ) {
        return false;
      }

      // Bed profile filter
      if (
        filters.bedProfiles.length > 0 &&
        !filters.bedProfiles.includes(facility.bed_profile)
      ) {
        return false;
      }

      // Load level filter
      if (filters.loadLevels.length > 0) {
        const matchesAnyLoadLevel = filters.loadLevels.some((loadLevelId) => {
          const loadLevel = loadLevelOptions.find((l) => l.id === loadLevelId);
          if (!loadLevel) return false;
          return (
            facility.occupancy_rate_percent >= loadLevel.minOccupancy &&
            facility.occupancy_rate_percent < loadLevel.maxOccupancy
          );
        });
        if (!matchesAnyLoadLevel) return false;
      }

      return true;
    });

    if (!filteredFacilities.length) {
      return {
        totalFacilities: 0,
        averageOccupancy: 0,
        overloadedCount: 0,
        totalBeds: 0,
      };
    }

    const totalFacilities = filteredFacilities.length;
    const totalOccupancy = filteredFacilities.reduce(
      (sum, f) => sum + f.occupancy_rate_percent,
      0
    );
    const averageOccupancy = Math.round(
      (totalOccupancy / totalFacilities) * 100
    );
    const overloadedCount = filteredFacilities.filter(
      (f) => f.occupancy_rate_percent > 0.95
    ).length;
    const totalBeds = filteredFacilities.reduce(
      (sum, f) => sum + (f.beds_deployed_withdrawn_for_rep || 0),
      0
    );

    return {
      totalFacilities,
      averageOccupancy,
      overloadedCount,
      totalBeds,
    };
  }, [facilities, filters]);

  const updateFilters = (newFilters: Partial<MedicalFilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const handleCheckboxChange = (
    category: keyof Pick<
      MedicalFilterState,
      "facilityTypes" | "bedProfiles" | "loadLevels"
    >,
    value: string,
    checked: boolean
  ) => {
    const currentValues = filters[category];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((item) => item !== value);

    updateFilters({ [category]: newValues });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div
      className={`bg-white/95 rounded-lg border border-gray-200 p-4 backdrop-blur-sm shadow-xl ${className}`}
    >
      {/* Заголовок */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Фильтры</h2>
      </div>

      <div className="space-y-4">
        {/* Поиск по названию МО */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Поиск медицинской организации
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Введите название организации..."
              value={filters.searchQuery}
              onChange={(e) => updateFilters({ searchQuery: e.target.value })}
              className="pl-10 h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Выбор района */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Район
          </Label>
          <Select
            value={filters.district}
            onValueChange={(value) => updateFilters({ district: value })}
          >
            <SelectTrigger className="w-full h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Выберите район" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Типы медицинской организации */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection("facilityTypes")}
            className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">Типы МО:</span>
            {expandedSections.facilityTypes ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
          {expandedSections.facilityTypes && (
            <div className="px-3 pb-3 space-y-2 border-t border-gray-100 max-h-40 overflow-y-auto">
              {facilityTypeOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`facility-type-${option.id}`}
                    checked={filters.facilityTypes.includes(option.id)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        "facilityTypes",
                        option.id,
                        checked as boolean
                      )
                    }
                    className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label
                    htmlFor={`facility-type-${option.id}`}
                    className="text-sm font-normal cursor-pointer text-gray-700"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Профиль коек */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection("bedProfiles")}
            className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">Профиль коек:</span>
            {expandedSections.bedProfiles ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
          {expandedSections.bedProfiles && (
            <div className="px-3 pb-3 space-y-2 border-t border-gray-100 max-h-40 overflow-y-auto">
              {bedProfileOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`bed-profile-${option.id}`}
                    checked={filters.bedProfiles.includes(option.id)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        "bedProfiles",
                        option.id,
                        checked as boolean
                      )
                    }
                    className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label
                    htmlFor={`bed-profile-${option.id}`}
                    className="text-sm font-normal cursor-pointer text-gray-700"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Уровень загруженности */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection("loadLevels")}
            className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">
              Уровень загруженности:
            </span>
            {expandedSections.loadLevels ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
          {expandedSections.loadLevels && (
            <div className="px-3 pb-3 space-y-2 border-t border-gray-100">
              {loadLevelOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`load-level-${option.id}`}
                    checked={filters.loadLevels.includes(option.id)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        "loadLevels",
                        option.id,
                        checked as boolean
                      )
                    }
                    className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label
                    htmlFor={`load-level-${option.id}`}
                    className="text-sm font-normal cursor-pointer text-gray-700"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Статистика - в нижней части панели */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-gray-50 rounded-lg border-t border-gray-200">
          {/* Всего коек */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[rgb(var(--blue-light))] border border-[rgb(var(--blue-light-active))]">
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[rgb(var(--blue-normal))]">
              <Bed className="h-3 w-3 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-medium text-[rgb(var(--blue-normal-active))]">
                Всего коек
              </div>
              <div className="text-sm font-bold truncate text-[rgb(var(--blue-dark))]">
                {summaryData.totalBeds.toLocaleString("ru-RU")}
              </div>
            </div>
          </div>

          {/* Средняя загруженность */}
          <div
            className={`flex items-center gap-2 p-2 rounded-lg border ${
              summaryData.averageOccupancy >= 40 &&
              summaryData.averageOccupancy <= 70
                ? "bg-green-50 border-green-100"
                : summaryData.averageOccupancy > 70
                ? "bg-orange-50 border-orange-100"
                : "bg-gray-50 border-gray-100"
            }`}
          >
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-lg ${
                summaryData.averageOccupancy >= 40 &&
                summaryData.averageOccupancy <= 70
                  ? "bg-green-500"
                  : summaryData.averageOccupancy > 70
                  ? "bg-orange-500"
                  : "bg-gray-500"
              }`}
            >
              <TrendingUp className="h-3 w-3 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div
                className={`text-[9px] font-medium ${
                  summaryData.averageOccupancy >= 40 &&
                  summaryData.averageOccupancy <= 70
                    ? "text-green-600"
                    : summaryData.averageOccupancy > 70
                    ? "text-orange-600"
                    : "text-gray-600"
                }`}
              >
                Загруженность
              </div>
              <div
                className={`text-sm font-bold ${
                  summaryData.averageOccupancy >= 40 &&
                  summaryData.averageOccupancy <= 70
                    ? "text-green-700"
                    : summaryData.averageOccupancy > 70
                    ? "text-orange-700"
                    : "text-gray-700"
                }`}
              >
                {summaryData.averageOccupancy}%
              </div>
            </div>
          </div>

          {/* Всего МО */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[rgb(var(--blue-light))] border border-[rgb(var(--blue-light-active))]">
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[rgb(var(--blue-normal))]">
              <Building2 className="h-3 w-3 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-medium text-[rgb(var(--blue-normal-active))]">
                Всего МО
              </div>
              <div className="text-sm font-bold text-[rgb(var(--blue-dark))]">
                {summaryData.totalFacilities}
              </div>
            </div>
          </div>

          {/* Критическая */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-100">
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-red-500">
              <AlertTriangle className="h-3 w-3 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] text-red-600 font-medium">
                Критическая
              </div>
              <div className="text-sm font-bold text-red-700">
                {summaryData.overloadedCount}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
