"use client";

import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RedirectionRecommendations } from "@/components/recommendations/redirection-recommendations";
import { RedirectionMap } from "@/components/recommendations/redirection-map";
import { SmpTab } from "./recommendations/smp-tab";
import { AnalyticsFilters } from "@/components/analytics/filters";
import { Route, Ambulance } from "lucide-react";
import { FacilityStatistic } from "@/types/healthcare";
import { healthcareApi } from "@/lib/api/healthcare";

export function RecommendationsEngine() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSource, setSelectedSource] =
    useState<FacilityStatistic | null>(null);
  const [selectedAlternatives, setSelectedAlternatives] = useState<
    FacilityStatistic[]
  >([]);
  const [allFacilities, setAllFacilities] = useState<FacilityStatistic[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedFacilityTypes, setSelectedFacilityTypes] = useState<string[]>(
    [],
  );
  const [selectedBedProfiles, setSelectedBedProfiles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    setLoading(true);
    try {
      const response = await healthcareApi.getFacilityStatistics();
      if (response.results && response.results.length > 0) {
        setAllFacilities(response.results);
      }
    } catch (error) {
      console.error("Error loading facilities:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtered facilities based on selected filters
  const filteredFacilities = useMemo(() => {
    return allFacilities.filter((facility) => {
      // Filter by districts
      if (
        selectedDistricts.length > 0 &&
        !selectedDistricts.includes(facility.district || "")
      ) {
        return false;
      }
      // Filter by facility types
      if (
        selectedFacilityTypes.length > 0 &&
        !selectedFacilityTypes.includes(facility.facility_type || "")
      ) {
        return false;
      }
      // Filter by bed profiles
      if (
        selectedBedProfiles.length > 0 &&
        !selectedBedProfiles.includes(facility.bed_profile || "")
      ) {
        return false;
      }
      // Search by text fields
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
          field?.toLowerCase().includes(query),
        );
        if (!matches) return false;
      }
      return true;
    });
  }, [
    allFacilities,
    selectedDistricts,
    selectedFacilityTypes,
    searchQuery,
    selectedBedProfiles,
  ]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadFacilities();
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const handleSelectFacility = (
    source: FacilityStatistic,
    alternatives: FacilityStatistic[],
  ) => {
    setSelectedSource(source);
    setSelectedAlternatives(alternatives);
  };

  const handleClearSelection = () => {
    setSelectedSource(null);
    setSelectedAlternatives([]);
  };

  return (
    <div className="space-y-4">
      {/* Filters Panel */}
      <div className="rounded-lg p-2.5 border border-[rgb(var(--blue-light-active))] bg-gradient-to-r from-[rgb(var(--blue-light))] to-[rgb(var(--blue-light-hover))]">
        <AnalyticsFilters
          facilities={allFacilities}
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

      {/* Main Tabs */}
      <Tabs defaultValue="redirections" className="p-3">
        <TabsList className="grid grid-cols-2 w-fit bg-gray-100 p-1 rounded-lg mb-3">
          <TabsTrigger value="redirections" className="gap-2">
            <Route className="h-4 w-4" />
            Рекомендации по перенаправлению
          </TabsTrigger>
          <TabsTrigger value="smp" className="gap-2">
            <Ambulance className="h-4 w-4" />
            Рекомендации по СМП
          </TabsTrigger>
        </TabsList>

        <TabsContent value="redirections" className="space-y-0 mt-6">
          {/* Two Column Layout: Map (Left) + Recommendations (Right) */}
          <div className="grid grid-cols-[60%_40%] gap-4 min-h-[calc(100vh-280px)]">
            {/* Left: Map - Always Visible */}
            <div className="h-[calc(100vh-280px)] min-h-[700px]">
              <RedirectionMap
                source={selectedSource}
                targets={selectedAlternatives}
                allFacilities={filteredFacilities}
                onClose={handleClearSelection}
                onSelectFacility={handleSelectFacility}
              />
            </div>

            {/* Right: Scrollable Recommendations List */}
            <div className="h-[calc(100vh-280px)] overflow-y-auto pr-2 space-y-4">
              <RedirectionRecommendations
                onSelectFacility={handleSelectFacility}
                selectedSourceId={selectedSource?.id}
                facilities={filteredFacilities}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="smp" className="space-y-6">
          <SmpTab facilities={filteredFacilities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
