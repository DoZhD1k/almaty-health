"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { useMapInitialization } from "@/hooks/use-map-initialization";
import { FacilityStatistic } from "@/types/healthcare";

interface MapLibreFacilityMapProps {
  facilities?: FacilityStatistic[];
  className?: string;
  fullscreen?: boolean;
  selectedDistrict?: string;
}

interface DistrictFeature {
  type: string;
  geometry: any;
  properties: {
    id: number;
    name_ru: string;
    name_kz: string;
    marker: [number, number];
  };
}

const getStatusColor = (occupancyRate: number) => {
  if (occupancyRate > 0.9) return "#dc2626"; // red-600 - критическая (выше 90%)
  if (occupancyRate > 0.7) return "#ea580c"; // orange-600 - высокая (70-90%)
  if (occupancyRate >= 0.4) return "#16a34a"; // green-600 - нормальная (40-70%)
  return "#6b7280"; // gray-500 - низкая (ниже 40%)
};

const getStatusText = (occupancyRate: number) => {
  if (occupancyRate > 0.9) return "Критическая";
  if (occupancyRate > 0.7) return "Высокая";
  if (occupancyRate >= 0.4) return "Нормальная";
  return "Низкая";
};

export function MapLibreFacilityMap({
  facilities = [],
  className = "",
  fullscreen = false,
  selectedDistrict = "Все районы",
}: MapLibreFacilityMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { mapRef, isLoading, zoomIn, zoomOut, resetView } = useMapInitialization(containerRef);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [districts, setDistricts] = useState<DistrictFeature[]>([]);

  // Fetch districts data
  useEffect(() => {
    fetch('https://admin.smartalmaty.kz/api/v1/address/districts')
      .then(res => res.json())
      .then(data => {
        console.log('Districts API response:', data);
        // API returns {count, next, previous, results: {type: "FeatureCollection", features: [...]}}
        if (data.results && data.results.features) {
          // Filter out districts with id 0 and 9
          const filteredDistricts = data.results.features.filter(
            (feature: any) => {
              const id = feature.id || feature.properties?.id;
              console.log('District id:', id, 'name:', feature.properties?.name_ru);
              return id !== 0 && id !== 9;
            }
          );
          console.log('Districts loaded (filtered):', filteredDistricts.length, 'from', data.results.features.length);
          setDistricts(filteredDistricts);
        }
      })
      .catch(err => console.error('Error loading districts:', err));
  }, []);

  // Add district polygons to map
  useEffect(() => {
    if (!mapRef.current) return;
    if (!districts.length) {
      console.log('No districts data yet');
      return;
    }

    const map = mapRef.current;
    console.log('Districts effect triggered, isLoading:', isLoading, 'style loaded:', map.isStyleLoaded());

    const addLayers = () => {
      try {
        const geojson = {
          type: 'FeatureCollection',
          features: districts
        };

        console.log('Adding districts source with', districts.length, 'features');
        console.log('Sample feature:', districts[0]);

        // Remove existing layers if present
        if (map.getLayer('districts-fill')) {
          console.log('Removing existing districts-fill layer');
          map.removeLayer('districts-fill');
        }
        if (map.getLayer('districts-outline')) {
          console.log('Removing existing districts-outline layer');
          map.removeLayer('districts-outline');
        }
        if (map.getLayer('districts-highlight')) {
          console.log('Removing existing districts-highlight layer');
          map.removeLayer('districts-highlight');
        }
        if (map.getSource('districts')) {
          console.log('Removing existing districts source');
          map.removeSource('districts');
        }

        // Add source
        map.addSource('districts', {
          type: 'geojson',
          data: geojson as any
        });
        console.log('Districts source added');

        // If a district is selected, show only that district
        if (selectedDistrict !== 'Все районы') {
          // Fill layer for selected district only
          map.addLayer({
            id: 'districts-fill',
            type: 'fill',
            source: 'districts',
            filter: ['==', ['get', 'name_ru'], selectedDistrict],
            paint: {
              'fill-color': '#3772ff',
              'fill-opacity': 0.3
            }
          });
          console.log('Districts fill layer added (filtered for:', selectedDistrict, ')');

          // Outline layer for selected district only
          map.addLayer({
            id: 'districts-outline',
            type: 'line',
            source: 'districts',
            filter: ['==', ['get', 'name_ru'], selectedDistrict],
            paint: {
              'line-color': '#3772ff',
              'line-width': 3,
              'line-opacity': 0.9
            }
          });
          console.log('Districts outline layer added (filtered for:', selectedDistrict, ')');
        } else {
          // Show all districts when none selected
          map.addLayer({
            id: 'districts-fill',
            type: 'fill',
            source: 'districts',
            paint: {
              'fill-color': '#3772ff',
              'fill-opacity': 0.1
            }
          });
          console.log('Districts fill layer added (all districts)');

          map.addLayer({
            id: 'districts-outline',
            type: 'line',
            source: 'districts',
            paint: {
              'line-color': '#3772ff',
              'line-width': 2,
              'line-opacity': 0.6
            }
          });
          console.log('Districts outline layer added (all districts)');
        }

        console.log('All district layers added successfully');
      } catch (error) {
        console.error('Error adding district layers:', error);
      }
    };

    // Wait for map style to load with retry mechanism
    const attemptAddLayers = () => {
      if (map.isStyleLoaded() && map.loaded()) {
        console.log('Map is ready, adding layers');
        addLayers();
      } else {
        console.log('Map not ready, waiting...');
        map.once('load', () => {
          console.log('Map load event fired');
          addLayers();
        });
      }
    };

    // Small delay to ensure map is ready
    setTimeout(attemptAddLayers, 500);

    return () => {
      if (!map) return;
      try {
        if (map.getLayer('districts-fill')) map.removeLayer('districts-fill');
        if (map.getLayer('districts-outline')) map.removeLayer('districts-outline');
        if (map.getLayer('districts-highlight')) map.removeLayer('districts-highlight');
        if (map.getSource('districts')) map.removeSource('districts');
      } catch (e) {
        console.error('Error cleaning up districts:', e);
      }
    };
  }, [districts, selectedDistrict, mapRef]);

  // Add facilities as markers
  useEffect(() => {
    if (!mapRef.current || isLoading || !facilities.length) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    facilities.forEach((facility) => {
      if (!facility.latitude || !facility.longitude) return;

      const occupancyRate = facility.occupancy_rate_percent || 0;
      const color = getStatusColor(occupancyRate);

      // Create popup content
      const popupContent = `
        <div class="min-w-[250px] p-2">
          <h3 class="font-bold text-sm mb-2">${facility.medical_organization || 'Неизвестно'}</h3>
          <div class="space-y-1 text-xs">
            <p><strong>Район:</strong> ${facility.district || 'Неизвестно'}</p>
            <p><strong>Тип:</strong> ${facility.facility_type || 'Неизвестно'}</p>
            <p><strong>Профиль:</strong> ${facility.bed_profile || 'Неизвестно'}</p>
            <p><strong>Коек развернуто:</strong> ${facility.beds_deployed_withdrawn_for_rep || 0}</p>
            <p><strong>Загруженность:</strong> <span style="color: ${color}; font-weight: bold;">${getStatusText(occupancyRate)} (${(occupancyRate * 100).toFixed(1)}%)</span></p>
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupContent);

      // Create marker element
      const el = document.createElement('div');
      el.className = 'facility-marker';
      el.style.width = '16px';
      el.style.height = '16px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = color;
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([Number(facility.longitude), Number(facility.latitude)])
        .setPopup(popup)
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [facilities, isLoading, mapRef]);

  return (
    <div className={`relative ${fullscreen ? 'h-full w-full' : 'h-[600px] w-full'} ${className}`}>
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ width: '100%', height: '100%' }}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--blue-normal))] mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Загрузка карты...</p>
          </div>
        </div>
      )}

      {/* Debug info */}
      <div className="absolute top-4 left-4 bg-white p-2 rounded shadow text-xs z-10">
        <div>Districts: {districts.length}</div>
        <div>Map Ready: {mapRef.current?.loaded() ? 'Yes' : 'No'}</div>
        <div>Style Loaded: {mapRef.current?.isStyleLoaded() ? 'Yes' : 'No'}</div>
        <div>Has Source: {mapRef.current?.getSource('districts') ? 'Yes' : 'No'}</div>
        <div>Has Layer: {mapRef.current?.getLayer('districts-fill') ? 'Yes' : 'No'}</div>
      </div>

      {/* Map controls */}
      {!fullscreen && (
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <button
            onClick={zoomIn}
            className="bg-white hover:bg-gray-100 p-2 rounded shadow-md transition-colors"
            title="Приблизить"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={zoomOut}
            className="bg-white hover:bg-gray-100 p-2 rounded shadow-md transition-colors"
            title="Отдалить"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={resetView}
            className="bg-white hover:bg-gray-100 p-2 rounded shadow-md transition-colors"
            title="Сбросить вид"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
