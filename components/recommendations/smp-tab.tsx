// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import mapboxgl from "mapbox-gl";
// import { Button } from "@/components/ui/button";
// import { Switch } from "@/components/ui/switch";
// import { ZoomIn, ZoomOut, RotateCcw, Layers } from "lucide-react";
// import "mapbox-gl/dist/mapbox-gl.css";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { SmpVtmpMapbox } from "@/components/map/SmpVtmpMapbox";
// import {
//   FacilityStatistic,
//   HospitalizationStatistic,
// } from "@/types/healthcare";

// interface SmpVtmpTabProps {
//   filteredFacilities: FacilityStatistic[];
//   hospitalizations: HospitalizationStatistic[];
//   selectedDistricts: string[];
//   selectedFacilityTypes: string[];
//   selectedBedProfiles: string[];
//   searchQuery: string;
//   onShowRoute?: (source: FacilityStatistic, target: FacilityStatistic) => void;
// }

// const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes("example")) {
//   console.warn(
//     "⚠️ Mapbox token not configured. Please set NEXT_PUBLIC_MAPBOX_TOKEN in .env.local"
//   );
// }

// interface SmpTabProps {
//   className?: string;
// }

// interface MedicalFacility {
//   type: "Feature";
//   properties: {
//     medical_organization: string;
//     type: string;
//     type2: string;
//     Overload: string;
//     color: string;
//     Number_of_beds_actually_deployed_closed?: string;
//     [key: string]: any;
//   };
//   geometry: {
//     type: "Point";
//     coordinates: [number, number];
//   };
// }

// interface GeoJSONLayer {
//   id: string;
//   name: string;
//   url: string;
//   urlRecommended?: string; // URL для рекомендованной версии
//   color: string;
//   visible: boolean;
//   type: "polygon" | "point" | "line";
//   icon: string;
// }

// // Конфигурация всех доступных слоев
// const AVAILABLE_LAYERS: GeoJSONLayer[] = [
//   {
//     id: "districts",
//     name: "Районы",
//     url: "/geo-files/districts.geojson",
//     // color: "#627BC1",
//     color: "#e04a3a",
//     visible: true,
//     type: "polygon",
//     icon: "🏛️",
//   },
//   {
//     id: "population_grid",
//     name: "Сетка населения",
//     url: "/geo-files/pop_grids.geojson",
//     color: "#f59e0b",
//     visible: true,
//     type: "polygon",
//     icon: "👥",
//   },
//   {
//     id: "accessibility_30min",
//     name: "Доступность (30 мин)",
//     url: "/geo-files/30min.geojson",
//     urlRecommended: "/geo-files/30min_recommended.geojson",
//     color: "#ff9a48",
//     visible: true,
//     type: "polygon",
//     icon: "🚗",
//   },
//   {
//     id: "accessibility_15min",
//     name: "Доступность (15 мин)",
//     url: "/geo-files/15min.geojson",
//     urlRecommended: "/geo-files/15min_recommended.geojson",
//     color: "#eedf25",
//     visible: true,
//     type: "polygon",
//     icon: "🚶",
//   },
//   {
//     id: "green_10min",
//     name: " (10 мин)",
//     url: "/geo-files/10min_green.geojson",
//     urlRecommended: "/geo-files/10min_recommended.geojson",
//     color: "#26bf32",
//     visible: true,
//     type: "polygon",
//     icon: "🌳",
//   },
// ];

// export function SmpTab({ className = "" }: SmpTabProps) {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const mapRef = useRef<mapboxgl.Map | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [facilities, setFacilities] = useState<MedicalFacility[]>([]);
//   const [recommendedFacilities, setRecommendedFacilities] = useState<
//     MedicalFacility[]
//   >([]);
//   const [layers, setLayers] = useState<GeoJSONLayer[]>(AVAILABLE_LAYERS);
//   const [showLayerPanel, setShowLayerPanel] = useState(false);
//   const [showRecommendations, setShowRecommendations] = useState(false);

//   // Инициализация карты
//   useEffect(() => {
//     if (!containerRef.current) return;

//     // Проверяем наличие токена Mapbox
//     if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes("example")) {
//       console.error("Mapbox token not configured properly");
//       setIsLoading(false);
//       return;
//     }

//     // Устанавливаем токен Mapbox
//     mapboxgl.accessToken = MAPBOX_TOKEN;

//     // Создаем карту
//     const map = new mapboxgl.Map({
//       container: containerRef.current,
//       style: "mapbox://styles/mapbox/streets-v12",
//       center: [76.9, 43.25], // Координаты Алматы
//       zoom: 11,
//       maxZoom: 18,
//       minZoom: 9,
//     });

//     mapRef.current = map;

//     map.on("load", () => {
//       console.log("Mapbox: Map loaded successfully");
//       setIsLoading(false);
//     });

//     map.on("error", (e: any) => {
//       console.error("Mapbox: Map error:", e);
//       setIsLoading(false);
//     });

