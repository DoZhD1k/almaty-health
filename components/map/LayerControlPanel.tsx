import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { GeoJSONLayer } from "@/lib/utils/geojson";

interface LayerControlPanelProps {
  layers: GeoJSONLayer[];
  onLayerToggle: (layerId: string, visible?: boolean) => void;
  showApiFacilities?: boolean;
  onApiFacilitiesToggle?: () => void;
}

const layerIcons: Record<string, string> = {
  districts: "🏛️",
  green_10min: "🌳",
  accessibility_15min: "🚶",
  accessibility_30min: "🚗",
  medical_facilities: "🏥",
  population_grid: "👥",
};

export function LayerControlPanel({
  layers,
  onLayerToggle,
  showApiFacilities = true,
  onApiFacilitiesToggle,
}: LayerControlPanelProps) {
  return (
    <Card className="w-56 bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">🗂️ Слои</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 p-3">
        {/* API Медучреждения */}
        <div className="flex items-center space-x-2">
          <Switch
            id="api-facilities"
            checked={showApiFacilities}
            onCheckedChange={onApiFacilitiesToggle}
            className="data-[state=checked]:bg-blue-600"
          />
          <Label
            htmlFor="api-facilities"
            className="text-xs cursor-pointer flex items-center gap-1"
          >
            🏥 Медучреждения (API)
          </Label>
        </div>

        {/* GeoJSON слои */}
        {layers.map((layer) => (
          <div key={layer.id} className="flex items-center space-x-2">
            <Switch
              id={`layer-${layer.id}`}
              checked={layer.visible}
              onCheckedChange={(checked) => onLayerToggle(layer.id, checked)}
              className="data-[state=checked]:bg-blue-600"
            />
            <Label
              htmlFor={`layer-${layer.id}`}
              className="text-xs cursor-pointer flex items-center gap-1"
            >
              <span>{layerIcons[layer.id] || "📍"}</span>
              <span>{layer.name}</span>
            </Label>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
