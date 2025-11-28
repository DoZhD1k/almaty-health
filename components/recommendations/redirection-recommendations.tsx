"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  MapPin,
  Navigation,
  Bed,
  ArrowRight,
  Clock,
  CheckCircle2,
  Info,
  Calculator,
} from "lucide-react";
import { FacilityStatistic } from "@/types/healthcare";
import { healthcareApi } from "@/lib/api/healthcare";
import {
  findNearbyAlternatives,
  calculateRedirectionCount,
  AlternativeFacility,
  isCompatibleFacilityType,
} from "@/lib/utils/distance";
// import { FormulaInfoDialog } from "./formula-info-dialog";

interface RedirectionData {
  source: FacilityStatistic;
  alternatives: AlternativeFacility[];
  redirectCount: number;
}

interface RedirectionRecommendationsProps {
  onSelectFacility?: (
    source: FacilityStatistic,
    alternatives: FacilityStatistic[]
  ) => void;
  selectedSourceId?: number;
}

export function RedirectionRecommendations({
  onSelectFacility,
  selectedSourceId,
}: RedirectionRecommendationsProps) {
  const [facilities, setFacilities] = useState<FacilityStatistic[]>([]);
  const [redirections, setRedirections] = useState<RedirectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRedirection, setSelectedRedirection] =
    useState<RedirectionData | null>(null);
  const [isFormulaDialogOpen, setIsFormulaDialogOpen] = useState(false);

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    setLoading(true);
    try {
      const response = await healthcareApi.getFacilityStatistics();
      if (response.results && response.results.length > 0) {
        const allFacilities = response.results;
        setFacilities(allFacilities);

        // Находим перегруженные МО (> 70%)
        const overloaded = allFacilities
          .filter((f) => f.occupancy_rate_percent > 0.7)
          .sort((a, b) => b.occupancy_rate_percent - a.occupancy_rate_percent);

        // Для каждого перегруженного МО находим альтернативы
        const redirectionData: RedirectionData[] = overloaded.map((source) => {
          const alternatives = findNearbyAlternatives(source, allFacilities);
          const redirectCount = calculateRedirectionCount(source);

          return {
            source,
            alternatives,
            redirectCount,
          };
        });

        setRedirections(redirectionData);
      }
    } catch (error) {
      console.error("Error loading facilities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (occupancy: number) => {
    if (occupancy > 0.9) return { label: "Критический", color: "bg-red-600" };
    if (occupancy > 0.8) return { label: "Высокий", color: "bg-orange-500" };
    return { label: "Средний", color: "bg-yellow-500" };
  };

  const getLoadColor = (occupancy: number) => {
    if (occupancy < 0.5) return "bg-green-500";
    if (occupancy < 0.7) return "bg-blue-500";
    return "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">
            Анализ данных и построение рекомендаций...
          </p>
        </div>
      </div>
    );
  }

  if (redirections.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Отличная ситуация!</h3>
          <p className="text-muted-foreground">
            На данный момент все медицинские организации работают в штатном
            режиме.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Информационная подсказка */}
      {/* <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Как работает система?
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Расстояния рассчитываются по{" "}
                  <strong>формуле Гаверсинусов</strong> с учетом кривизны Земли.
                  <strong className="block mt-1">
                    💡 Нажмите на карточку перегруженной больницы ниже
                  </strong>{" "}
                  чтобы увидеть все маршруты перенаправления на карте слева.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFormulaDialogOpen(true)}
              className="flex-shrink-0 gap-2"
            >
              <Calculator className="h-4 w-4" />
              Подробнее
            </Button>
          </div>
        </CardContent>
      </Card> */}

      {/* Formula Info Dialog */}
      {/* <FormulaInfoDialog
        open={isFormulaDialogOpen}
        onOpenChange={setIsFormulaDialogOpen}
      /> */}

      {/* Заголовок с статистикой */}
      <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
        <CardContent>
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div>
              <h3 className="text-sm font-semibold">
                Обнаружено {redirections.length} перегруженных МО
              </h3>
              <p className="text-sm text-muted-foreground">
                Рекомендуется перенаправить пациентов в ближайшие менее
                загруженные учреждения
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Карточки с рекомендациями */}
      <div className="space-y-3">
        {redirections.map((redirection, index) => {
          const risk = getRiskLevel(redirection.source.occupancy_rate_percent);
          const currentLoad = Math.round(
            redirection.source.occupancy_rate_percent * 100
          );

          return (
            <Card
              key={redirection.source.id}
              className={`overflow-hidden border-l-4 border-l-orange-500 cursor-pointer transition-all ${
                selectedSourceId === redirection.source.id
                  ? "ring-2 ring-primary shadow-lg"
                  : "hover:shadow-md"
              }`}
              onClick={() => {
                if (onSelectFacility) {
                  onSelectFacility(
                    redirection.source,
                    redirection.alternatives.map((alt) => alt.facility)
                  );
                }
              }}
            >
              <CardHeader className="bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        className={`${risk.color} text-white text-xs px-2 py-0.5`}
                      >
                        {risk.label}
                      </Badge>
                      <span className="text-xl font-bold text-red-600">
                        {currentLoad}%
                      </span>
                    </div>
                    <CardTitle className="text-base leading-tight truncate pr-2">
                      {redirection.source.medical_organization}
                    </CardTitle>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {redirection.source.district} район
                      </div>
                      <div className="flex items-center gap-1">
                        <Bed className="h-3 w-3" />
                        {
                          redirection.source.beds_deployed_withdrawn_for_rep
                        }{" "}
                        коек
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 bg-muted/30 px-2 py-1 rounded">
                      <span className="font-medium">Тип:</span>{" "}
                      {redirection.source.facility_type}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-2">
                {/* Компактная рекомендация */}
                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <div className="text-sm">
                      <span className="font-medium text-blue-900 dark:text-blue-100">
                        Перенаправить {redirection.redirectCount} пациентов
                      </span>
                      <span className="text-blue-700 dark:text-blue-300 block">
                        → загруженность до 85%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Компактные альтернативы */}
                {redirection.alternatives.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {redirection.alternatives.length} альтернатив
                    </h4>

                    <div className="space-y-1.5">
                      {redirection.alternatives
                        .slice(0, 5)
                        .map((alt, altIndex) => {
                          const altLoad = Math.round(
                            alt.facility.occupancy_rate_percent * 100
                          );

                          return (
                            <div
                              key={alt.facility.id}
                              className="flex items-center gap-2 p-2 border rounded text-sm hover:bg-muted/30 transition-colors"
                            >
                              {/* Номер */}
                              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {altIndex + 1}
                              </div>

                              {/* Название */}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-xs truncate">
                                  {alt.facility.medical_organization}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{alt.distance.toFixed(1)}км</span>
                                  <span>•</span>
                                  <span>~{alt.travelTime}мин</span>
                                  <span>•</span>
                                  <span>{alt.availableBeds}коек</span>
                                </div>
                                <div className="text-xs text-blue-600 dark:text-blue-400 truncate mt-0.5">
                                  {alt.facility.facility_type}
                                </div>
                              </div>

                              {/* Загруженность */}
                              <div className="text-right flex-shrink-0">
                                <div
                                  className={`text-xs font-medium ${
                                    altLoad < 50
                                      ? "text-green-600"
                                      : altLoad < 70
                                      ? "text-blue-600"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {altLoad}%
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                      <div className="text-sm">
                        <span className="font-medium text-yellow-900 dark:text-yellow-100">
                          Альтернативы не найдены
                        </span>
                        <span className="text-yellow-700 dark:text-yellow-300 block">
                          Нет МО в радиусе 15 км
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
