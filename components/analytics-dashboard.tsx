"use client";

import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FacilityStatistic,
  HospitalizationStatistic,
} from "@/types/healthcare";
import { AnalyticsFilters } from "./analytics/filters";
import { KeyMetrics } from "./analytics/cards";
import { ComparisonTab } from "./analytics/tabs/comparison-tab";
import { SmpVtmpTab } from "./analytics/tabs/smp-vtmp-tab";
import { DistrictsTab } from "./analytics/tabs/districts-tab";
import { DetailedFacilitiesTable } from "./analytics/cards/detailed-facilities-table";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [facilitiesResponse, hospitalizationsResponse] =
          await Promise.all([
            fetch("/api/facilities/statistics"),
            fetch("/api/hospitalizations/statistics"),
          ]);

        if (!facilitiesResponse.ok || !hospitalizationsResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const facilitiesData = await facilitiesResponse.json();
        const hospitalizationsData = await hospitalizationsResponse.json();

        setFacilities(facilitiesData);
        setHospitalizations(hospitalizationsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredFacilities = useMemo(() => {
    return facilities.filter((facility) => {
      if (
        selectedDistricts.length > 0 &&
        !selectedDistricts.includes(facility.district || "")
      ) {
        return false;
      }
      if (
        selectedFacilityTypes.length > 0 &&
        !selectedFacilityTypes.includes(facility.facility_type || "")
      ) {
        return false;
      }
      if (
        selectedBedProfiles.length > 0 &&
        !selectedBedProfiles.includes(facility.bed_profile || "")
      ) {
        return false;
      }
      return true;
    });
  }, [
    facilities,
    selectedDistricts,
    selectedFacilityTypes,
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Аналитическая панель здравоохранения
        </h1>
      </div>

      <AnalyticsFilters
        facilities={facilities}
        selectedDistricts={selectedDistricts}
        selectedFacilityTypes={selectedFacilityTypes}
        selectedBedProfiles={selectedBedProfiles}
        onDistrictsChange={setSelectedDistricts}
        onFacilityTypesChange={setSelectedFacilityTypes}
        onBedProfilesChange={setSelectedBedProfiles}
      />

      <KeyMetrics
        filteredFacilities={filteredFacilities}
        hospitalizations={hospitalizations}
      />

      <Tabs defaultValue="comparison" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-fit">
          <TabsTrigger value="comparison">Сравнение</TabsTrigger>
          <TabsTrigger value="smp-vtmp">СМП/ВТМП</TabsTrigger>
          <TabsTrigger value="districts">Районы</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison">
          <ComparisonTab filteredFacilities={filteredFacilities} />
        </TabsContent>

        <TabsContent value="smp-vtmp">
          <SmpVtmpTab
            filteredFacilities={filteredFacilities}
            hospitalizations={hospitalizations}
          />
        </TabsContent>

        <TabsContent value="districts">
          <DistrictsTab filteredFacilities={filteredFacilities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
