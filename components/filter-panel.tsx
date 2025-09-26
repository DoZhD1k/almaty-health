"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"

interface FilterState {
  search: string
  district: string
  facilityType: string
  profile: string
  loadStatus: string[]
  bedRange: [number, number]
}

interface FilterPanelProps {
  onFiltersChange: (filters: FilterState) => void
  className?: string
}

const districts = [
  "Все районы",
  "Алмалинский",
  "Ауэзовский",
  "Бостандыкский",
  "Медеуский",
  "Наурызбайский",
  "Турксибский",
]

const facilityTypes = ["Все типы", "Городская", "Республиканская", "Частная", "Ведомственная"]

const profiles = [
  "Все профили",
  "Многопрофильная",
  "Кардиология",
  "Онкология",
  "Педиатрия",
  "Травматология",
  "Реабилитация",
  "Неврология",
]

const loadStatuses = [
  { id: "low", label: "Низкая (< 60%)", color: "bg-gray-500" },
  { id: "optimal", label: "Оптимальная (60-80%)", color: "bg-green-500" },
  { id: "high", label: "Высокая (80-90%)", color: "bg-yellow-500" },
  { id: "critical", label: "Критическая (90-100%)", color: "bg-orange-500" },
  { id: "overload", label: "Перегруз (100-110%)", color: "bg-red-500" },
  { id: "extreme", label: "Критический (>110%)", color: "bg-red-800" },
]

export function FilterPanel({ onFiltersChange, className }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    district: "Все районы",
    facilityType: "Все типы",
    profile: "Все профили",
    loadStatus: [],
    bedRange: [0, 500],
  })

  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFiltersChange(updated)

    // Count active filters
    let count = 0
    if (updated.search) count++
    if (updated.district !== "Все районы") count++
    if (updated.facilityType !== "Все типы") count++
    if (updated.profile !== "Все профили") count++
    if (updated.loadStatus.length > 0) count++
    if (updated.bedRange[0] > 0 || updated.bedRange[1] < 500) count++

    setActiveFiltersCount(count)
  }

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      district: "Все районы",
      facilityType: "Все типы",
      profile: "Все профили",
      loadStatus: [],
      bedRange: [0, 500] as [number, number],
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
    setActiveFiltersCount(0)
  }

  const handleLoadStatusChange = (statusId: string, checked: boolean) => {
    const newLoadStatus = checked
      ? [...filters.loadStatus, statusId]
      : filters.loadStatus.filter((id) => id !== statusId)
    updateFilters({ loadStatus: newLoadStatus })
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Фильтры
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
              <X className="h-4 w-4" />
              Очистить
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Поиск по названию</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Введите название МО..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* District Filter */}
        <div className="space-y-2">
          <Label>Район</Label>
          <Select value={filters.district} onValueChange={(value) => updateFilters({ district: value })}>
            <SelectTrigger>
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
        <div className="space-y-2">
          <Label>Тип медицинской организации</Label>
          <Select value={filters.facilityType} onValueChange={(value) => updateFilters({ facilityType: value })}>
            <SelectTrigger>
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
        <div className="space-y-2">
          <Label>Профиль</Label>
          <Select value={filters.profile} onValueChange={(value) => updateFilters({ profile: value })}>
            <SelectTrigger>
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
        <div className="space-y-2">
          <Label>Уровень загруженности</Label>
          <div className="space-y-2">
            {loadStatuses.map((status) => (
              <div key={status.id} className="flex items-center space-x-2">
                <Checkbox
                  id={status.id}
                  checked={filters.loadStatus.includes(status.id)}
                  onCheckedChange={(checked) => handleLoadStatusChange(status.id, checked as boolean)}
                />
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${status.color}`} />
                  <Label htmlFor={status.id} className="text-sm font-normal cursor-pointer">
                    {status.label}
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bed Range Filter */}
        <div className="space-y-2">
          <Label>Количество коек</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="bedMin" className="text-xs text-muted-foreground">
                От
              </Label>
              <Input
                id="bedMin"
                type="number"
                min="0"
                max="500"
                value={filters.bedRange[0]}
                onChange={(e) =>
                  updateFilters({
                    bedRange: [Number.parseInt(e.target.value) || 0, filters.bedRange[1]],
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="bedMax" className="text-xs text-muted-foreground">
                До
              </Label>
              <Input
                id="bedMax"
                type="number"
                min="0"
                max="500"
                value={filters.bedRange[1]}
                onChange={(e) =>
                  updateFilters({
                    bedRange: [filters.bedRange[0], Number.parseInt(e.target.value) || 500],
                  })
                }
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
