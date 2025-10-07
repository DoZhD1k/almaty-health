"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CompactFilterState {
  search: string;
  district: string;
  facilityType: string;
  loadStatus: string[];
}

interface CompactFilterPanelProps {
  onFiltersChange: (filters: CompactFilterState) => void;
  className?: string;
}

const districts = [
  "Все районы",
  "Алмалинский",
  "Ауэзовский",
  "Бостандыкский",
  "Медеуский",
  "Наурызбайский",
  "Турксибский",
];

const facilityTypes = [
  "Все типы",
  "Городская",
  "Республиканская",
  "Частная",
  "Ведомственная",
];

const loadStatuses = [
  { id: "low", label: "Низкая", color: "bg-gray-500" },
  { id: "normal", label: "Нормальная", color: "bg-green-500" },
  { id: "high", label: "Высокая", color: "bg-orange-500" },
  { id: "critical", label: "Критическая", color: "bg-red-500" },
];

export function CompactFilterPanel({
  onFiltersChange,
  className,
}: CompactFilterPanelProps) {
  const [filters, setFilters] = useState<CompactFilterState>({
    search: "",
    district: "Все районы",
    facilityType: "Все типы",
    loadStatus: [],
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const updateFilters = (newFilters: Partial<CompactFilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);

    // Count active filters
    let count = 0;
    if (updated.search) count++;
    if (updated.district !== "Все районы") count++;
    if (updated.facilityType !== "Все типы") count++;
    if (updated.loadStatus.length > 0) count++;

    setActiveFiltersCount(count);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      district: "Все районы",
      facilityType: "Все типы",
      loadStatus: [],
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
    <div
      className={`${className} mb-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6`}
    >
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative min-w-72">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Поиск по названию МО..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-12 h-12 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-200 rounded-xl text-sm"
          />
        </div>

        {/* District Filter */}
        <Select
          value={filters.district}
          onValueChange={(value) => updateFilters({ district: value })}
        >
          <SelectTrigger className="w-48 h-12 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-200 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-xl">
            {districts.map((district) => (
              <SelectItem
                key={district}
                value={district}
                className="hover:bg-blue-50 focus:bg-blue-50"
              >
                {district}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Facility Type Filter */}
        <Select
          value={filters.facilityType}
          onValueChange={(value) => updateFilters({ facilityType: value })}
        >
          <SelectTrigger className="w-52 h-12 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-200 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-xl">
            {facilityTypes.map((type) => (
              <SelectItem
                key={type}
                value={type}
                className="hover:bg-blue-50 focus:bg-blue-50"
              >
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Load Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-12 px-4 bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300 rounded-xl shadow-sm"
            >
              <Filter className="h-5 w-5 mr-2 text-gray-500" />
              <span className="font-medium">Загруженность</span>
              {filters.loadStatus.length > 0 && (
                <Badge className="ml-2 bg-blue-500 text-white px-2 py-1 text-xs">
                  {filters.loadStatus.length} выбрано
                </Badge>
              )}
              <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-xl rounded-xl p-2">
            {loadStatuses.map((status) => (
              <DropdownMenuCheckboxItem
                key={status.id}
                checked={filters.loadStatus.includes(status.id)}
                onCheckedChange={(checked) =>
                  handleLoadStatusChange(status.id, checked)
                }
                className="rounded-lg hover:bg-gray-50 py-3 px-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full ${status.color} shadow-sm`}
                  />
                  <span className="font-medium text-gray-700">
                    {status.label}
                  </span>
                </div>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Active Filters Badge */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-3 ml-auto">
            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-2 shadow-lg">
              <Filter className="h-4 w-4 mr-2" />
              Активных фильтров: {activeFiltersCount}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-10 w-10 p-0 hover:bg-red-50 hover:text-red-600 rounded-xl border border-gray-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
