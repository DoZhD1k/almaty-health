"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { MedicalFilterPanel } from "@/components/medical-filter-panel";
import { Hospital, MedicalFilterState, SeismicPoint } from "@/types/healthcare";
import { healthcareApi } from "@/lib/api/healthcare";
import { Filter, X } from "lucide-react";
import { OrgTypeGridPanel } from "@/components/map/OrgTypeGridPanel";
import { DistrictSummaryModal } from "@/components/modals/DistrictSummaryModal";
import { NonresidentsModal } from "@/components/modals/NonresidentsModal";
import { RefusalsModal } from "@/components/modals/RefusalsModal";

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
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [focusedHospitalId, setFocusedHospitalId] = useState<number | null>(null);
  const [showDistrictSummary, setShowDistrictSummary] = useState(false);
  const [nonresidentsData, setNonresidentsData] = useState<any[]>([]);
  const [showNonresidents, setShowNonresidents] = useState(false);
  const [showRefusalsPanel, setShowRefusalsPanel] = useState(false);
  const [focusedRefusal, setFocusedRefusal] = useState<any | null>(null);
  const [filters, setFilters] = useState<MedicalFilterState>({
    district: "Все районы",
    facilityTypes: [],
    // bedProfiles: [],
    loadLevels: ["vlow", "low", "norm", "high", "vhigh", "over"], 
    searchQuery: "",
    mapMode: "load",
    showSeismicGrid: false,
    selectedTechConditions: [],
    geoAccessMode: "current",
    activeGeoLayers: ["zones"],
    selectedOrgTypeForGrid: null,
    ownTypes: ["Городская", "Частная", "Республиканская", "Ведомственная"],
  });

  const [refusalsData, setRefusalsData] = useState<any>(null);
  const [plannedZones, setPlannedZones] = useState<any>(null);
  const [plannedObjects, setPlannedObjects] = useState<any>(null);
  const [gridCells, setGridCells] = useState<any>(null);

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    setLoading(true);
    try {
      const [
        hospRes, 
        seismicRes, 
        refusalsRes,
        zonesRes,
        plannedRes,
        recsRes,
        nonRes,
      ] = await Promise.all([
        healthcareApi.getHospitals(),
        healthcareApi.getSeismicPoints(),
        healthcareApi.getRefusals(),
        healthcareApi.getPlannedZones(),
        healthcareApi.getPlannedObjects(),
        fetch("/geo-files/recommendations.json").then(res => res.json()), 
        healthcareApi.getNonresidents(),
      ]);

      setHospitals(hospRes.results);
      setSeismicData(seismicRes);
      // setRefusalsData(refusalsRes.results);
      setRefusalsData(refusalsRes);
      setPlannedZones(zonesRes);
      setRecommendations(recsRes);
      setNonresidentsData(nonRes);
      console.log("Planned zones loaded:", zonesRes.features.length);

      const filteredPlanned = {
        ...plannedRes,
        features: plannedRes.features.filter((feature: any) => 
          ["Больница", "Многопрофильная Больница"].includes(feature.properties.obj_type)
        )
      };

      console.log(`Planned Objects: total ${plannedRes.features.length}, filtered hospitals: ${filteredPlanned.features.length}`);
      setPlannedObjects(filteredPlanned);

      console.log("Starting grid cells load...");
      const gridRes = await healthcareApi.getGridCells();
      console.log("Grid cells loaded:", gridRes.features.length);
      setGridCells(gridRes);
    } catch (error) {
      console.error("Ошибка при загрузке гео-данных:", error);
      setError("Не удалось загрузить данные для Геоанализа");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filters.activeGeoLayers.includes("refusals")) {
      setShowRefusalsPanel(true);
    } else {
      setShowRefusalsPanel(false);
    }
  }, [filters.activeGeoLayers]);

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

        if (
          filters.facilityTypes.length > 0 &&
          !filters.facilityTypes.includes(hospital.org_type)
        ) {
          return false;
        }

        // if (
        //   filters.bedProfiles.length > 0 &&
        //   !filters.bedProfiles.includes(hospital.ownership)
        // ) {
        //   return false;
        // }

        if (filters.ownTypes.length > 0) {
          if (!filters.ownTypes.includes(hospital.own_type)) return false;
        }

      // app/page.tsx -> внутри useMemo для filteredHospitals

        if (filters.mapMode === "buildings") {
          if (filters.selectedTechConditions.length > 0) {
            let conditionKey = "gray";

            if (hospital.bld_emergency === true) {
              conditionKey = "dark-red";
            } 
            else if (hospital.bld_condition?.includes("Аварийное")) {
              conditionKey = "red";
            } 
            else if (hospital.bld_seismic === true) {
              conditionKey = "orange";
            } 
            else if (
              hospital.bld_condition?.includes("Ветхое") || 
              hospital.bld_condition?.includes("Неудовлетворительное")
            ) {
              conditionKey = "yellow";
            } 
            else if (hospital.bld_condition?.includes("Исправное")) {
              conditionKey = "green";
            }
            if (!filters.selectedTechConditions.includes(conditionKey)) {
              return false;
            }
          }
        }

      if (filters.mapMode === "load") {
        if (filters.loadLevels.length > 0 && !filters.loadLevels.includes(hospital.occ_cat)) {
          return false;
        }
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
      <div className="absolute inset-0 z-0">
        <MapLibreFacilityMap
          facilities={filteredHospitals}
          fullscreen={true}
          selectedDistrict={filters.district}
          mapMode={filters.mapMode}
          seismicData={seismicData}
          showSeismicGrid={filters.showSeismicGrid}

          refusalsData={refusalsData?.results || []}
          plannedZones={plannedZones}
          plannedObjects={plannedObjects}
          gridCells={gridCells}
          geoAccessMode={filters.geoAccessMode}
          activeGeoLayers={filters.activeGeoLayers}
          recommendations={recommendations}

          selectedOrgTypeForGrid={filters.selectedOrgTypeForGrid}
          focusedHospitalId={focusedHospitalId}
          focusedRefusal={focusedRefusal}
        />
      </div>

      {filters.activeGeoLayers.includes("orgTypeGrid") && (
        <OrgTypeGridPanel 
          onClose={() => setFilters({
            ...filters, 
            activeGeoLayers: filters.activeGeoLayers.filter(l => l !== "orgTypeGrid"),
            selectedOrgTypeForGrid: null
          })}
          hospitals={hospitals}
          selectedType={filters.selectedOrgTypeForGrid}
          onSelectType={(type) => {
            setFilters({ ...filters, selectedOrgTypeForGrid: type });
            setFocusedHospitalId(null);
          }}
          onHospitalClick={(h) => {
            setFocusedHospitalId(h.unified_id);
          }}
        />
      )}

      <div className="px-4 pb-4 space-y-2">
        <button 
          onClick={() => { setShowDistrictSummary(!showDistrictSummary); setShowNonresidents(false); }}
          className="w-full py-2 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          📋 Сводка по районам
        </button>
        <button 
          onClick={() => { setShowNonresidents(!showNonresidents); setShowDistrictSummary(false); }}
          className="w-full py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          🚑 Иногородние пациенты
        </button>
      </div>

      {showDistrictSummary && (
        <DistrictSummaryModal 
          onClose={() => setShowDistrictSummary(false)} 
          facilities={filteredHospitals} 
        />
      )}
      {showNonresidents && (
        <NonresidentsModal 
          onClose={() => setShowNonresidents(false)} 
          data={nonresidentsData} 
        />
      )}

      {filters.mapMode === "geo" && showRefusalsPanel && (
        <RefusalsModal 
          data={refusalsData} 
          onClose={() => {
            setShowRefusalsPanel(false);
          }}
          onItemClick={(item) => setFocusedRefusal({...item, timestamp: Date.now()})}
        />
      )}

      <div className="hidden lg:block absolute top-4 left-4 z-10 w-80 max-h-[calc(100vh-32px)] overflow-y-auto">
        <MedicalFilterPanel
          onFiltersChange={(newFilters) => setFilters(newFilters)}
          facilities={hospitals}
          className="shadow-lg"
          onShowDistrictSummary={() => {
            setShowDistrictSummary(!showDistrictSummary);
            setShowNonresidents(false);
          }}
          onShowNonresidents={() => {
            setShowNonresidents(!showNonresidents);
            setShowDistrictSummary(false);
          }}
        />
      </div>

      <div className="lg:hidden absolute bottom-6 left-4 z-10">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 rounded-full bg-[#4169E1] px-4 py-3 text-white shadow-xl hover:bg-[#3558c0] active:scale-95 transition-all"
        >
          <Filter className="h-5 w-5" />
          <span className="text-sm font-medium">Фильтры</span>
        </button>
      </div>

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
              onShowDistrictSummary={() => {
                setShowDistrictSummary(!showDistrictSummary);
                setShowNonresidents(false);
              }}
              onShowNonresidents={() => {
                setShowNonresidents(!showNonresidents);
                setShowDistrictSummary(false);
              }}
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
