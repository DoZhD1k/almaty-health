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
} from "@/lib/utils/distance";
import { FormulaInfoDialog } from "./formula-info-dialog";

interface RedirectionData {
  source: FacilityStatistic;
  alternatives: AlternativeFacility[];
  redirectCount: number;
}

interface RedirectionRecommendationsProps {
  onShowRoute?: (source: FacilityStatistic, target: FacilityStatistic) => void;
}

export function RedirectionRecommendations({
  onShowRoute,
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
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
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
                  Нажмите <strong>&quot;На карте&quot;</strong> чтобы увидеть
                  визуальный маршрут перенаправления между медицинскими
                  организациями.
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
      </Card>

      {/* Formula Info Dialog */}
      <FormulaInfoDialog
        open={isFormulaDialogOpen}
        onOpenChange={setIsFormulaDialogOpen}
      />

      {/* Заголовок с статистикой */}
      <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div>
              <h3 className="text-lg font-semibold">
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
      <div className="space-y-6">
        {redirections.map((redirection, index) => {
          const risk = getRiskLevel(redirection.source.occupancy_rate_percent);
          const currentLoad = Math.round(
            redirection.source.occupancy_rate_percent * 100
          );

          return (
            <Card
              key={redirection.source.id}
              className="overflow-hidden border-l-4 border-l-orange-500"
            >
              <CardHeader className="bg-muted/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={`${risk.color} text-white`}>
                        {risk.label}
                      </Badge>
                      <span className="text-2xl font-bold text-red-600">
                        {currentLoad}%
                      </span>
                    </div>
                    <CardTitle className="text-xl">
                      {redirection.source.medical_organization}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <MapPin className="h-4 w-4" />
                      {redirection.source.district} район
                      <span className="mx-2">•</span>
                      <Bed className="h-4 w-4" />
                      {redirection.source.beds_deployed_withdrawn_for_rep} коек
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Рекомендация по перенаправлению */}
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Navigation className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        Рекомендуется перенаправить {redirection.redirectCount}{" "}
                        пациентов
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Это снизит загруженность до оптимального уровня 85%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Альтернативные МО */}
                {redirection.alternatives.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase">
                      Рекомендованные альтернативы
                    </h4>

                    <div className="grid gap-3">
                      {redirection.alternatives.map((alt, altIndex) => {
                        const altLoad = Math.round(
                          alt.facility.occupancy_rate_percent * 100
                        );

                        return (
                          <div
                            key={alt.facility.id}
                            className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            {/* Номер альтернативы */}
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                {altIndex + 1}
                              </div>
                            </div>

                            {/* Информация об МО */}
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium truncate">
                                {alt.facility.medical_organization}
                              </h5>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {alt.distance.toFixed(1)} км
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />~{alt.travelTime}{" "}
                                  мин
                                </div>
                                <div className="flex items-center gap-1">
                                  <Bed className="h-3 w-3" />
                                  {alt.availableBeds} своб. коек
                                </div>
                              </div>
                            </div>

                            {/* Загруженность */}
                            <div className="flex-shrink-0 text-right">
                              <div className="text-sm font-medium mb-1">
                                {altLoad}%
                              </div>
                              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${getLoadColor(
                                    alt.facility.occupancy_rate_percent
                                  )} transition-all progress-${
                                    Math.round(altLoad / 5) * 5
                                  }`}
                                />
                              </div>
                            </div>

                            {/* Кнопка карты */}
                            {onShowRoute && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  onShowRoute(redirection.source, alt.facility)
                                }
                                className="flex-shrink-0"
                              >
                                <Navigation className="h-4 w-4 mr-2" />
                                На карте
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                          Альтернативы не найдены
                        </h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          В радиусе 15 км нет менее загруженных МО с доступными
                          койками
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Дополнительные рекомендации */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold text-sm mb-3">
                    Дополнительные меры:
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 mt-0.5 text-primary" />
                      <span>
                        Оптимизировать график выписки пациентов для освобождения
                        коек
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 mt-0.5 text-primary" />
                      <span>
                        Координация с СМП для перенаправления новых вызовов
                      </span>
                    </li>
                    {currentLoad > 90 && (
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 mt-0.5 text-primary" />
                        <span className="text-red-600 font-medium">
                          Активировать резервные койки и дополнительный персонал
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
