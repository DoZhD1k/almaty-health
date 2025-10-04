"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { useMapInitialization } from "@/hooks/use-map-initialization";
import { GEOJSON_LAYERS, loadGeoJSON, GeoJSONLayer } from "@/lib/utils/geojson";
import { LayerControlPanel } from "./LayerControlPanel";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface SmpVtmpMapLibreProps {
  className?: string;
}

interface DistrictFeature {
  type: "Feature";
  properties: {
    name: string;
    [key: string]: any;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
}

export function SmpVtmpMapLibre({ className = "" }: SmpVtmpMapLibreProps) {
  console.log("SmpVtmpMapLibre: Component rendered");
  const containerRef = useRef<HTMLDivElement>(null);
  console.log("SmpVtmpMapLibre: containerRef.current:", !!containerRef.current);

  const { mapRef, isLoading, zoomIn, zoomOut, resetView } =
    useMapInitialization(containerRef);

  console.log(
    "SmpVtmpMapLibre: After useMapInitialization - mapRef:",
    !!mapRef.current,
    "isLoading:",
    isLoading
  );
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [districts, setDistricts] = useState<DistrictFeature[]>([]);
  const [layers, setLayers] = useState<GeoJSONLayer[]>(GEOJSON_LAYERS);
  const [mapReady, setMapReady] = useState(false);

  // Отслеживаем изменения containerRef
  useEffect(() => {
    console.log(
      "SmpVtmpMapLibre: containerRef effect - current:",
      !!containerRef.current
    );
  }, [containerRef.current]);

  // Слушаем событие загрузки карты и синхронизируем состояния
  useEffect(() => {
    console.log(
      "SmpVtmpMapLibre: Map sync effect triggered, isLoading:",
      isLoading,
      "mapRef:",
      !!mapRef.current,
      "mapReady:",
      mapReady
    );

    // Если карта загрузилась (isLoading стал false), но mapReady еще false
    if (!isLoading && mapRef.current && !mapReady) {
      console.log("SmpVtmpMapLibre: Map is loaded, setting mapReady to true");
      setMapReady(true);
    }
  }, [isLoading, mapRef.current, mapReady]);

  // Загружаем районы из GeoJSON файлов вместо API
  useEffect(() => {
    console.log(
      "SmpVtmpMapLibre: Districts loading effect triggered, mapReady:",
      mapReady
    );
    if (!mapReady) return;

    const loadDistrictsFromGeoJSON = async () => {
      try {
        console.log("SmpVtmpMapLibre: Loading districts from GeoJSON...");
        const response = await fetch("/geo-files/districts.geojson");
        console.log(
          "SmpVtmpMapLibre: Fetch response status:",
          response.status,
          response.ok
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(
          "SmpVtmpMapLibre: GeoJSON data loaded:",
          data?.features?.length,
          "features"
        );

        if (data.features) {
          setDistricts(data.features);
          console.log(
            "SmpVtmpMapLibre: Districts set in state:",
            data.features.length
          );
        }
      } catch (error) {
        console.error("SmpVtmpMapLibre: Error loading districts:", error);
      }
    };

    loadDistrictsFromGeoJSON();
  }, [mapReady]);

  // Добавляем районы на карту
  useEffect(() => {
    console.log("SmpVtmpMapLibre: Districts layer effect triggered");
    console.log(
      "SmpVtmpMapLibre: Map ready:",
      !!mapRef.current,
      "mapReady:",
      mapReady,
      "districts:",
      districts.length
    );

    if (
      !mapRef.current ||
      !mapReady ||
      districts.length === 0 ||
      !mapRef.current.isStyleLoaded()
    ) {
      console.log("SmpVtmpMapLibre: Not ready to add districts layer");
      return;
    }

    const map = mapRef.current;
    console.log("SmpVtmpMapLibre: Map style loaded:", map.isStyleLoaded());

    try {
      console.log("SmpVtmpMapLibre: Starting to add districts layers");

      // Безопасно удаляем существующие слои и источники
      try {
        if (map.getLayer("districts-fill")) {
          console.log(
            "SmpVtmpMapLibre: Removing existing districts-fill layer"
          );
          map.removeLayer("districts-fill");
        }
        if (map.getLayer("districts-stroke")) {
          console.log(
            "SmpVtmpMapLibre: Removing existing districts-stroke layer"
          );
          map.removeLayer("districts-stroke");
        }
        if (map.getSource("districts")) {
          console.log("SmpVtmpMapLibre: Removing existing districts source");
          map.removeSource("districts");
        }
      } catch (removeError) {
        console.warn(
          "SmpVtmpMapLibre: Error removing existing districts layers:",
          removeError
        );
      }

      // Добавляем источник данных
      console.log(
        "SmpVtmpMapLibre: Adding districts source with",
        districts.length,
        "features"
      );
      map.addSource("districts", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: districts as any,
        },
      });
      console.log("SmpVtmpMapLibre: Districts source added successfully");

      // Добавляем слой заливки
      console.log("SmpVtmpMapLibre: Adding districts fill layer");
      map.addLayer({
        id: "districts-fill",
        type: "fill",
        source: "districts",
        paint: {
          "fill-color": "#627BC1",
          "fill-opacity": 0.1,
        },
      });
      console.log("SmpVtmpMapLibre: Districts fill layer added successfully");

      // Добавляем слой границ
      console.log("SmpVtmpMapLibre: Adding districts stroke layer");
      map.addLayer({
        id: "districts-stroke",
        type: "line",
        source: "districts",
        paint: {
          "line-color": "#627BC1",
          "line-width": 2,
        },
      });
      console.log("SmpVtmpMapLibre: Districts stroke layer added successfully");

      console.log(
        "SmpVtmpMapLibre: All districts layers added to map successfully"
      );
    } catch (error) {
      console.error("SmpVtmpMapLibre: Error adding districts to map:", error);
    }
  }, [mapRef, mapReady, districts]);

