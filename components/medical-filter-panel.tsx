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
<<<<<<< HEAD
  Users,
=======
>>>>>>> gitlab/main
} from "lucide-react";
import {
  FacilityStatistic,
  MedicalFilterState,
  FacilityType,
  BedProfile,
  LoadLevel,
<<<<<<< HEAD
  Hospital
=======
>>>>>>> gitlab/main
} from "@/types/healthcare";

interface MedicalFilterPanelProps {
  onFiltersChange: (filters: MedicalFilterState) => void;
<<<<<<< HEAD
  facilities: Hospital[];
  className?: string;
  onShowDistrictSummary: () => void;
  onShowNonresidents: () => void;
  onShowBuildingAnalysis: () => void;
}

const loadLevelOptions = [
  { id: "over", label: ">100% перегружено", color: "#7B0000" },
  { id: "vhigh", label: "92–100% очень высокая", color: "#C62828" },
  { id: "high", label: "85–92% высокая", color: "#EF6C00" },
  { id: "norm", label: "70–85% норма", color: "#2E7D32" },
  { id: "low", label: "50–70% низкая", color: "#FDD835" },
  { id: "vlow", label: "<50% очень низкая", color: "#9E9E9E" },
];

export type MapMode = "load" | "buildings" | "geo";

=======
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

