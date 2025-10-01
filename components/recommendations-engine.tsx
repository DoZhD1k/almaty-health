"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { OverloadAlerts } from "./recommendations/overload-alerts";
import { PatientRouting } from "./recommendations/patient-routing";
import {
  AlertTriangle,
  Route,
  TrendingUp,
  RefreshCw,
  Clock,
} from "lucide-react";

export function RecommendationsEngine() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLastUpdated(new Date());
    setIsRefreshing(false);
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
      <Alert className="border-destructive bg-destructive/10">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Критические уведомления</AlertTitle>
        <AlertDescription>
          Система мониторинга обнаружила перегруженные медицинские организации.
          Рекомендуется принять меры по перераспределению пациентов.
        </AlertDescription>
      </Alert>

      {/* Main Tabs */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="alerts" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Уведомления о перегрузке
          </TabsTrigger>
          <TabsTrigger value="routing" className="gap-2">
            <Route className="h-4 w-4" />
            Маршрутизация пациентов
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <OverloadAlerts />
        </TabsContent>

        <TabsContent value="routing">
          <PatientRouting />
        </TabsContent>
      </Tabs>
    </div>
  );
}
