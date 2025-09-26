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
    <Card className={`${className} mb-4`}>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию МО..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-10 h-9"
            />
          </div>

          {/* District Filter */}
          <Select
            value={filters.district}
            onValueChange={(value) => updateFilters({ district: value })}
          >
            <SelectTrigger className="w-40 h-9">
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

          {/* Facility Type Filter */}
          <Select
            value={filters.facilityType}
            onValueChange={(value) => updateFilters({ facilityType: value })}
          >
            <SelectTrigger className="w-44 h-9">
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

          {/* Load Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="h-4 w-4 mr-2" />
                Загруженность
                {filters.loadStatus.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {filters.loadStatus.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {loadStatuses.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status.id}
                  checked={filters.loadStatus.includes(status.id)}
                  onCheckedChange={(checked) =>
                    handleLoadStatusChange(status.id, checked)
                  }
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${status.color}`} />
                    {status.label}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Active Filters Badge */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <Filter className="h-3 w-3 mr-1" />
                Фильтров: {activeFiltersCount}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 px-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