//     return () => {
//       if (mapRef.current) {
//         mapRef.current.remove();
//         mapRef.current = null;
//       }
//     };
//   }, []);

//   // Загрузка данных медучреждений
//   useEffect(() => {
//     const loadFacilities = async () => {
//       try {
//         console.log("Loading Extra_MO_coord.geojson...");
//         const response = await fetch("/geo-files/Extra_MO_coord.geojson");

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();
//         console.log("Loaded facilities data:", data);

//         if (data.features && Array.isArray(data.features)) {
//           setFacilities(data.features);
//         }
//       } catch (error) {
//         console.error("Error loading facilities:", error);
//       }
//     };

//     const loadRecommendedFacilities = async () => {
//       try {
//         console.log("Loading recommended facilities...");
//         const response = await fetch("/geo-files/Recommended_MO.geojson");
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();
//         console.log("Loaded recommended facilities:", data);
//         if (data.features && Array.isArray(data.features)) {
//           setRecommendedFacilities(data.features);
//         }
//       } catch (error) {
//         console.error("Error loading recommended facilities:", error);
//       }
//     };

//     loadFacilities();
//     loadRecommendedFacilities();
//   }, []);

//   // Добавление маркеров на карту
//   useEffect(() => {
//     if (!mapRef.current || isLoading || facilities.length === 0) return;

//     const map = mapRef.current;

//     // Удаляем существующие источники и слои
//     if (map.getSource("facilities")) {
//       if (map.getLayer("facilities-layer")) {
//         map.removeLayer("facilities-layer");
//       }
//       map.removeSource("facilities");
//     }

//     if (map.getSource("recommended-facilities")) {
//       if (map.getLayer("recommended-facilities-layer")) {
//         map.removeLayer("recommended-facilities-layer");
//       }
//       map.removeSource("recommended-facilities");
//     }

//     // Определяем какие данные показывать
//     const currentFacilities = showRecommendations
//       ? [...facilities, ...recommendedFacilities]
//       : facilities;

//     // Добавляем источник данных для текущих учреждений
//     map.addSource("facilities", {
//       type: "geojson",
//       data: {
//         type: "FeatureCollection",
//         features: facilities,
//       },
//     });

//     // Если показываем рекомендации, добавляем рекомендуемые учреждения
//     if (showRecommendations && recommendedFacilities.length > 0) {
//       map.addSource("recommended-facilities", {
//         type: "geojson",
//         data: {
//           type: "FeatureCollection",
//           features: recommendedFacilities,
//         },
//       });
//     }

//     // Функция для определения цвета маркера (как на главной странице)
//     const getMarkerColor = (overload: string) => {
//       const percent = parseInt(overload.replace("%", ""));
//       const occupancyRate = percent / 100;

//       if (occupancyRate > 0.95) return "#dc2626"; // red-600 - критическая (выше 95%)
//       if (occupancyRate > 0.8) return "#ea580c"; // orange-600 - высокая (80-95%)
//       if (occupancyRate >= 0.5) return "#16a34a"; // green-600 - нормальная (50-80%)
//       return "#6b7280"; // gray-500 - низкая (ниже 50%)
//     };

//     // Функция для получения текста статуса
//     const getStatusText = (overload: string) => {
//       const percent = parseInt(overload.replace("%", ""));
//       const occupancyRate = percent / 100;

//       if (occupancyRate > 0.95) return "Критическая";
//       if (occupancyRate > 0.8) return "Высокая";
//       if (occupancyRate >= 0.5) return "Нормальная";
//       return "Низкая";
//     };

//     // Добавляем слой с маркерами существующих учреждений
//     map.addLayer({
//       id: "facilities-layer",
//       type: "circle",
//       source: "facilities",
//       paint: {
//         "circle-radius": ["case", ["==", ["get", "type2"], "Частные"], 8, 10],
//         "circle-color": [
//           "case",
//           // Критическая загруженность (>95%)
//           [
//             ">",
//             ["/", ["to-number", ["slice", ["get", "Overload"], 0, -1]], 100],
//             0.95,
//           ],
//           "#dc2626", // red-600
//           // Высокая загруженность (80-95%)
//           [
//             ">",
//             ["/", ["to-number", ["slice", ["get", "Overload"], 0, -1]], 100],
//             0.8,
//           ],
//           "#ea580c", // orange-600
//           // Нормальная загруженность (50-80%)
//           [
//             ">=",
//             ["/", ["to-number", ["slice", ["get", "Overload"], 0, -1]], 100],
//             0.5,
//           ],
//           "#16a34a", // green-600
//           // Низкая загруженность (<50%)
//           "#6b7280", // gray-500
//         ],
//         "circle-stroke-color": "#ffffff",
//         "circle-stroke-width": 2,
//         "circle-opacity": showRecommendations ? 0.6 : 0.8, // Делаем полупрозрачными когда показываем рекомендации
//       },
//     });

