"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RedirectionRecommendations } from "@/components/recommendations/redirection-recommendations";
import { RedirectionMap } from "@/components/recommendations/redirection-map";
import { SmpTab } from "./recommendations/smp-tab-new";
import { AlertTriangle, Route, Ambulance } from "lucide-react";
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadFacilities();
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const handleSelectFacility = (
    source: FacilityStatistic,
    alternatives: FacilityStatistic[]
  ) => {
    setSelectedSource(source);
    setSelectedAlternatives(alternatives);
  };

  const handleClearSelection = () => {
    setSelectedSource(null);
    setSelectedAlternatives([]);
  };

  return (
    <div className="space-y-6">
      {/* Critical Alerts */}
      <Alert className="border-orange-500 bg-orange-50/50 dark:bg-orange-950/20">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-900 dark:text-orange-100">
          Система рекомендаций по перенаправлению
        </AlertTitle>
        <AlertDescription className="text-orange-700 dark:text-orange-300">
          Анализируем загруженность медицинских организаций и предлагаем
          оптимальные маршруты перенаправления пациентов для снижения нагрузки.
        </AlertDescription>
      </Alert>

      {/* Main Tabs */}
      <Tabs defaultValue="redirections" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="redirections" className="gap-2">
            <Route className="h-4 w-4" />
            Рекомендации по перенаправлению
          </TabsTrigger>
          <TabsTrigger value="smp" className="gap-2">
            <Ambulance className="h-4 w-4" />
            Рекомендации по новым СМП
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
                allFacilities={allFacilities}
                onClose={handleClearSelection}
                onSelectFacility={handleSelectFacility}
              />
            </div>

            {/* Right: Scrollable Recommendations List */}
            <div className="h-[calc(100vh-280px)] overflow-y-auto pr-2 space-y-4">
              <RedirectionRecommendations
                onSelectFacility={handleSelectFacility}
                selectedSourceId={selectedSource?.id}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="smp" className="space-y-6">
          {/* SMP Tab - Keep as is for now */}
          <SmpTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
