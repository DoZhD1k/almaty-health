"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { SideFilterPanel } from "@/components/side-filter-panel";
import { QuickSummary } from "@/components/quick-summary";
import { FacilityStatistic } from "@/types/healthcare";
import { healthcareApi } from "@/lib/api/healthcare";

// Dynamically import the map component to prevent SSR issues with Leaflet
const FacilityMap = dynamic(
  () =>
    import("@/components/map/FacilityMapNew").then((mod) => ({
      default: mod.FacilityMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Загрузка карты...</p>
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
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Боковой фильтр */}
          <div className="lg:col-span-1">
            <SideFilterPanel
              onFiltersChange={setFilters}
              facilities={facilities}
            />
          </div>

          {/* Основной контент */}
          <div className="lg:col-span-3 space-y-4">
            {/* Краткая сводка */}
            <QuickSummary facilities={filteredFacilities} />

            {/* Карта */}
            <FacilityMap
              facilities={filteredFacilities}
              className="h-[600px]"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