//     // Добавляем слой с рекомендуемыми учреждениями (зеленые маркеры)
//     if (showRecommendations && recommendedFacilities.length > 0) {
//       map.addLayer({
//         id: "recommended-facilities-layer",
//         type: "circle",
//         source: "recommended-facilities",
//         paint: {
//           "circle-radius": 12,
//           "circle-color": "#10b981", // emerald-500 - зеленый для рекомендуемых
//           "circle-stroke-color": "#ffffff",
//           "circle-stroke-width": 3,
//           "circle-opacity": 1,
//         },
//       });
//     }

//     // Добавляем всплывающие окна
//     map.on("click", "facilities-layer", (e: any) => {
//       if (!e.features || e.features.length === 0) return;

//       const feature = e.features[0] as any;
//       const props = feature.properties;

//       new mapboxgl.Popup()
//         .setLngLat(e.lngLat)
//         .setHTML(
//           `
//           <div class="p-3 max-w-sm">
//             <h3 class="font-semibold text-sm mb-2">${
//               props.medical_organization
//             }</h3>
//             <div class="text-xs space-y-1">
//               <p><strong>Тип:</strong> ${props.type}</p>
//               <p><strong>Форма собственности:</strong> ${props.type2}</p>
//               <p><strong>Коек:</strong> ${
//                 props["Number_of_ beds_actually_deployed_closed"] || "Н/Д"
//               }</p>
//               <p><strong>Загруженность:</strong> <span class="font-medium" style="color: ${getMarkerColor(
//                 props.Overload
//               )}">${props.Overload} (${getStatusText(
//             props.Overload
//           )})</span></p>
//               <p><strong>Принято пациентов:</strong> ${
//                 props["Patients admitted total"] || "Н/Д"
//               }</p>
//               <p><strong>Сельские жители:</strong> ${
//                 props["Rural residents"] || "Н/Д"
//               }</p>
//             </div>
//           </div>
//         `
//         )
//         .addTo(map);
//     });

//     // Меняем курсор при наведении
//     map.on("mouseenter", "facilities-layer", () => {
//       map.getCanvas().style.cursor = "pointer";
//     });

//     map.on("mouseleave", "facilities-layer", () => {
//       map.getCanvas().style.cursor = "";
//     });

//     console.log(`Added ${facilities.length} medical facilities to map`);
//     if (showRecommendations && recommendedFacilities.length > 0) {
//       console.log(
//         `Added ${recommendedFacilities.length} recommended facilities to map`
//       );
//     }
//   }, [
//     mapRef.current,
//     isLoading,
//     facilities,
//     recommendedFacilities,
//     showRecommendations,
//   ]);

//   // Управление GeoJSON слоями
//   useEffect(() => {
//     if (!mapRef.current || isLoading || facilities.length === 0) return;

//     const map = mapRef.current;

//     // Проверяем, что слой медучреждений уже существует
//     if (!map.getLayer("facilities-layer")) return;

//     const loadGeoJSONLayers = async () => {
//       for (const layer of layers) {
//         const sourceId = `layer-${layer.id}`;
//         const layerId = `${sourceId}-fill`;
//         const strokeId = `${sourceId}-stroke`;

//         // Удаляем существующие слои
//         if (map.getLayer(strokeId)) map.removeLayer(strokeId);
//         if (map.getLayer(layerId)) map.removeLayer(layerId);
//         if (map.getSource(sourceId)) map.removeSource(sourceId);

//         if (!layer.visible) continue;

//         try {
//           console.log(`Loading layer: ${layer.name}`);
//           // Определяем какой URL использовать - обычный или рекомендованный
//           const urlToUse = showRecommendations && layer.urlRecommended
//             ? layer.urlRecommended
//             : layer.url;
//
//           const response = await fetch(urlToUse);

//           if (!response.ok) {
//             console.warn(`Failed to load ${layer.name}: ${response.status}`);
//             continue;
//           }

//           const data = await response.json();

//           // Добавляем источник данных
//           map.addSource(sourceId, {
//             type: "geojson",
//             data,
//           });

//           // Добавляем слой заливки для полигонов
//           if (layer.type === "polygon") {
//             map.addLayer(
//               {
//                 id: layerId,
//                 type: "fill",
//                 source: sourceId,
//                 paint: {
//                   "fill-color": layer.color,
//                   "fill-opacity": 0.3,
//                 },
//               },
//               "facilities-layer"
//             ); // Добавляем ДО слоя медучреждений

//             // Добавляем слой границ
//             map.addLayer(
//               {
//                 id: strokeId,
//                 type: "line",
//                 source: sourceId,
//                 paint: {
//                   "line-color": layer.color,
//                   "line-width": 2,
//                   "line-opacity": 1,
//                 },
//               },
//               "facilities-layer"
//             ); // Добавляем ДО слоя медучреждений
//           }