>>>>>>> gitlab/main
export function MedicalFilterPanel({
  onFiltersChange,
  facilities,
  className = "",
<<<<<<< HEAD
  onShowDistrictSummary,
  onShowNonresidents, 
  onShowBuildingAnalysis,
}: MedicalFilterPanelProps) {
  const [activeTab, setActiveTab] = useState<MapMode>("load");
  const [filters, setFilters] = useState<MedicalFilterState>({
    district: "Все районы",
    facilityTypes: [],
    // bedProfiles: [],
    ownTypes: [],
    loadLevels: [], 
    searchQuery: "",
    mapMode: "load",
    showSeismicGrid: false,
    selectedTechConditions: [],
    geoAccessMode: "current",
    activeGeoLayers: ["zones"],
    selectedOrgTypeForGrid: null,
  });

  const TECH_CONDITIONS = [
    { id: "dark-red", label: "Аварийное (аварийный флаг)", color: "#7B0000" },
    { id: "red", label: "Аварийное (снос)", color: "#B71C1C" },
    { id: "orange", label: "Сейсмоусиление / Ветхое", color: "#EF6C00" },
    { id: "yellow", label: "Неудовлетворительное", color: "#F9A825" },
    { id: "green", label: "Исправное", color: "#2E7D32" },
    { id: "gray", label: "Нет данных", color: "#9E9E9E" },
  ];

  const OWN_TYPE_OPTIONS = [
    { id: "Городская", label: "Городская (УЗ Алматы)", color: "#1565C0" },
    { id: "Республиканская", label: "Республиканская (МЗ РК)", color: "#2E7D32" },
    { id: "Ведомственная", label: "Ведомственная", color: "#E65100" },
    { id: "Частная", label: "Частная", color: "#6A1B9A" },
  ];

  const [expandedSections, setExpandedSections] = useState({
    facilityTypes: false,
    loadLevels: false,
    ownTypes: false,
  });

  const handleTabChange = (mode: MapMode) => {
    setActiveTab(mode);
    const updatedFilters = { ...filters, mapMode: mode };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

=======
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
>>>>>>> gitlab/main
  const { districts, facilityTypeOptions, bedProfileOptions } = useMemo(() => {
    const districts = [
      "Все районы",
      ...new Set(facilities.map((f) => f.district).filter(Boolean)),
    ];

    const facilityTypes = [
<<<<<<< HEAD
      ...new Set(facilities.map((f) => f.org_type).filter(Boolean)),
    ].map((type) => ({ id: type, label: type }));

    const bedProfiles = [
      ...new Set(facilities.map((f) => f.ownership).filter(Boolean)),
    ].map((profile) => ({ id: profile, label: profile }));

    const ownTypes = [
      ...new Set(facilities.map((f) => f.own_type).filter(f => f && f !== "Не указано")),
    ].map((type) => ({ id: type, label: type }));

    return {
      districts,
      facilityTypeOptions: facilityTypes,
      bedProfileOptions: ownTypes,
      // ownTypeOptions: ownTypes,
    };
  }, [facilities]);

  const ownTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    facilities.forEach(f => {
      const type = f.own_type; 
      let key = "";
      if (type?.toLowerCase().includes("госуд") || type?.toLowerCase().includes("город")) key = "Городская";
      else if (type?.toLowerCase().includes("респ")) key = "Республиканская";
      else if (type?.toLowerCase().includes("ведом")) key = "Ведомственная";
      else if (type?.toLowerCase().includes("частн")) key = "Частная";
      
      if (key) counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [facilities]);

  const handleToggleOption = (
    category: keyof MedicalFilterState,
    value: string | null,
    allOptions: { id: string }[]
  ) => {
    const currentValues = filters[category] as string[];
    
    if (value === null) {
      updateFilters({ [category]: [] });
      return;
    }

    let nextValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    if (nextValues.length === allOptions.length || nextValues.length === 0) {
      nextValues = [];
    }

    updateFilters({ [category]: nextValues });
  };

  const summaryData = useMemo(() => {
    const filteredFacilities = facilities.filter((facility) => {
      if (
        filters.searchQuery &&
        !facility.name
=======
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
>>>>>>> gitlab/main
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase())
      ) {
        return false;
      }

<<<<<<< HEAD
=======
      // District filter
>>>>>>> gitlab/main
      if (
        filters.district !== "Все районы" &&
        facility.district !== filters.district
      ) {
        return false;
      }

<<<<<<< HEAD
      if (filters.facilityTypes.length > 0) {
        if (!filters.facilityTypes.includes(facility.org_type)) return false;
      }

      if (filters.loadLevels.length > 0) {
        if (!filters.loadLevels.includes(facility.occ_cat)) return false;
      }

      if (filters.ownTypes.length > 0) {
        if (!filters.ownTypes.includes(facility.own_type)) return false;
      }
=======
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

>>>>>>> gitlab/main
      return true;
    });

    if (!filteredFacilities.length) {
      return {
        totalFacilities: 0,
        averageOccupancy: 0,
<<<<<<< HEAD
        totalAdmitted: 0,
=======
        overloadedCount: 0,
>>>>>>> gitlab/main
        totalBeds: 0,
      };
    }

    const totalFacilities = filteredFacilities.length;
<<<<<<< HEAD

    const totalOccupancy = filteredFacilities.reduce(
      (sum, f) => sum + (f.pct_occupied || 0),
      0,
    );

    const averageOccupancy = totalFacilities > 0 
      ? Math.round(totalOccupancy / totalFacilities) 
      : 0;

    const totalBeds = filteredFacilities.reduce(
      (sum, f) => sum + (f.total_beds || 0),
      0,
    );

    const totalAdmitted = filteredFacilities.reduce(
      (sum, f) => sum + (f.admitted || 0),
      0
    );

    return {
      totalFacilities,
      averageOccupancy,
      totalAdmitted,
=======
    const totalOccupancy = filteredFacilities.reduce(
      (sum, f) => sum + f.occupancy_rate_percent,
      0,
    );
    const averageOccupancy = Math.round(
      (totalOccupancy / totalFacilities) * 100,
    );
    const overloadedCount = filteredFacilities.filter(
      (f) => f.occupancy_rate_percent > 0.95,
    ).length;
    const totalBeds = filteredFacilities.reduce(
      (sum, f) => sum + (f.beds_deployed_withdrawn_for_rep || 0),
      0,
    );

    return {
      totalFacilities,
      averageOccupancy,
      overloadedCount,
>>>>>>> gitlab/main
      totalBeds,
    };
  }, [facilities, filters]);

<<<<<<< HEAD
  const occCatCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    facilities.forEach(f => {
      counts[f.occ_cat] = (counts[f.occ_cat] || 0) + 1;
    });
    return counts;
  }, [facilities]);

=======
>>>>>>> gitlab/main
  const updateFilters = (newFilters: Partial<MedicalFilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  };

<<<<<<< HEAD
=======
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

>>>>>>> gitlab/main
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div
<<<<<<< HEAD
      className={`bg-white/95 rounded-lg border border-gray-200 backdrop-blur-sm shadow-xl flex flex-col h-fit max-h-[calc(90vh-2px)] ${className}`}
    >
      <div className="flex-shrink-0 px-4 pt-4 pb-2 border-b border-gray-100">
        <h2 className="text-md font-semibold text-gray-900">Фильтры</h2>
      </div>
      {/* <div className="flex border-b border-gray-200 bg-gray-50 rounded-t-lg">
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
      </div> */}

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2 px-4 py-4">
          <div>
            {/* <Label className="text-xs font-medium text-gray-700 mb-2 block">
              Поиск медицинской организации
            </Label> */}
=======
      className={`bg-white/95 rounded-lg border border-gray-200 backdrop-blur-sm shadow-xl flex flex-col h-fit max-h-[calc(90vh-2px)]
 ${className}`}
    >
      {/* Заголовок - фиксированный */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2 border-b border-gray-100">
        <h2 className="text-md font-semibold text-gray-900">Фильтры</h2>
      </div>

      {/* Скроллируемый контент */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 px-4 py-4">
          {/* Поиск по названию МО */}
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-2 block">
              Поиск медицинской организации
            </Label>
>>>>>>> gitlab/main
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

<<<<<<< HEAD
          <div>
=======
          {/* Выбор района */}
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-2 block">
              Район
            </Label>
>>>>>>> gitlab/main
            <Select
              value={filters.district}
              onValueChange={(value) => updateFilters({ district: value })}
            >
<<<<<<< HEAD
              <SelectTrigger className="w-full h-10 text-xs border-gray-200 cursor-pointer">
=======
              <SelectTrigger className="w-full h-10 text-xs border-gray-300 focus:border-blue-500 focus:ring-blue-500">
>>>>>>> gitlab/main
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

<<<<<<< HEAD
          {activeTab === "load" && (
            <>
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection("facilityTypes")}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <span className="text-xs text-gray-900">Типы МО</span>
                {expandedSections.facilityTypes ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>
              {expandedSections.facilityTypes && (
                <div className="px-3 pb-3 space-y-2 border-t border-gray-100 max-h-40 overflow-y-auto">
                  <div className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id="facility-type-all"
                      checked={filters.facilityTypes.length === 0}
                      onCheckedChange={() => handleToggleOption("facilityTypes", null, facilityTypeOptions)}
                      className="border-gray-300 data-[state=checked]:bg-blue-600"
                    />
                    <Label htmlFor="facility-type-all" className="text-xs font-normal cursor-pointer text-gray-700">
                      Все типы МО
                    </Label>
                  </div>
                  {facilityTypeOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`facility-type-${option.id}`}
                        checked={filters.facilityTypes.includes(option.id)}
                        onCheckedChange={() => handleToggleOption("facilityTypes", option.id, facilityTypeOptions)}
                        className="border-gray-300 data-[state=checked]:bg-blue-600"
                      />
                      <Label htmlFor={`facility-type-${option.id}`} className="text-xs font-normal cursor-pointer text-gray-700">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection("ownTypes")}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <span className="text-xs text-gray-900">По принадлежности</span>
                {expandedSections.ownTypes ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>

              {expandedSections.ownTypes && (
                <div className="px-3 pb-3 space-y-2 border-t border-gray-100 max-h-40 overflow-y-auto">
                  <div className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id="own-type-all"
                      checked={filters.ownTypes.length === 0}
                      onCheckedChange={() => handleToggleOption("ownTypes", null, OWN_TYPE_OPTIONS)}
                      className="border-gray-300 data-[state=checked]:bg-blue-600"
                    />
                    <Label htmlFor="own-type-all" className="text-xs font-normal cursor-pointer text-gray-700">
                      Все принадлежности
                    </Label>
                  </div>

                  {OWN_TYPE_OPTIONS.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`own-type-${option.id}`}
                        checked={filters.ownTypes.includes(option.id)}
                        onCheckedChange={() => handleToggleOption("ownTypes", option.id, OWN_TYPE_OPTIONS)}
                        className="border-gray-300 data-[state=checked]:bg-blue-600"
                      />
                      <Label htmlFor={`own-type-${option.id}`} className="text-xs font-normal cursor-pointer text-gray-700">
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
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <span className="text-xs text-gray-900">По загруженности</span>
                {expandedSections.loadLevels ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>

              {expandedSections.loadLevels && (
                <div className="px-3 pb-3 space-y-2 border-t border-gray-100">
                  <div className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id="load-level-all"
                      checked={filters.loadLevels.length === 0}
                      onCheckedChange={() => handleToggleOption("loadLevels", null, loadLevelOptions)}
                      className="border-gray-300 data-[state=checked]:bg-blue-600"
                    />
                    <Label htmlFor="load-level-all" className="text-xs font-normal cursor-pointer text-gray-700">
                      Все уровни
                    </Label>
                  </div>

                  {loadLevelOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`load-level-${option.id}`}
                        checked={filters.loadLevels.includes(option.id)}
                        onCheckedChange={() => handleToggleOption("loadLevels", option.id, loadLevelOptions)}
                        className="border-gray-300 data-[state=checked]:bg-blue-600"
                      />
                      <Label
                        htmlFor={`load-level-${option.id}`}
                        className="text-[11px] font-medium cursor-pointer text-gray-700 group-hover:text-blue-600 transition-colors"
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
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Тех. состояние
                </h3>
                <div className="bg-blue-50/50 p-2 rounded-lg space-y-1">
                  
                  {/* Опция ВСЕ */}
                  <div className="flex items-center justify-between group py-1 border-b border-blue-100/50">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tech-condition-all"
                        checked={filters.selectedTechConditions.length === 0}
                        onCheckedChange={() => 
                          handleToggleOption("selectedTechConditions", null, TECH_CONDITIONS)
                        }
                        className="border-gray-300 data-[state=checked]:bg-blue-600"
                      />
                      <Label
                        htmlFor="tech-condition-all"
                        className="text-[11px] cursor-pointer text-gray-700"
                      >
                        Все состояния
                      </Label>
                    </div>
                  </div>

                  {TECH_CONDITIONS.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-0.5">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`tech-${item.id}`}
                          checked={filters.selectedTechConditions.includes(item.id)}
                          onCheckedChange={() =>
                            handleToggleOption("selectedTechConditions", item.id, TECH_CONDITIONS)
                          }
                          className="border-gray-300 data-[state=checked]:bg-blue-600"
                        />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <Label
                          htmlFor={`tech-${item.id}`}
                          className="text-[11px] leading-none cursor-pointer text-gray-700"
                        >
                          {item.label}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 border-t pt-2">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Сейсмика
                </h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="seismic-grid"
                    checked={filters.showSeismicGrid}
                    onCheckedChange={(val) => updateFilters({ showSeismicGrid: !!val })}
                    className="border-gray-300 data-[state=checked]:bg-blue-600"
                  />
                  <Label htmlFor="seismic-grid" className="text-xs cursor-pointer text-gray-700">
                    Сейсмическая сетка
                  </Label>
                </div>
              </div>
            </>
          )}

          {activeTab === "geo" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Доступность 15 мин</h3>
                <div className="flex p-1 bg-gray-100 rounded-lg gap-1">
                  <button
                    onClick={() => updateFilters({ geoAccessMode: "current" })}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                      filters.geoAccessMode === "current" ? "bg-white shadow-sm text-blue-600" : "text-gray-500"
                    }`}
                  >
                    Текущие МО
                  </button>
                  <button
                    onClick={() => updateFilters({ geoAccessMode: "planned" })}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                      filters.geoAccessMode === "planned" ? "bg-white shadow-sm text-green-600" : "text-gray-500"
                    }`}
                  >
                    С планируемыми
                  </button>
                </div>
                <p className="text-[9px] text-gray-400 italic">Пересчёт шаговой доступности по сетке города</p>
              </div>

              <div className="space-y-2 border-t pt-3">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Дополнительные слои</h3>
                <div className="space-y-2">
                  {[
                    { id: "zones", label: "🏥 Зоны генплана (больницы)" },
                    { id: "grid", label: "🎯 Сетка доступности (15 мин)" },
                    { id: "refusals", label: "⚕ Отказы в госпитализации" },
                    { id: "profiles", label: "📊 Дефицит профилей" },
                    { id: "orgTypeGrid", label: "🗺 Грид по типу МО" },
                  ].map((layer) => (
                    <div key={layer.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={layer.id}
                        checked={filters.activeGeoLayers.includes(layer.id)}
                        onCheckedChange={(checked) => {
                          const next = checked
                            ? [...filters.activeGeoLayers, layer.id]
                            : filters.activeGeoLayers.filter((id) => id !== layer.id);
                          updateFilters({ activeGeoLayers: next });
                        }}
                      />
                      <Label htmlFor={layer.id} className="text-xs cursor-pointer text-gray-700">
                        {layer.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
=======
          {/* Типы медицинской организации */}
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

          {/* Профиль коек */}
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

          {/* Уровень загруженности */}
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
>>>>>>> gitlab/main

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

<<<<<<< HEAD
            {/* Загруженность */}
=======
            {/* Средняя загруженность */}
>>>>>>> gitlab/main
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

<<<<<<< HEAD
            {/* Поступило */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-50 border border-indigo-100">
              <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-500">
                <Users className="h-3 w-3 text-white" /> {/* Используем иконку Users */}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] text-indigo-600 font-medium">
                  Поступило
                </div>
                <div className="text-xs font-bold text-indigo-700">
                  {summaryData.totalAdmitted.toLocaleString("ru-RU")}
=======
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
>>>>>>> gitlab/main
                </div>
              </div>
            </div>
          </div>
<<<<<<< HEAD

          {activeTab === "load" && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <button
                onClick={onShowDistrictSummary}
                className="w-full py-2.5 px-4 text-[11px] font-bold text-[#1565C0] bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              >
                📋 Сводка по районам
              </button>
              <button
                onClick={onShowNonresidents}
                className="w-full py-2.5 px-4 text-[11px] font-bold text-white bg-[#1565C0] rounded-lg hover:bg-[#0D47A1] transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              >
                🚑 Иногородние пациенты
              </button>
            </div>
          )}

          {activeTab === "buildings" && (
            <button
              onClick={onShowBuildingAnalysis}
              className="w-full py-2.5 px-4 text-[11px] font-bold text-white bg-[#37474F] rounded-lg hover:bg-slate-700 transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
            >
              🏢 Анализ зданий
            </button>
          )}
=======
>>>>>>> gitlab/main
        </div>
      </div>
    </div>
  );
}
