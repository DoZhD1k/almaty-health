"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MapPin, Bed, CheckCircle2 } from "lucide-react";
import { FacilityStatistic } from "@/types/healthcare";
import { healthcareApi } from "@/lib/api/healthcare";
import {
  findNearbyAlternatives,
  calculateRedirectionCount,
  AlternativeFacility,
} from "@/lib/utils/distance";

interface RedirectionData {
  source: FacilityStatistic;
  alternatives: AlternativeFacility[];
  redirectCount: number;
}

interface RedirectionRecommendationsProps {
  onSelectFacility?: (
    source: FacilityStatistic,
    alternatives: FacilityStatistic[],
  ) => void;
  selectedSourceId?: number;
  facilities?: FacilityStatistic[];
}

export function RedirectionRecommendations({
  onSelectFacility,
  selectedSourceId,
  facilities: externalFacilities,
}: RedirectionRecommendationsProps) {
  const [facilities, setFacilities] = useState<FacilityStatistic[]>([]);
  const [redirections, setRedirections] = useState<RedirectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRedirection, setSelectedRedirection] =
    useState<RedirectionData | null>(null);
  const [isFormulaDialogOpen, setIsFormulaDialogOpen] = useState(false);

  // Refs for scrolling to selected card
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Scroll to selected card when selectedSourceId changes
  useEffect(() => {
    if (selectedSourceId && cardRefs.current.has(selectedSourceId)) {
      const cardElement = cardRefs.current.get(selectedSourceId);
      cardElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedSourceId]);

  useEffect(() => {
    // If facilities are passed as props, use them
    if (externalFacilities && externalFacilities.length > 0) {
      processAndSetFacilities(externalFacilities);
    } else {
      loadFacilities();
    }
  }, [externalFacilities]);

  const processAndSetFacilities = (allFacilities: FacilityStatistic[]) => {
    setFacilities(allFacilities);

    // Находим перегруженные МО (> 85%)
    const overloaded = allFacilities
      .filter((f) => f.occupancy_rate_percent > 0.85)
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
    setLoading(false);
  };

  const loadFacilities = async () => {
    setLoading(true);
    try {
      const response = await healthcareApi.getFacilityStatistics();
      if (response.results && response.results.length > 0) {
        processAndSetFacilities(response.results);
      }
    } catch (error) {
      console.error("Error loading facilities:", error);
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

  // Функция для расчета требуемых дополнительных коек
  const calculateRequiredBeds = (facility: FacilityStatistic) => {
    const currentBeds = facility.beds_deployed_withdrawn_for_rep || 0;
    const currentOccupancy = facility.occupancy_rate_percent;
    const targetOccupancy = 0.85; // Желаемая загруженность 85%

    // Текущее количество занятых коек
    const occupiedBeds = Math.round(currentBeds * currentOccupancy);

    // Требуемое общее количество коек для 85% загруженности
    const requiredTotalBeds = Math.ceil(occupiedBeds / targetOccupancy);

    // Дополнительные койки, которые нужно добавить
    const additionalBeds = requiredTotalBeds - currentBeds;

    return {
      occupiedBeds,
      requiredTotalBeds,
      additionalBeds: Math.max(0, additionalBeds),
    };
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
            redirection.source.occupancy_rate_percent * 100,
          );

          return (
            <Card
              key={redirection.source.id}
              ref={(el) => {
                if (el) {
                  cardRefs.current.set(redirection.source.id, el);
                }
              }}
              className={`overflow-hidden border-l-4 border-l-orange-500 cursor-pointer transition-all ${
                selectedSourceId === redirection.source.id
                  ? "ring-2 ring-primary shadow-lg"
                  : "hover:shadow-md"
              }`}
              onClick={() => {
                if (onSelectFacility) {
                  onSelectFacility(
                    redirection.source,
                    redirection.alternatives.map((alt) => alt.facility),
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
                {(() => {
                  const bedCalc = calculateRequiredBeds(redirection.source);
                  return (
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2">
                        <Bed className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <div className="text-sm">
                          <span className="font-medium text-blue-900 dark:text-blue-100">
                            Требуется {bedCalc.additionalBeds} дополнительных
                            коек
                          </span>
                          <span className="text-blue-700 dark:text-blue-300 block">
                            → для загруженности 85%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Компактные альтернативы */}
                {redirection.alternatives.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Альтернативы: {redirection.alternatives.length}
                    </h4>

                    <div className="space-y-1.5">
                      {redirection.alternatives
                        .slice(0, 5)
                        .map((alt, altIndex) => {
                          const altLoad = Math.round(
                            alt.facility.occupancy_rate_percent * 100,
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
                                  <span>
                                    {
                                      alt.facility
                                        .beds_deployed_withdrawn_for_rep
                                    }
                                    коек
                                  </span>
                                  <span>•</span>
                                  <span>{alt.availableBeds}своб</span>
                                </div>
                                <div className="text-xs text-blue-600 dark:text-blue-400 truncate mt-0.5">
                                  {alt.facility.facility_type}
                                </div>
                              </div>

                              {/* Загруженность */}
                              <div className="text-right flex-shrink-0 min-w-[60px]">
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
                                <div className="text-xs text-muted-foreground">
                                  загруженность
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded border border-red-200 dark:border-red-800">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                        <span className="font-medium text-red-900 dark:text-red-100 text-sm">
                          Альтернативы не найдены
                        </span>
                      </div>

                      {(() => {
                        const bedCalc = calculateRequiredBeds(
                          redirection.source,
                        );
                        return (
                          <div className="ml-6 space-y-1 text-sm">
                            <p className="text-red-700 dark:text-red-300">
                              Нет совместимых МО в радиусе 15 км
                            </p>
                            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded border">
                              <p className="font-medium text-red-900 dark:text-red-100">
                                Для загруженности 85% требуется увеличение на{" "}
                                {bedCalc.additionalBeds} коек
                              </p>
                            </div>
                          </div>
                        );
                      })()}
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