//           console.log(`Successfully loaded layer: ${layer.name}`);
//         } catch (error) {
//           console.error(`Error loading layer ${layer.name}:`, error);
//         }
//       }
//     };

//     loadGeoJSONLayers();
//   }, [mapRef.current, isLoading, layers, facilities, showRecommendations]);

//   // Функция для переключения видимости слоя
//   const toggleLayer = (layerId: string) => {
//     setLayers((prev) =>
//       prev.map((layer) =>
//         layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
//       )
//     );
//   };

//   const zoomIn = () => {
//     if (mapRef.current) {
//       mapRef.current.zoomIn();
//     }
//   };

//   const zoomOut = () => {
//     if (mapRef.current) {
//       mapRef.current.zoomOut();
//     }
//   };

//   const resetView = () => {
//     if (mapRef.current) {
//       mapRef.current.flyTo({
//         center: [76.9, 43.25],
//         zoom: 11,
//         duration: 1000,
//       });
//     }
//   };

//   return (
//     <div className="space-y-4">
//       {/* Сетка: карта на 2 колонки, графики по 1 колонке */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//         {/* Карта СМП/ВТМП - занимает 2 колонки из 3 */}
//         <Card className="lg:col-span-2 lg:row-span-2 flex flex-col">
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <div>
//                 <CardTitle className="flex flex-col gap-1">
//                   <span>Карта оптимального покрытия доступностью</span>
//                 </CardTitle>
//                 <CardDescription>
//                   {showRecommendations
//                     ? "Покрытие с рекомендованными МО (зеленые маркеры)"
//                     : "Текущее состояние покрытия"}
//                 </CardDescription>
//               </div>
//               <div className="flex items-center gap-3">
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm font-medium">
//                     {showRecommendations ? "С рекомендациями" : "Текущее"}
//                   </span>
//                   <Switch
//                     checked={showRecommendations}
//                     onCheckedChange={setShowRecommendations}
//                   />
//                 </div>
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent className="flex-1">
//             <div className={`relative h-[500px] w-full ${className}`}>
//               {/* Контейнер карты */}
//               <div
//                 ref={containerRef}
//                 className="h-full w-full rounded-lg overflow-hidden"
//               />

//               {/* Индикатор загрузки */}
//               {isLoading &&
//                 MAPBOX_TOKEN &&
//                 !MAPBOX_TOKEN.includes("example") && (
//                   <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
//                     <div className="text-center">
//                       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//                       <p className="text-sm text-gray-600">Загрузка карты...</p>
//                     </div>
//                   </div>
//                 )}

//               {/* Информация о загруженных данных */}
//               <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs">
//                 <div>Медучреждений: {facilities.length}</div>
//                 {showRecommendations && (
//                   <div>Рекомендуемых: {recommendedFacilities.length}</div>
//                 )}
//                 <div>Статус: {isLoading ? "Загрузка..." : "Готово"}</div>
//               </div>

//               {/* Легенда */}
//               <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3">
//                 <h4 className="text-xs font-semibold mb-2">
//                   {showRecommendations
//                     ? "Идеальное покрытие"
//                     : "Покрытие населения"}
//                 </h4>
//                 <div className="space-y-1 text-xs">
//                   <div className="flex items-center gap-2">
//                     <div className="w-3 h-3 bg-green-600"></div>
//                     <span>&gt; 85%</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <div className="w-3 h-3 bg-yellow-400"></div>
//                     <span>50-85%</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <div className="w-3 h-3 bg-orange-600"></div>
//                     <span>&lt; 50%</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <div className="w-3 h-3 bg-red-600"></div>
//                     <span>&lt; 30%</span>
//                   </div>
//                   {showRecommendations && (
//                     <>
//                       <hr className="my-2" />
//                       <div className="flex items-center gap-2">
//                         <div className="w-3 h-3 rounded-full bg-blue-600"></div>
//                         <span>Собственные УПП</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <div className="w-3 h-3 rounded-full bg-orange-600"></div>
//                         <span>Арендованные УПП</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
//                         <span>Рекомендуемые УПП</span>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               </div>

//               {/* Контролы масштаба */}
//               <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
//                 <Button variant="outline" size="sm" onClick={zoomIn}>
//                   <ZoomIn className="h-4 w-4" />
//                 </Button>
//                 <Button variant="outline" size="sm" onClick={zoomOut}>
//                   <ZoomOut className="h-4 w-4" />
//                 </Button>
//                 <Button variant="outline" size="sm" onClick={resetView}>
//                   <RotateCcw className="h-4 w-4" />
//                 </Button>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FacilityStatistic,
  HospitalizationStatistic,
} from "@/types/healthcare";

interface SmpVtmpTabProps {
  filteredFacilities: FacilityStatistic[];
  hospitalizations: HospitalizationStatistic[];
  selectedDistricts: string[];
  selectedFacilityTypes: string[];
  selectedBedProfiles: string[];
  searchQuery: string;
  onShowRoute?: (source: FacilityStatistic, target: FacilityStatistic) => void;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes("example")) {
  console.warn(
    "⚠️ Mapbox token not configured. Please set NEXT_PUBLIC_MAPBOX_TOKEN in .env.local"
  );
}

