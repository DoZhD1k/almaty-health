"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  FacilityStatistic,
  InfrastructureFilterState,
  EngineeringNode,
  SocialObject,
  BuildingCategory,
} from "@/types/healthcare";

interface InfrastructureFilterPanelProps {
  onFiltersChange: (filters: InfrastructureFilterState) => void;
  facilities: FacilityStatistic[];
  className?: string;
}

const engineeringNodeOptions: EngineeringNode[] = [
  { id: "sewerage", label: "Канализация" },
  { id: "ict", label: "ИКТ инфраструктура города" },
  { id: "electricity", label: "Электроснабжение" },
  { id: "heating", label: "Теплоснабжение" },
  { id: "gas", label: "Газоснабжение" },
];

const socialObjectOptions: SocialObject[] = [
  { id: "schools", label: "Школы" },
  { id: "kindergartens", label: "Детские сады" },
  { id: "hospitals", label: "Больницы" },
  { id: "lppn", label: "ЛППН" },
];

const buildingCategoryOptions: BuildingCategory[] = [
  {
    id: "category_1",
    label: "Здания выше 9 этажей между пр. Абая и пр. Аль-Фараби",
  },
  { id: "category_2", label: "Здания прошедшие паспортизацию" },
  { id: "category_3", label: "Аварийные здания" },
  { id: "category_4", label: "Сейсмостойкие здания" },
];

export function InfrastructureFilterPanel({
  onFiltersChange,
  facilities,
  className = "",
}: InfrastructureFilterPanelProps) {
  const [filters, setFilters] = useState<InfrastructureFilterState>({
    district: "Все районы",
    engineeringNodes: [],
    socialObjects: [],
    buildingCategories: [],
  });

  const [expandedSections, setExpandedSections] = useState({
    engineeringNodes: true,
    socialObjects: true,
    buildingCategories: true,
  });

  // Извлекаем уникальные районы из данных
  const districts = [
    "Все районы",
    ...new Set(facilities.map((f) => f.district).filter(Boolean)),
  ];

  const updateFilters = (newFilters: Partial<InfrastructureFilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const handleCheckboxChange = (
    category: keyof Pick<
      InfrastructureFilterState,
      "engineeringNodes" | "socialObjects" | "buildingCategories"
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

  // Подсчет количества несовместимых зданий и объектов паспортизации
  const incompatibleBuildings = 1088;
  const passportObjects = 21539;

  return (
    <div
      className={`bg-white/95 rounded-lg border border-gray-200 backdrop-blur-sm shadow-xl flex flex-col h-fit max-h-[calc(100vh-32px)] ${className}`}
    >
      {/* Заголовок - фиксированный */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Фильтры</h2>
      </div>

      {/* Скроллируемый контент */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 px-4 py-4">
          {/* Выбор района */}
          <div>
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

          {/* Инженерные узлы */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection("engineeringNodes")}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900">
                Инженерные узлы:
              </span>
              {expandedSections.engineeringNodes ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>
            {expandedSections.engineeringNodes && (
              <div className="px-3 pb-3 space-y-2 border-t border-gray-100">
                {engineeringNodeOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`engineering-${option.id}`}
                      checked={filters.engineeringNodes.includes(option.id)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(
                          "engineeringNodes",
                          option.id,
                          checked as boolean
                        )
                      }
                      className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <Label
                      htmlFor={`engineering-${option.id}`}
                      className="text-sm font-normal cursor-pointer text-gray-700"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Социальные объекты */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection("socialObjects")}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900">
                Социальные объекты:
              </span>
              {expandedSections.socialObjects ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>
            {expandedSections.socialObjects && (
              <div className="px-3 pb-3 space-y-2 border-t border-gray-100">
                {socialObjectOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`social-${option.id}`}
                      checked={filters.socialObjects.includes(option.id)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(
                          "socialObjects",
                          option.id,
                          checked as boolean
                        )
                      }
                      className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <Label
                      htmlFor={`social-${option.id}`}
                      className="text-sm font-normal cursor-pointer text-gray-700"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Категория зданий */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection("buildingCategories")}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900">
                Категория зданий:
              </span>
              {expandedSections.buildingCategories ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>
            {expandedSections.buildingCategories && (
              <div className="px-3 pb-3 space-y-2 border-t border-gray-100">
                {buildingCategoryOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`building-${option.id}`}
                      checked={filters.buildingCategories.includes(option.id)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(
                          "buildingCategories",
                          option.id,
                          checked as boolean
                        )
                      }
                      className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <Label
                      htmlFor={`building-${option.id}`}
                      className="text-sm font-normal cursor-pointer text-gray-700 leading-tight"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Население */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Население:</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Высокий</div>
                <div className="font-medium">57 020 - 2.49%</div>
              </div>
              <div>
                <div className="text-gray-600">Средний</div>
                <div className="font-medium">454 666 - 77.68%</div>
              </div>
              <div>
                <div className="text-gray-600">Низкий</div>
                <div className="font-medium">130 159 - 19.83%</div>
              </div>
            </div>
          </div>

          {/* Статистика */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {incompatibleBuildings.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">Несовместимых зданий</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {passportObjects.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">Объекты паспортизации</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
