import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GeoJSONLayer } from "@/lib/utils/geojson";

interface LayerControlPanelProps {
  layers: GeoJSONLayer[];
  onLayerToggle: (layerId: string, visible: boolean) => void;
  showApiFacilities?: boolean;
  onApiFacilitiesToggle?: (show: boolean) => void;
}

const layerIcons: Record<string, string> = {
  districts: "🏛️",
  green_10min: "🌳",
  accessibility_15min: "🚶",
  accessibility_30min: "🚗",
  medical_facilities: "🏥",
  population_grid: "👥",
};

const layerDescriptions: Record<string, string> = {
  districts: "Административное деление города",
  green_10min: "Парки и зеленые зоны в 10-минутной доступности",
  accessibility_15min: "Зоны 15-минутной доступности",
  accessibility_30min: "Зоны 30-минутной доступности",
  medical_facilities: "Больницы и медицинские центры",
  population_grid: "Плотность населения по районам",
};

export function LayerControlPanel({
  layers,
  onLayerToggle,
  showApiFacilities = true,
  onApiFacilitiesToggle,
}: LayerControlPanelProps) {
  // Группируем слои по категориям для лучшей организации
  const infrastructureLayers = layers.filter((layer) =>
    ["districts", "population_grid"].includes(layer.id)
  );

  const accessibilityLayers = layers.filter((layer) =>
    ["green_10min", "accessibility_15min", "accessibility_30min"].includes(
      layer.id
    )
  );

  const medicalLayers = layers.filter(
    (layer) => layer.id === "medical_facilities"
  );

  const renderLayerGroup = (
    title: string,
    groupLayers: GeoJSONLayer[],
    description?: string
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          {title}
          <Badge variant="outline" className="text-xs">
            {groupLayers.filter((l) => l.visible).length}/{groupLayers.length}
          </Badge>
        </h4>
      </div>
      <div className="space-y-1">
        {groupLayers.map((layer) => (
          <div
            key={layer.id}
            className="flex items-center space-x-2 p-1 rounded hover:bg-gray-50"
          >
            <Switch
              id={`layer-${layer.id}`}
              checked={layer.visible}
              onCheckedChange={(checked) => onLayerToggle(layer.id, checked)}
              className="data-[state=checked]:bg-blue-600"
            />
            <Label
              htmlFor={`layer-${layer.id}`}
              className="text-sm cursor-pointer flex items-center gap-2"
            >
              <span>{layerIcons[layer.id] || "📍"}</span>
              <span>{layer.name}</span>
            </Label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="w-80">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          🗂️ Слои карты
        </CardTitle>
        <p className="text-sm text-gray-600">
          Управление отображением данных на карте
        </p>
      </CardHeader>

      <CardContent className="space-y-3 p-4">
        {/* Медицинские учреждения */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              Здравоохранение
              <Badge variant="outline" className="text-xs">
                {(showApiFacilities ? 1 : 0) +
                  medicalLayers.filter((l) => l.visible).length}
                /{1 + medicalLayers.length}
              </Badge>
            </h4>
          </div>
          <div className="space-y-1">
            {/* Контроль для данных из API */}
            {onApiFacilitiesToggle && (
              <div className="flex items-center space-x-2 p-1 rounded hover:bg-gray-50">
                <Switch
                  id="api-facilities"
                  checked={showApiFacilities}
                  onCheckedChange={onApiFacilitiesToggle}
                  className="data-[state=checked]:bg-blue-600"
                />
                <Label
                  htmlFor="api-facilities"
                  className="text-sm cursor-pointer flex items-center gap-2"
                >
                  <span>🏥</span>
                  <span>Основные данные</span>
                </Label>
              </div>
            )}

            {/* GeoJSON слои медучреждений */}
            {medicalLayers.map((layer) => (
              <div
                key={layer.id}
                className="flex items-center space-x-2 p-1 rounded hover:bg-gray-50"
              >
                <Switch
                  id={`layer-${layer.id}`}
                  checked={layer.visible}
                  onCheckedChange={(checked) =>
                    onLayerToggle(layer.id, checked)
                  }
                  className="data-[state=checked]:bg-blue-600"
                />
                <Label
                  htmlFor={`layer-${layer.id}`}
                  className="text-sm cursor-pointer flex items-center gap-2"
                >
                  <span>{layerIcons[layer.id] || "📍"}</span>
                  <span>Доп. учреждения</span>
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Инфраструктура */}
        {renderLayerGroup("Инфраструктура", infrastructureLayers)}

        <Separator />

        {/* Доступность */}
        {renderLayerGroup("Доступность", accessibilityLayers)}
      </CardContent>
    </Card>
  );
}