interface SmpTabProps {
  className?: string;
}

interface MedicalFacility {
  type: "Feature";
  properties: {
    medical_organization: string;
    Bed_Profile?: string;
    "is delated"?: string | null;
    type: string;
    type2: string;
    Overload: string;
    color?: string;
    "Number_of_ beds_actually_deployed_closed"?: string;
    [key: string]: any;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
}

interface GeoJSONLayer {
  id: string;
  name: string;
  url: string;
  urlRecommended?: string; // URL для рекомендованной версии
  color: string;
  visible: boolean;
  type: "polygon" | "point" | "line";
  icon: string;
}

// Конфигурация всех доступных слоев полигонов
const AVAILABLE_LAYERS: GeoJSONLayer[] = [
  {
    id: "districts",
    name: "Районы",
    url: "/geo-files/districts.geojson",
    color: "#e04a3a",
    visible: true,
    type: "polygon",
    icon: "🏛️",
  },
  {
    id: "population_grid",
    name: "Сетка населения",
    url: "/geo-files/pop_grids.geojson",
    color: "#f59e0b",
    visible: true,
    type: "polygon",
    icon: "👥",
  },
  {
    id: "accessibility_30min",
    name: "Доступность (30 мин)",
    url: "/geo-files/30min.geojson",
    urlRecommended: "/geo-files/30min_recommended.geojson",
    color: "#ff9a48",
    visible: true,
    type: "polygon",
    icon: "🚗",
  },
  {
    id: "accessibility_15min",
    name: "Доступность (15 мин)",
    url: "/geo-files/15min.geojson",
    urlRecommended: "/geo-files/15min_recommended.geojson",
    color: "#eedf25",
    visible: true,
    type: "polygon",
    icon: "🚶",
  },
  {
    id: "green_10min",
    name: "Доступность (10 мин)",
    url: "/geo-files/10min_green.geojson",
    urlRecommended: "/geo-files/10min_recommended.geojson",
    color: "#26bf32",
    visible: true,
    type: "polygon",
    icon: "🌳",
  },
];

// Улучшенное отображение полигонов в режимах
const getPolygonPaint = (layer: GeoJSONLayer, showRecommendations: boolean) => {
  // Базовая прозрачность и особые настройки для разных слоев
  if (layer.id === "green_10min") {
    return {
      "fill-color": showRecommendations ? "#22c55e" : layer.color, // более яркий зеленый
      "fill-opacity": showRecommendations ? 0.5 : 0.35,
    };
  }

  if (layer.id === "accessibility_15min") {
    return {
      "fill-color": showRecommendations ? "#eab308" : layer.color, // более яркий желтый
      "fill-opacity": showRecommendations ? 0.4 : 0.25,
    };
  }

  if (layer.id === "accessibility_30min") {
    return {
      "fill-color": showRecommendations ? "#f97316" : layer.color, // более яркий оранжевый
      "fill-opacity": showRecommendations ? 0.35 : 0.25,
    };
  }

  // Для остальных слоев обычная логика
  const baseOpacity = showRecommendations ? 0.3 : 0.2;

  return {
    "fill-color": layer.color,
    "fill-opacity": baseOpacity,
  };
};

// Улучшенная функция для раскраски полигонов с учетом зон рекомендаций
const getEnhancedPolygonPaint = (
  layer: GeoJSONLayer,
  showRecommendations: boolean
) => {
  if (!showRecommendations) {
    return getPolygonPaint(layer, false);
  }

  // В режиме рекомендаций создаем условные стили для полигонов
  if (layer.id === "green_10min") {
    return {
      "fill-color": [
        "case",
        ["==", ["get", "recommended_zone"], true],
        "#10b981", // ярко-зеленый для зон рекомендаций
        "#22c55e", // обычный зеленый
      ] as any,
      "fill-opacity": [
        "case",
        ["==", ["get", "recommended_zone"], true],
        0.7, // более яркая для зон рекомендаций
        0.5,
      ] as any,
    };
  }

  if (layer.id === "accessibility_15min") {
    return {
      "fill-color": [
        "case",
        ["==", ["get", "recommended_zone"], true],
        "#10b981", // зеленый для зон рекомендаций
        "#eab308", // желтый для обычных зон
      ] as any,
      "fill-opacity": [
        "case",
        ["==", ["get", "recommended_zone"], true],
        0.6, // более яркая для зон рекомендаций
        0.4,
      ] as any,
    };
  }

  if (layer.id === "accessibility_30min") {
    return {
      "fill-color": [
        "case",
        ["==", ["get", "recommended_zone"], true],
        "#22c55e", // светло-зеленый для зон рекомендаций
        "#f97316", // оранжевый для обычных зон
      ] as any,
      "fill-opacity": [
        "case",
        ["==", ["get", "recommended_zone"], true],
        0.5, // более яркая для зон рекомендаций
        0.35,
      ] as any,
    };
  }

  // Для остальных слоев возвращаем обычные стили
  return getPolygonPaint(layer, showRecommendations);
};

// Настройки границ полигонов
const getStrokePaint = (layer: GeoJSONLayer, showRecommendations: boolean) => {
  // Делаем границы более контрастными в режиме рекомендаций
  const width = showRecommendations ? 1.5 : 1;
  const opacity = showRecommendations ? 0.8 : 0.6;

  return {
    "line-color": layer.color,
    "line-width": width,
    "line-opacity": opacity,
  };
};

// Функция для проверки находится ли полигон рядом с рекомендованной больницей
const isPolygonNearRecommended = (
  polygon: any,
  recommendedFacilities: MedicalFacility[],
  maxDistanceKm: number = 5
): boolean => {
  if (!polygon.geometry || !polygon.geometry.coordinates) return false;

  let coordinates: number[][][] = [];

  // Обрабатываем разные типы геометрии
  if (polygon.geometry.type === "Polygon") {
    coordinates = [polygon.geometry.coordinates[0]];
  } else if (polygon.geometry.type === "MultiPolygon") {
    coordinates = polygon.geometry.coordinates.map(
      (poly: number[][][]) => poly[0]
    );
  } else {
    return false;
  }

  // Проверяем каждую часть полигона
  for (const coords of coordinates) {
    if (!coords || coords.length === 0) continue;

    // Получаем центр полигона
    let sumLng = 0,
      sumLat = 0;
    for (const coord of coords) {
      sumLng += coord[0];
      sumLat += coord[1];
    }

    const centerLng = sumLng / coords.length;
    const centerLat = sumLat / coords.length;

    // Проверяем расстояние до каждой рекомендованной больницы
    for (const facility of recommendedFacilities) {
      const facilityCoords = facility.geometry.coordinates;
      const distance = Math.sqrt(
        Math.pow((centerLng - facilityCoords[0]) * 111.32, 2) +
          Math.pow((centerLat - facilityCoords[1]) * 110.54, 2)
      );

      if (distance <= maxDistanceKm) {
        return true;
      }
    }
  }

  return false;
};

// Функция для модификации GeoJSON данных с учетом рекомендованных больниц
const modifyGeoJSONForRecommendations = (
  originalData: any,
  recommendedFacilities: MedicalFacility[],
  layerId: string
): any => {
  if (!recommendedFacilities.length) {
    console.log(`No recommended facilities for layer ${layerId}`);
    return originalData;
  }

  console.log(
    `Processing layer ${layerId} with ${recommendedFacilities.length} recommended facilities`
  );

  let modifiedCount = 0;
  const modifiedFeatures = originalData.features.map((feature: any) => {
    // Разные радиусы для разных слоев доступности
    let maxDistance = 2; // км
    if (layerId === "green_10min") {
      maxDistance = 1.5; // 10-минутная зона - маленький радиус
    } else if (layerId === "accessibility_15min") {
      maxDistance = 2.5; // 15-минутная зона - средний радиус
    } else if (layerId === "accessibility_30min") {
      maxDistance = 4; // 30-минутная зона - больший радиус
    }

    const isNearRecommended = isPolygonNearRecommended(
      feature,
      recommendedFacilities,
      maxDistance
    );

    if (isNearRecommended) {
      modifiedCount++;
      return {
        ...feature,
        properties: {
          ...feature.properties,
          recommended_zone: true, // Помечаем как зону рекомендаций
        },
      };
    }

    return feature;
  });

  console.log(`Modified ${modifiedCount} polygons in layer ${layerId}`);

  return {
    ...originalData,
    features: modifiedFeatures,
  };
};

export function SmpTab({ className = "" }: SmpTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [facilities, setFacilities] = useState<MedicalFacility[]>([]);
  const [recommendedFacilities, setRecommendedFacilities] = useState<
    MedicalFacility[]
  >([]);
  const [layers, setLayers] = useState<GeoJSONLayer[]>(AVAILABLE_LAYERS);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Инициализация карты
  useEffect(() => {
    if (!containerRef.current) return;

    if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes("example")) {
      console.error("Mapbox token not configured properly");
      setIsLoading(false);
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [76.9, 43.25],
      zoom: 11,
      maxZoom: 18,
      minZoom: 9,
    });

    mapRef.current = map;

    map.on("load", () => {
      setIsLoading(false);
    });

    map.on("error", (e: any) => {
      console.error("Mapbox: Map error:", e);
      setIsLoading(false);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Загрузка данных медучреждений
  useEffect(() => {
    const loadFacilities = async () => {
      try {
        const response = await fetch("/geo-files/Extra_MO_coord.geojson");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.features && Array.isArray(data.features)) {
          setFacilities(data.features);
        }
      } catch (error) {
        console.error("Error loading facilities:", error);
      }
    };

    const loadRecommendedFacilities = async () => {
      try {
        const response = await fetch("/geo-files/Recommended_MO.geojson");

        if (!response.ok) {
          // если файла пока нет — просто молча выходим
          console.warn(
            `Recommended_MO.geojson not found: ${response.status} ${response.statusText}`
          );
          return;
        }

        const data = await response.json();

        if (data.features && Array.isArray(data.features)) {
          setRecommendedFacilities(data.features);
        }
      } catch (error) {
        console.error("Error loading recommended facilities:", error);
      }
    };

    loadFacilities();
    loadRecommendedFacilities();
  }, []);

  // Добавление маркеров на карту (текущие + рекомендуемые)
  useEffect(() => {
    if (!mapRef.current || isLoading || facilities.length === 0) return;

    const map = mapRef.current;

    // --- Очистка предыдущих слоёв/источников
    if (map.getLayer("facilities-layer")) map.removeLayer("facilities-layer");
    if (map.getSource("facilities")) map.removeSource("facilities");

    if (map.getLayer("recommended-facilities-layer"))
      map.removeLayer("recommended-facilities-layer");
    if (map.getSource("recommended-facilities"))
      map.removeSource("recommended-facilities");

    // Источник текущих учреждений
    map.addSource("facilities", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: facilities,
      },
    });

    // Слой текущих учреждений
    map.addLayer({
      id: "facilities-layer",
      type: "circle",
      source: "facilities",
      paint: {
        "circle-radius": ["case", ["==", ["get", "type2"], "Частные"], 8, 10],
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 2,
        "circle-opacity": 0.8,
        "circle-color": showRecommendations
          ? [
              "match",
              ["downcase", ["get", "type2"]],
              "гос",
              "#2563eb", // собственные УПП
              "частные",
              "#ea580c", // арендованные УПП
              "#6b7280",
            ]
          : [
              "case",
              // >95%
              [
                ">",
                [
                  "/",
                  ["to-number", ["slice", ["get", "Overload"], 0, -1]],
                  100,
                ],
                0.95,
              ],
              "#dc2626",
              // 80–95
              [
                ">",
                [
                  "/",
                  ["to-number", ["slice", ["get", "Overload"], 0, -1]],
                  100,
                ],
                0.8,
              ],
              "#ea580c",
              // 50–80
              [
                ">=",
                [
                  "/",
                  ["to-number", ["slice", ["get", "Overload"], 0, -1]],
                  100,
                ],
                0.5,
              ],
              "#16a34a",
              // <50
              "#6b7280",
            ],
      },
    });

    // Источник и слой рекомендуемых учреждений
    if (showRecommendations && recommendedFacilities.length > 0) {
      map.addSource("recommended-facilities", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: recommendedFacilities,
        },
      });

      map.addLayer({
        id: "recommended-facilities-layer",
        type: "circle",
        source: "recommended-facilities",
        paint: {
          "circle-radius": 12,
          "circle-color": "#10b981", // emerald-500
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 3,
          "circle-opacity": 1,
        },
      });
    }

