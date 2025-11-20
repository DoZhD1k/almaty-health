"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OverloadAlerts } from "@/components/recommendations/overload-alerts";
import { RedirectionRecommendations } from "@/components/recommendations/redirection-recommendations";
import { RedirectionMap } from "@/components/recommendations/redirection-map";
import {
  AlertTriangle,
  Route,
  RefreshCw,
  Clock,
  Navigation,
} from "lucide-react";
import { FacilityStatistic } from "@/types/healthcare";

export function RecommendationsEngine() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<{
    source: FacilityStatistic | null;
    target: FacilityStatistic | null;
  }>({ source: null, target: null });
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const handleShowRoute = (
    source: FacilityStatistic,
    target: FacilityStatistic
  ) => {
    setSelectedRoute({ source, target });
    setIsMapDialogOpen(true);
  };

  const handleCloseRoute = () => {
    setIsMapDialogOpen(false);
    // Wait for animation to complete before clearing
    setTimeout(() => {
      setSelectedRoute({ source: null, target: null });
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Обновлено: {lastUpdated.toLocaleTimeString("ru-RU")}
          </div>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="gap-2 bg-transparent"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Обновить
        </Button>
      </div>

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
          <TabsTrigger value="alerts" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Уведомления о перегрузке
          </TabsTrigger>
        </TabsList>

        <TabsContent value="redirections" className="space-y-6">
          {/* Recommendations List */}
          <RedirectionRecommendations onShowRoute={handleShowRoute} />
        </TabsContent>

        <TabsContent value="alerts">
          <OverloadAlerts />
        </TabsContent>
      </Tabs>

      {/* Map Dialog */}
      <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
        <DialogContent className="min-w-[65vw] max-w-[90vw] max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Маршрут перенаправления
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-4">
            <RedirectionMap
              source={selectedRoute.source}
              target={selectedRoute.target}
              onClose={handleCloseRoute}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
