"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { MedicalFilterPanel } from "@/components/medical-filter-panel";
import { Hospital, MedicalFilterState, SeismicPoint } from "@/types/healthcare";
import { healthcareApi } from "@/lib/api/healthcare";
import { Filter, X } from "lucide-react";

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
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [seismicData, setSeismicData] = useState<SeismicPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<MedicalFilterState>({
    district: "Все районы",
    facilityTypes: [],
    bedProfiles: [],
    loadLevels: ["vlow", "low", "norm", "high", "vhigh", "over"], 
    searchQuery: "",
    mapMode: "load",
    showSeismicGrid: false,
    selectedTechConditions: ["dark-red", "red", "orange", "yellow", "green", "gray"],
  });

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    setLoading(true);
    try {
      const [hospRes, seismicRes] = await Promise.all([
        healthcareApi.getHospitals(),
        healthcareApi.getSeismicPoints(),
      ]);
      setHospitals(hospRes.results);
      setSeismicData(seismicRes);
    } catch (error) {
      setError("Ошибка загрузки больниц");
    } finally {
      setLoading(false);
    }
  };
  
  const filteredHospitals = useMemo(() => {
    return hospitals.filter((hospital) => {
      if (
        filters.searchQuery &&
        !hospital.name
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (
        filters.district !== "Все районы" &&
        hospital.district !== filters.district
      ) {
        return false;
      }

      // if (filters.mapMode === "load") {
        if (
          filters.facilityTypes.length > 0 &&
          !filters.facilityTypes.includes(hospital.org_type)
        ) {
          return false;
        }

        if (
          filters.bedProfiles.length > 0 &&
          !filters.bedProfiles.includes(hospital.ownership)
        ) {
          return false;
        }

        if (filters.loadLevels.length > 0 && filters.loadLevels.length < 6) {
          if (!filters.loadLevels.includes(hospital.occ_cat)) {
            return false;
          }
        }
      // }

      if (filters.mapMode === "buildings") {
        let condition = "gray"; // default
        
        // ВАЖНО: Эта логика должна быть идентична MapLibre paint свойству
        if (hospital.bld_priority === "срочно") condition = "dark-red";
        else if (hospital.bld_condition?.includes("Аварийное")) condition = "red";
        // else if (hospital.bld_seismic) condition = "orange"; // Если в объекте есть seismic
        else if (hospital.bld_priority === "плановый") condition = "yellow";
        else if (hospital.bld_condition?.includes("Исправное")) condition = "green";
        else condition = "gray";

        if (!filters.selectedTechConditions.includes(condition)) return false;
      }

      return true;
    });
  }, [hospitals, filters]);

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
            onClick={loadHospitals}
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
          facilities={filteredHospitals}
          fullscreen={true}
          selectedDistrict={filters.district}
          mapMode={filters.mapMode}
        />
      </div>

      {/* Floating Filter Panel - Desktop */}
      <div className="hidden lg:block absolute top-4 left-4 z-10 w-80 max-h-[calc(100vh-32px)] overflow-y-auto">
        <MedicalFilterPanel
          onFiltersChange={(newFilters) => setFilters(newFilters)}
          facilities={hospitals}
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
              facilities={hospitals}
              className="border-0 shadow-none rounded-none"
            />
          </div>
          <div className="shrink-0 p-4 border-t border-gray-200">
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full rounded-xl bg-[#4169E1] py-3 text-white font-medium hover:bg-[#3558c0] active:scale-[0.98] transition-all"
            >
              Показать результаты ({filteredHospitals.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
