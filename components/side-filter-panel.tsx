"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, X } from "lucide-react";
import { FacilityStatistic } from "@/types/healthcare";

interface FilterState {
  search: string;
  district: string;
  facilityType: string;
  profile: string;
  loadStatus: string[];
  bedRange: [number, number];
}

interface SideFilterPanelProps {
  onFiltersChange: (filters: FilterState) => void;
  facilities: FacilityStatistic[];
  className?: string;
}

const loadStatuses = [
  { id: "low", label: "Низкая (< 40%)", color: "bg-gray-500" },
  { id: "normal", label: "Нормальная (40-70%)", color: "bg-green-500" },
  { id: "high", label: "Высокая (70-90%)", color: "bg-orange-500" },
  { id: "critical", label: "Критическая (> 90%)", color: "bg-red-500" },
];

export function SideFilterPanel({
  onFiltersChange,
  facilities,
  className,
}: SideFilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    district: "Все районы",
    facilityType: "Все типы",
    profile: "Все профили",
    loadStatus: [],
    bedRange: [0, 1000],
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Извлекаем уникальные значения из данных
  const districts = [
    "Все районы",
    ...new Set(facilities.map((f) => f.district).filter(Boolean)),
  ];
  const facilityTypes = [
    "Все типы",
    ...new Set(facilities.map((f) => f.facility_type).filter(Boolean)),
  ];
  const profiles = [
    "Все профили",
    ...new Set(facilities.map((f) => f.bed_profile).filter(Boolean)),
  ];

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);

    // Count active filters
    let count = 0;
    if (updated.search) count++;
    if (updated.district !== "Все районы") count++;
    if (updated.facilityType !== "Все типы") count++;
    if (updated.profile !== "Все профили") count++;
    if (updated.loadStatus.length > 0) count++;
    if (updated.bedRange[0] > 0 || updated.bedRange[1] < 1000) count++;

    setActiveFiltersCount(count);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      district: "Все районы",
      facilityType: "Все типы",
      profile: "Все профили",
      loadStatus: [],
      bedRange: [0, 1000] as [number, number],
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    setActiveFiltersCount(0);
  };

  const handleLoadStatusChange = (statusId: string, checked: boolean) => {
    const newLoadStatus = checked
      ? [...filters.loadStatus, statusId]
      : filters.loadStatus.filter((id) => id !== statusId);
    updateFilters({ loadStatus: newLoadStatus });
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-white/20">
              <Filter className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Фильтры
              </h2>
              {activeFiltersCount > 0 && (
                <span className="text-xs text-white/70">
                  {activeFiltersCount} активных
                </span>
              )}
            </div>
          </div>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-1.5 text-white/80 hover:text-white hover:bg-white/20 h-8"
            >
              <X className="h-3.5 w-3.5" />
              Сбросить
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <Label htmlFor="search" className="text-sm font-medium text-white mb-3 block">
            Поиск по названию
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
            <Input
              id="search"
              placeholder="Введите название МО..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:border-white focus:ring-white/50"
            />
          </div>
        </div>

        {/* District Filter */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <Label className="text-sm font-medium text-white mb-3 block">Район</Label>
          <Select
            value={filters.district}
            onValueChange={(value) => updateFilters({ district: value })}
          >
            <SelectTrigger className="bg-white/20 border-white/30 text-white focus:border-white focus:ring-white/50">
              <SelectValue />
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

        {/* Facility Type Filter */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <Label className="text-sm font-medium text-white mb-3 block">
            Тип медицинской организации
          </Label>
          <Select
            value={filters.facilityType}
            onValueChange={(value) => updateFilters({ facilityType: value })}
          >
            <SelectTrigger className="bg-white/20 border-white/30 text-white focus:border-white focus:ring-white/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {facilityTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Profile Filter */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <Label className="text-sm font-medium text-white mb-3 block">
            Профиль коек
          </Label>
          <Select
            value={filters.profile}
            onValueChange={(value) => updateFilters({ profile: value })}
          >
            <SelectTrigger className="bg-white/20 border-white/30 text-white focus:border-white focus:ring-white/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((profile) => (
                <SelectItem key={profile} value={profile}>
                  {profile}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Load Status Filter */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <Label className="text-sm font-medium text-white mb-3 block">
            Уровень загруженности
          </Label>
          <div className="space-y-2.5">
            {loadStatuses.map((status) => (
              <div key={status.id} className="flex items-center space-x-2.5">
                <Checkbox
                  id={status.id}
                  checked={filters.loadStatus.includes(status.id)}
                  onCheckedChange={(checked) =>
                    handleLoadStatusChange(status.id, checked as boolean)
                  }
                  className="border-white/40 data-[state=checked]:bg-white data-[state=checked]:border-white data-[state=checked]:text-[#4169E1]"
                />
                <div className="flex items-center gap-2 flex-1">
                  <div className={`w-3 h-3 rounded-full ${status.color}`} />
                  <Label
                    htmlFor={status.id}
                    className="text-sm font-normal cursor-pointer text-white"
                  >
                    {status.label}
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bed Range Filter */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <Label className="text-sm font-medium text-white mb-3 block">
            Количество коек
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="bedMin" className="text-xs text-white/70">
                От
              </Label>
              <Input
                id="bedMin"
                type="number"
                min="0"
                max="1000"
                value={filters.bedRange[0]}
                onChange={(e) =>
                  updateFilters({
                    bedRange: [
                      Number.parseInt(e.target.value) || 0,
                      filters.bedRange[1],
                    ],
                  })
                }
                className="bg-white/20 border-white/30 text-white focus:border-white focus:ring-white/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bedMax" className="text-xs text-white/70">
                До
              </Label>
              <Input
                id="bedMax"
                type="number"
                min="0"
                max="1000"
                value={filters.bedRange[1]}
                onChange={(e) =>
                  updateFilters({
                    bedRange: [
                      filters.bedRange[0],
                      Number.parseInt(e.target.value) || 1000,
                    ],
                  })
                }
                className="bg-white/20 border-white/30 text-white focus:border-white focus:ring-white/50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