    // Попапы для текущих учреждений
    map.on("click", "facilities-layer", (e: any) => {
      if (!e.features || e.features.length === 0) return;

      const feature = e.features[0] as any;
      const props = feature.properties;

      const percent = parseInt(String(props.Overload).replace("%", ""), 10);
      const occupancyRate = percent / 100;

      const getStatusText = () => {
        if (occupancyRate > 0.95) return "Критическая";
        if (occupancyRate > 0.8) return "Высокая";
        if (occupancyRate >= 0.5) return "Нормальная";
        return "Низкая";
      };

      const getMarkerColor = () => {
        if (occupancyRate > 0.95) return "#dc2626";
        if (occupancyRate > 0.8) return "#ea580c";
        if (occupancyRate >= 0.5) return "#16a34a";
        return "#6b7280";
      };

      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(
          `
          <div class="p-3 max-w-sm">
            <h3 class="font-semibold text-sm mb-2">${
              props.medical_organization
            }</h3>
            <div class="text-xs space-y-1">
              <p><strong>Тип:</strong> ${props.type}</p>
              <p><strong>Форма собственности:</strong> ${props.type2}</p>
              <p><strong>Коек:</strong> ${
                props["Number_of_ beds_actually_deployed_closed"] || "Н/Д"
              }</p>
              <p><strong>Загруженность:</strong> 
                <span class="font-medium" style="color: ${getMarkerColor()}">
                  ${props.Overload} (${getStatusText()})
                </span>
              </p>
              <p><strong>Принято пациентов:</strong> ${
                props["Patients admitted total"] || "Н/Д"
              }</p>
              <p><strong>Сельские жители:</strong> ${
                props["Rural residents"] || "Н/Д"
              }</p>
            </div>
          </div>
        `
        )
        .addTo(map);
    });