  // Загружаем и отображаем GeoJSON слои
  useEffect(() => {
    if (!mapRef.current || !mapReady || !mapRef.current.isStyleLoaded()) return;

    const map = mapRef.current;

    const loadLayers = async () => {
      for (const layer of layers) {
        if (!layer.visible) continue;

        try {
          // Дополнительная проверка перед загрузкой слоя
          if (!map.isStyleLoaded()) {
            console.warn(
              `Map style not loaded when trying to add layer ${layer.name}`
            );
            return;
          }

          const data = await loadGeoJSON(layer.url);
          if (!data) {
            console.warn(`No data loaded for layer ${layer.name}`);
            continue;
          }

          const sourceId = `layer-${layer.id}`;
          const layerId = `layer-${layer.id}-layer`;

          // Безопасно удаляем существующие слои
          try {
            if (map.getLayer(layerId)) map.removeLayer(layerId);
            if (map.getLayer(`${layerId}-stroke`))
              map.removeLayer(`${layerId}-stroke`);
            if (map.getSource(sourceId)) map.removeSource(sourceId);
          } catch (removeError) {
            console.warn(
              `Error removing existing layer ${layer.name}:`,
              removeError
            );
          }

          // Добавляем источник
          map.addSource(sourceId, {
            type: "geojson",
            data,
          });

          // Определяем тип геометрии и добавляем соответствующий слой
          const firstFeature = data.features?.[0];
          if (firstFeature?.geometry.type === "Point") {
            map.addLayer({
              id: layerId,
              type: "circle",
              source: sourceId,
              paint: {
                "circle-radius": 6,
                "circle-color": layer.color,
                "circle-opacity": 0.8,
                "circle-stroke-color": "#ffffff",
                "circle-stroke-width": 2,
              },
            });
          } else if (
            firstFeature?.geometry.type === "Polygon" ||
            firstFeature?.geometry.type === "MultiPolygon"
          ) {
            map.addLayer({
              id: layerId,
              type: "fill",
              source: sourceId,
              paint: {
                "fill-color": layer.color,
                "fill-opacity": 0.3,
              },
            });

            map.addLayer({
              id: `${layerId}-stroke`,
              type: "line",
              source: sourceId,
              paint: {
                "line-color": layer.color,
                "line-width": 2,
              },
            });
          }

          console.log(`Layer ${layer.name} added to map successfully`);
        } catch (error) {
          console.error(`Error loading layer ${layer.name}:`, error);
        }
      }
    };

    loadLayers();
  }, [mapRef, mapReady, layers]);

  const toggleLayer = (layerId: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };

  console.log(
    "SmpVtmpMapLibre: Render decision - isLoading:",
    isLoading,
    "mapReady:",
    mapReady
  );

  return (
    <div className={`relative ${className}`}>
      <div ref={containerRef} className="h-96 w-full rounded-lg" />

      {/* Loading overlay - показываем поверх карты */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка карты...</p>
            <p className="mt-2 text-xs text-gray-500">
              isLoading: {isLoading ? "true" : "false"}
            </p>
            <p className="text-xs text-gray-500">
              mapRef: {mapRef.current ? "exists" : "null"}
            </p>
            <p className="text-xs text-gray-500">
              mapReady: {mapReady ? "true" : "false"}
            </p>
          </div>
        </div>
      )}

      {/* Debug info panel */}
      <div className="absolute bottom-4 right-4 bg-white p-2 rounded shadow text-xs z-20 max-w-xs">
        <h4 className="font-bold mb-1 text-xs">Debug</h4>
        <div className="space-y-0.5 text-xs">
          <div>isLoading (hook): {isLoading ? "❌ Yes" : "✅ No"}</div>
          <div>Map Ready: {mapReady ? "✅ Yes" : "❌ No"}</div>
          <div>Map Loaded: {mapRef.current?.loaded() ? "✅ Yes" : "❌ No"}</div>
          <div>
            Style Loaded: {mapRef.current?.isStyleLoaded() ? "✅ Yes" : "❌ No"}
          </div>
          <div>Districts: {districts.length}</div>
          <div>Markers: {markersRef.current?.length || 0}</div>
          <div>
            Has Districts Source:{" "}
            {mapRef.current?.getSource("districts") ? "✅ Yes" : "❌ No"}
          </div>
          <div>
            Has Fill Layer:{" "}
            {mapRef.current?.getLayer("districts-fill") ? "✅ Yes" : "❌ No"}
          </div>
          <div>
            Has Stroke Layer:{" "}
            {mapRef.current?.getLayer("districts-stroke") ? "✅ Yes" : "❌ No"}
          </div>
        </div>
      </div>

      {/* Контролы масштаба */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
        <Button variant="outline" size="sm" onClick={zoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={zoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={resetView}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Панель управления слоями */}
      <div className="absolute top-20 left-4 z-10">
        <LayerControlPanel layers={layers} onLayerToggle={toggleLayer} />
      </div>
    </div>
  );
}
