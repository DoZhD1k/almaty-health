"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { MedicalFilterPanel } from "@/components/medical-filter-panel";
import { FacilityStatistic, MedicalFilterState } from "@/types/healthcare";
import { healthcareApi } from "@/lib/api/healthcare";
import { Filter, X } from "lucide-react";

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
  },
);

export default function HomePage() {
  const [facilities, setFacilities] = useState<FacilityStatistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<MedicalFilterState>({
    district: "Все районы",
    facilityTypes: [],
    bedProfiles: [],
    loadLevels: [],
    searchQuery: "",
  });

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Loading facilities from API...");
      const response = await healthcareApi.getFacilityStatistics();
      console.log("API response received:", response);

      if (response.results && response.results.length > 0) {
        setFacilities(response.results);
        console.log(`Loaded ${response.results.length} facilities`);
      } else {
        console.warn("No facilities data in response:", response);
        setError("Нет данных для отображения");
      }
    } catch (error) {
      console.error("Error loading facilities:", error);
      const errorMessage =
        error instanceof Error
          ? `Ошибка подключения к серверу: ${error.message}`
          : "Ошибка подключения к серверу";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredFacilities = useMemo(() => {
    return facilities.filter((facility) => {
      // Search filter
      if (
        filters.searchQuery &&
        !facility.medical_organization
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase())
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
        filters.facilityTypes.length > 0 &&
        !filters.facilityTypes.includes(facility.facility_type)
      ) {
        return false;
      }

      // Bed profile filter
      if (
        filters.bedProfiles.length > 0 &&
        !filters.bedProfiles.includes(facility.bed_profile)
      ) {
        return false;
      }

      // Load level filter
      if (filters.loadLevels.length > 0) {
        const loadLevelOptions = [
          { id: "low", minOccupancy: 0, maxOccupancy: 0.5 },
          { id: "normal", minOccupancy: 0.5, maxOccupancy: 0.8 },
          { id: "high", minOccupancy: 0.8, maxOccupancy: 0.95 },
          { id: "critical", minOccupancy: 0.95, maxOccupancy: 1 },
        ];

        const matchesAnyLoadLevel = filters.loadLevels.some((loadLevelId) => {
          const loadLevel = loadLevelOptions.find((l) => l.id === loadLevelId);
          if (!loadLevel) return false;
          return (
            facility.occupancy_rate_percent >= loadLevel.minOccupancy &&
            facility.occupancy_rate_percent < loadLevel.maxOccupancy
          );
        });
        if (!matchesAnyLoadLevel) return false;
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

      {/* Floating Filter Panel - Desktop */}
      <div className="hidden lg:block absolute top-4 left-4 z-10 w-80 max-h-[calc(100vh-32px)] overflow-y-auto">
        <MedicalFilterPanel
          onFiltersChange={setFilters}
          facilities={facilities}
          className="shadow-lg"
        />
      </div>

      {/* Mobile: FAB to open filters */}
      <div className="lg:hidden absolute bottom-6 left-4 z-10">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 rounded-full bg-[#4169E1] px-4 py-3 text-white shadow-xl hover:bg-[#3558c0] active:scale-95 transition-all"
        >
          <Filter className="h-5 w-5" />
          <span className="text-sm font-medium">Фильтры</span>
        </button>
      </div>

      {/* Mobile: Fullscreen Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-white/98 backdrop-blur-sm animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">Фильтры</h2>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="flex items-center justify-center h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200"
              aria-label="Закрыть фильтры"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <MedicalFilterPanel
              onFiltersChange={(f) => {
                setFilters(f);
              }}
              facilities={facilities}
              className="border-0 shadow-none rounded-none"
            />
          </div>
          <div className="shrink-0 p-4 border-t border-gray-200">
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full rounded-xl bg-[#4169E1] py-3 text-white font-medium hover:bg-[#3558c0] active:scale-[0.98] transition-all"
            >
              Показать результаты ({filteredFacilities.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