    map.on("mouseenter", "facilities-layer", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "facilities-layer", () => {
      map.getCanvas().style.cursor = "";
    });
  }, [isLoading, facilities, recommendedFacilities, showRecommendations]);

  // Загрузка и отрисовка слоев полигонов
  useEffect(() => {
    if (!mapRef.current || isLoading || facilities.length === 0) return;

    const map = mapRef.current;

    const loadGeoJSONLayers = async () => {
      for (const layer of layers) {
        const sourceId = `layer-${layer.id}`;
        const fillId = `${sourceId}-fill`;
        const strokeId = `${sourceId}-stroke`;

        // Удаляем старое
        if (map.getLayer(strokeId)) map.removeLayer(strokeId);
        if (map.getLayer(fillId)) map.removeLayer(fillId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);

        if (!layer.visible) continue;

        try {
          // Всегда используем оригинальные файлы, а перекраску делаем динамически
          const response = await fetch(layer.url);
          if (!response.ok) {
            console.warn(`Failed to load ${layer.name}: ${response.status}`);
            continue;
          }

          let data = await response.json();

          // Если включены рекомендации и есть рекомендованные больницы, модифицируем данные
          if (showRecommendations && recommendedFacilities.length > 0) {
            data = modifyGeoJSONForRecommendations(
              data,
              recommendedFacilities,
              layer.id
            );
          }

          map.addSource(sourceId, {
            type: "geojson",
            data,
          });

          if (layer.type === "polygon") {
            map.addLayer(
              {
                id: fillId,
                type: "fill",
                source: sourceId,
                paint: getEnhancedPolygonPaint(layer, showRecommendations),
              },
              "facilities-layer"
            );

            map.addLayer(
              {
                id: strokeId,
                type: "line",
                source: sourceId,
                paint: getStrokePaint(layer, showRecommendations),
              },
              "facilities-layer"
            );
          }
        } catch (error) {
          console.error(`Error loading layer ${layer.name}:`, error);
        }
      }
    };

    loadGeoJSONLayers();
  }, [isLoading, layers, facilities, showRecommendations]);

  const toggleLayer = (layerId: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };

  const zoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const resetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [76.9, 43.25],
        zoom: 11,
        duration: 1000,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 lg:row-span-2 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex flex-col gap-1">
                  <span>Карта оптимального покрытия доступностью</span>
                </CardTitle>
                <CardDescription>
                  {showRecommendations
                    ? "Покрытие с рекомендованными МО (зеленые маркеры)"
                    : "Текущее состояние покрытия"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {showRecommendations ? "С рекомендациями" : "Текущее"}
                  </span>
                  <Switch
                    checked={showRecommendations}
                    onCheckedChange={setShowRecommendations}
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1">
            <div className={`relative h-[500px] w-full ${className}`}>
              <div
                ref={containerRef}
                className="h-full w-full rounded-lg overflow-hidden"
              />

              {(!MAPBOX_TOKEN || MAPBOX_TOKEN.includes("example")) && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
                  <div className="text-center p-8 max-w-md">
                    <div className="text-6xl mb-4">🗺️</div>
                    <h3 className="text-lg font-semibold mb-2">
                      Настройка карты
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Для отображения карты необходимо настроить токен Mapbox.
                    </p>
                    <div className="text-xs text-left bg-gray-50 p-3 rounded border">
                      <p className="font-medium mb-2">Инструкция:</p>
                      <ol className="space-y-1">
                        <li>1. Зарегистрируйтесь на mapbox.com</li>
                        <li>2. Получите токен доступа</li>
                        <li>3. Добавьте его в .env.local:</li>
                        <li className="font-mono text-xs bg-white p-1 rounded">
                          NEXT_PUBLIC_MAPBOX_TOKEN=ваш_токен
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {isLoading &&
                MAPBOX_TOKEN &&
                !MAPBOX_TOKEN.includes("example") && (
                  <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                      <p className="text-sm text-gray-600">Загрузка карты...</p>
                    </div>
                  </div>
                )}

              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs">
                <div>Медучреждений: {facilities.length}</div>
                {showRecommendations && (
                  <div>Рекомендуемых: {recommendedFacilities.length}</div>
                )}
                <div>Статус: {isLoading ? "Загрузка..." : "Готово"}</div>
              </div>

              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3">
                <h4 className="text-xs font-semibold mb-2">
                  {showRecommendations
                    ? "Идеальное покрытие"
                    : "Покрытие населения"}
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600" />
                    <span>&gt; 85%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-400" />
                    <span>50-85%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-600" />
                    <span>&lt; 50%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-600" />
                    <span>&lt; 30%</span>
                  </div>
                  {showRecommendations && (
                    <>
                      <hr className="my-2" />
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-600" />
                        <span>Собственные УПП</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-600" />
                        <span>Арендованные УПП</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span>Рекомендуемые УПП</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
