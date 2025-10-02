"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { SideFilterPanel } from "@/components/side-filter-panel";
import { QuickSummary } from "@/components/quick-summary";
import { FacilityStatistic } from "@/types/healthcare";
import { healthcareApi } from "@/lib/api/healthcare";

// Dynamically import the MapLibre map component to prevent SSR issues
const MapLibreFacilityMap = dynamic(
  () =>
    import("@/components/map/MapLibreFacilityMap").then((mod) => ({
      default: mod.MapLibreFacilityMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--blue-normal))] mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">
            Загрузка интерактивной карты...
          </p>
        </div>
      </div>
    ),
  }
);

interface FilterState {
  search: string;
  district: string;
  facilityType: string;
  profile: string;
  loadStatus: string[];
  bedRange: [number, number];
}

export default function HomePage() {
  const [facilities, setFacilities] = useState<FacilityStatistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    district: "Все районы",
    facilityType: "Все типы",
    profile: "Все профили",
    loadStatus: [],
    bedRange: [0, 1000],
  });

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    setLoading(true);
    try {
      const response = await healthcareApi.getFacilityStatistics();
      if (response.results && response.results.length > 0) {
        setFacilities(response.results);
      } else {
        setError("Нет данных для отображения");
      }
    } catch (error) {
      console.error("Error loading facilities:", error);
      setError("Ошибка подключения к серверу");
    } finally {
      setLoading(false);
    }
  };

  const filteredFacilities = useMemo(() => {
    return facilities.filter((facility) => {
      // Search filter
      if (
        filters.search &&
        facility.medical_organization &&
        !facility.medical_organization
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // District filter
      if (
        filters.district !== "Все районы" &&
        facility.district !== filters.district
      ) {
        return false;
      }

      // Facility type filter
      if (
        filters.facilityType !== "Все типы" &&
        facility.facility_type !== filters.facilityType
      ) {
        return false;
      }

      // Profile filter
      if (
        filters.profile !== "Все профили" &&
        facility.bed_profile !== filters.profile
      ) {
        return false;
      }

      // Load status filter
      if (filters.loadStatus.length > 0) {
        const occupancyRate = facility.occupancy_rate_percent || 0;
        const facilityLoadStatus =
          occupancyRate > 0.9
            ? "critical"
            : occupancyRate > 0.7
            ? "high"
            : occupancyRate > 0.4
            ? "normal"
            : "low";

        if (!filters.loadStatus.includes(facilityLoadStatus)) {
          return false;
        }
      }

      // Bed range filter - только если диапазон изменен от значений по умолчанию
      if (filters.bedRange[0] > 0 || filters.bedRange[1] < 1000) {
        const beds = facility.beds_deployed_withdrawn_for_rep || 0;
        if (beds < filters.bedRange[0] || beds > filters.bedRange[1]) {
          return false;
        }
      }

      return true;
    });
  }, [facilities, filters]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
    //fun
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Ошибка: {error}</p>
          <button
            onClick={loadFacilities}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Full-screen Map Background */}
      <div className="absolute inset-0 z-0">
        <MapLibreFacilityMap
          facilities={filteredFacilities}
          fullscreen={true}
          selectedDistrict={filters.district}
        />
      </div>

      {/* Sidebar - Overlaying the map on desktop */}
      <aside className="hidden lg:flex lg:flex-col absolute left-0 top-0 bottom-0 w-[340px] bg-gradient-to-b from-[#4169E1] to-[#5B7FED] backdrop-blur-sm border-r border-white/20 shadow-2xl z-10">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Sidebar Header */}
            <div className="mb-6">
              <h1 className="text-xl font-bold text-white mb-1">
                Мониторинг МО
              </h1>
              <p className="text-sm text-white/80">
                Система фильтрации медицинских организаций
              </p>
            </div>

            <SideFilterPanel
              onFiltersChange={setFilters}
              facilities={facilities}
              className="border-0 shadow-none bg-transparent"
            />
          </div>
        </div>
      </aside>

      {/* Quick Summary - Overlaying on desktop, top-right */}
      <div className="hidden lg:block absolute top-6 right-6 z-10 max-w-md">
        <QuickSummary facilities={filteredFacilities} />
      </div>

      {/* Mobile Layout - Full width stacked */}
      <div className="lg:hidden flex flex-col h-full">
        <div className="bg-white p-4 shadow-md z-10">
          <SideFilterPanel
            onFiltersChange={setFilters}
            facilities={facilities}
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <QuickSummary facilities={filteredFacilities} />
        </div>
      </div>
    </div>
  );
}
