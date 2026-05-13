"use client";

import { useState, useMemo } from "react";
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
  Hospital
} from "@/types/healthcare";

interface MedicalFilterPanelProps {
  onFiltersChange: (filters: MedicalFilterState) => void;
  facilities: Hospital[];
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
    maxOccupancy: Infinity,
  },
];

export type MapMode = "load" | "buildings" | "geo";

export function MedicalFilterPanel({
  onFiltersChange,
  facilities,
  // ...props,
  className = "",
}: MedicalFilterPanelProps) {
  const [activeTab, setActiveTab] = useState<MapMode>("load");
  const [filters, setFilters] = useState<MedicalFilterState>({
    district: "Все районы",
    facilityTypes: [],
    bedProfiles: [],
    loadLevels: ["vlow", "low", "norm", "high", "vhigh", "over"], 
    searchQuery: "",
    mapMode: "load",
    showSeismicGrid: false,
    selectedTechConditions: ["dark-red", "red", "orange", "yellow", "green", "gray"],
  });

  const TECH_CONDITIONS = [
    { id: "dark-red", label: "Аварийное (аварийный флаг)", color: "#7B0000" },
    { id: "red", label: "Аварийное (снос)", color: "#B71C1C" },
    { id: "orange", label: "Сейсмоусиление / Ветхое", color: "#EF6C00" },
    { id: "yellow", label: "Неудовлетворительное", color: "#F9A825" },
    { id: "green", label: "Исправное", color: "#2E7D32" },
    { id: "gray", label: "Нет данных", color: "#9E9E9E" },
  ];

  const [expandedSections, setExpandedSections] = useState({
    facilityTypes: false,
    bedProfiles: false,
    loadLevels: true,
  });

  const handleTabChange = (mode: MapMode) => {
    setActiveTab(mode);
    // onFiltersChange({ ...filters, mapMode: mode });
    const updatedFilters = { ...filters, mapMode: mode };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const { districts, facilityTypeOptions, bedProfileOptions } = useMemo(() => {
    const districts = [
      "Все районы",
      ...new Set(facilities.map((f) => f.district).filter(Boolean)),
    ];

    const facilityTypes = [
      ...new Set(facilities.map((f) => f.org_type).filter(Boolean)),
    ].map((type) => ({ id: type, label: type }));

    const bedProfiles = [
      ...new Set(facilities.map((f) => f.ownership).filter(Boolean)),
    ].map((profile) => ({ id: profile, label: profile }));

    return {
      districts,
      facilityTypeOptions: facilityTypes,
      bedProfileOptions: bedProfiles,
    };
  }, [facilities]);

  const summaryData = useMemo(() => {
    const filteredFacilities = facilities.filter((facility) => {
      if (
        filters.searchQuery &&
        !facility.name
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (
        filters.district !== "Все районы" &&
        facility.district !== filters.district
      ) {
        return false;
      }

      if (
        filters.facilityTypes.length > 0 &&
        !filters.facilityTypes.includes(facility.org_type)
      ) {
        return false;
      }

      if (
        filters.bedProfiles.length > 0 &&
        !filters.bedProfiles.includes(facility.ownership)
      ) {
        return false;
      }

      if (filters.loadLevels.length > 0 && filters.loadLevels.length < 6) {
        if (!filters.loadLevels.includes(facility.occ_cat)) {
          return false;
        }
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
      (sum, f) => sum + (f.pct_occupied || 0),
      0,
    );

    const averageOccupancy = totalFacilities > 0 
      ? Math.round(totalOccupancy / totalFacilities) 
      : 0;

    const overloadedCount = filteredFacilities.filter(
      (f) => f.pct_occupied > 95,
    ).length;

    const totalBeds = filteredFacilities.reduce(
      (sum, f) => sum + (f.total_beds || 0),
      0,
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
    checked: boolean,
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
      className={`bg-white/95 rounded-lg border border-gray-200 backdrop-blur-sm shadow-xl flex flex-col h-fit max-h-[calc(90vh-2px)] ${className}`}
    >
      <div className="flex-shrink-0 px-4 pt-4 pb-2 border-b border-gray-100">
        <h2 className="text-md font-semibold text-gray-900">Фильтры</h2>
      </div>
      <div className="flex border-b border-gray-200 bg-gray-50 rounded-t-lg">
        {[
          { id: "load", label: "Нагрузка", icon: TrendingUp },
          { id: "buildings", label: "Здания", icon: Building2 },
          { id: "geo", label: "Геоанализ", icon: Search },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as MapMode)}
            className={`cursor-pointer rounded-md flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition-all
              ${activeTab === tab.id 
                ? "bg-blue-600 text-white shadow-inner" 
                : "text-gray-500 hover:bg-gray-100"}`}
          >
            <tab.icon className="h-3 w-3" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 px-4 py-4">
          {/* Поиск по названию МО */}
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-2 block">
              Поиск медицинской организации
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Введите название организации..."
                value={filters.searchQuery}
                onChange={(e) => updateFilters({ searchQuery: e.target.value })}
                className="pl-10 h-10 text-xs border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Выбор района */}
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-2 block">
              Район
            </Label>
            <Select
              value={filters.district}
              onValueChange={(value) => updateFilters({ district: value })}
            >
              <SelectTrigger className="w-full h-10 text-xs border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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

          {activeTab === "load" && (
            <>
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection("facilityTypes")}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs text-gray-900">Типы МО:</span>
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
                            checked as boolean,
                          )
                        }
                        className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <Label
                        htmlFor={`facility-type-${option.id}`}
                        className="text-xs font-normal cursor-pointer text-gray-700"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection("bedProfiles")}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs text-gray-900">Профиль коек:</span>
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
                            checked as boolean,
                          )
                        }
                        className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <Label
                        htmlFor={`bed-profile-${option.id}`}
                        className="text-xs font-normal cursor-pointer text-gray-700"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection("loadLevels")}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs text-gray-900">
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
                            checked as boolean,
                          )
                        }
                        className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <Label
                        htmlFor={`load-level-${option.id}`}
                        className="text-xs font-normal cursor-pointer text-gray-700"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </>
          )}

          {activeTab === "buildings" && (
            <>
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Тех. состояние</h3>
                <div className="bg-blue-50/50 p-2 rounded-lg space-y-1">
                  {TECH_CONDITIONS.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id={item.id} 
                          checked={filters.selectedTechConditions.includes(item.id)}
                          onCheckedChange={(checked) => {
                            const next = checked 
                              ? [...filters.selectedTechConditions, item.id]
                              : filters.selectedTechConditions.filter(id => id !== item.id);
                            updateFilters({ selectedTechConditions: next });
                          }}
                        />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <Label htmlFor={item.id} className="text-[11px] leading-none cursor-pointer">{item.label}</Label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 border-t pt-2">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Сейсмика</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="seismic-grid" 
                    checked={filters.showSeismicGrid}
                    onCheckedChange={(val) => updateFilters({ showSeismicGrid: !!val })}
                  />
                  <Label htmlFor="seismic-grid" className="text-xs">Сейсмическая сетка</Label>
                </div>
              </div>
            </>
          )}

          {/* Статистика - в нижней части панели */}
          <div className="grid grid-cols-2 gap-2">
            {/* Всего коек */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[rgb(var(--blue-light))] border border-[rgb(var(--blue-light-active))]">
              <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[rgb(var(--blue-normal))]">
                <Bed className="h-3 w-3 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] font-medium text-[rgb(var(--blue-normal-active))]">
                  Всего коек
                </div>
                <div className="text-xs font-bold truncate text-[rgb(var(--blue-dark))]">
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
                  className={`text-xs font-bold ${
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
                <div className="text-xs font-bold text-[rgb(var(--blue-dark))]">
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
                <div className="text-xs font-bold text-red-700">
                  {summaryData.overloadedCount}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
