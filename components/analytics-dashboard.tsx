"use client";

import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FacilityStatistic,
  HospitalizationStatistic,
} from "@/types/healthcare";
import { healthcareApi } from "@/lib/api/healthcare";
import { AnalyticsFilters } from "./analytics/filters";
import { KeyMetrics } from "./analytics/cards";
import { ComparisonTab } from "./analytics/tabs/comparison-tab";
import { SmpVtmpTab } from "./analytics/tabs/smp-vtmp-tab";
import { DistrictsTab } from "./analytics/tabs/districts-tab";
import { DetailedFacilitiesTable } from "./analytics/cards/detailed-facilities-table";
import { ProblemsAlert } from "./analytics/problems-alert";

export function AnalyticsDashboard() {
  const [facilities, setFacilities] = useState<FacilityStatistic[]>([]);
  const [hospitalizations, setHospitalizations] = useState<
    HospitalizationStatistic[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedFacilityTypes, setSelectedFacilityTypes] = useState<string[]>(
    []
  );
  const [selectedBedProfiles, setSelectedBedProfiles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("🚀 Loading analytics data...");

        const [facilitiesResponse, hospitalizationsResponse] =
          await Promise.all([
            healthcareApi.getFacilityStatistics(),
            healthcareApi.getHospitalizationStatistics(),
          ]);

        console.log("✅ Analytics data loaded successfully");
        setFacilities(facilitiesResponse.results || []);
        setHospitalizations(hospitalizationsResponse.results || []);
      } catch (err) {
        console.error("💥 Analytics data loading failed:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredFacilities = useMemo(() => {
    return facilities.filter((facility) => {
      // Фильтр по районам
      if (
        selectedDistricts.length > 0 &&
        !selectedDistricts.includes(facility.district || "")
      ) {
        return false;
      }
      // Фильтр по типам учреждений
      if (
        selectedFacilityTypes.length > 0 &&
        !selectedFacilityTypes.includes(facility.facility_type || "")
      ) {
        return false;
      }
      // Фильтр по профилям коек
      if (
        selectedBedProfiles.length > 0 &&
        !selectedBedProfiles.includes(facility.bed_profile || "")
      ) {
        return false;
      }
      // Поиск по всем текстовым полям
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const searchFields = [
          facility.medical_organization,
          facility.district,
          facility.facility_type,
          facility.bed_profile,
          facility.ownership_type,
          facility.address,
          facility.emergency_mo,
        ];
        const matches = searchFields.some((field) =>
          field?.toLowerCase().includes(query)
        );
        if (!matches) return false;
      }
      return true;
    });
  }, [
    facilities,
    selectedDistricts,
    selectedFacilityTypes,
    searchQuery,
    selectedBedProfiles,
  ]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3">
      <div className="mb-2">
        <h1 className="text-lg font-bold text-gray-800 mb-0.5">
          Аналитическая панель
        </h1>
        <p className="text-[11px] text-gray-600">
          Комплексный анализ медицинских учреждений Алматы
        </p>
      </div>

      {/* Объединенная панель: Фильтры + KPI */}
      <div className="rounded-lg p-2.5 border border-[rgb(var(--blue-light-active))] bg-gradient-to-r from-[rgb(var(--blue-light))] to-[rgb(var(--blue-light-hover))]">
        {/* Верхний ряд: Фильтры */}
        <div className="mb-2">
          <AnalyticsFilters
            facilities={facilities}
            selectedDistricts={selectedDistricts}
            selectedFacilityTypes={selectedFacilityTypes}
            selectedBedProfiles={selectedBedProfiles}
            searchQuery={searchQuery}
            onDistrictsChange={setSelectedDistricts}
            onFacilityTypesChange={setSelectedFacilityTypes}
            onBedProfilesChange={setSelectedBedProfiles}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Нижний ряд: Компактные KPI метрики */}
        <KeyMetrics
          filteredFacilities={filteredFacilities}
          hospitalizations={hospitalizations}
        />
      </div>

      {/* Анализ проблем и рекомендации */}
      <ProblemsAlert filteredFacilities={filteredFacilities} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <Tabs defaultValue="comparison" className="p-3">
          <TabsList className="grid grid-cols-2 w-fit bg-gray-100 p-1 rounded-lg mb-3">
            <TabsTrigger
              value="comparison"
              className="rounded-md px-3 py-1 text-xs font-medium"
            >
              Сравнение
            </TabsTrigger>
            <TabsTrigger
              value="smp-vtmp"
              className="rounded-md px-3 py-1 text-xs font-medium"
            >
              СМП/ВТМП
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comparison" className="mt-0">
            <ComparisonTab
              filteredFacilities={filteredFacilities}
              selectedDistricts={selectedDistricts}
              selectedFacilityTypes={selectedFacilityTypes}
              selectedBedProfiles={selectedBedProfiles}
              searchQuery={searchQuery}
            />
          </TabsContent>

          <TabsContent value="smp-vtmp" className="mt-0">
            <SmpVtmpTab
              filteredFacilities={filteredFacilities}
              hospitalizations={hospitalizations}
              selectedDistricts={selectedDistricts}
              selectedFacilityTypes={selectedFacilityTypes}
              selectedBedProfiles={selectedBedProfiles}
              searchQuery={searchQuery}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
