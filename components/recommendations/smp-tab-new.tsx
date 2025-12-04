"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AnalyticsMap } from "@/components/map/AnalyticsMap";
import { Building2, TrendingUp } from "lucide-react";

interface SmpTabProps {
  className?: string;
}

export function SmpTab({ className = "" }: SmpTabProps) {
  const [showRecommendations, setShowRecommendations] = useState(false);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Карта оптимального покрытия */}
      <Card className="flex flex-col h-[calc(100vh-280px)] min-h-[700px]">
        <CardHeader className="flex-none py-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Карта оптимального покрытия доступностью
                {showRecommendations && (
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-700"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />С рекомендациями
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {showRecommendations
                  ? "Прогноз покрытия с учётом рекомендуемых новых СМП"
                  : "Текущее состояние транспортной доступности медицинских организаций"}
              </CardDescription>
            </div>

            {/* Свитчер */}
            <div className="flex items-center space-x-3 bg-muted/50 rounded-lg px-4 py-2">
              <Label
                htmlFor="show-recommendations"
                className={`text-sm cursor-pointer ${
                  !showRecommendations ? "font-medium" : "text-muted-foreground"
                }`}
              >
                Текущее
              </Label>
              <Switch
                id="show-recommendations"
                checked={showRecommendations}
                onCheckedChange={setShowRecommendations}
              />
              <Label
                htmlFor="show-recommendations"
                className={`text-sm cursor-pointer flex items-center gap-1 ${
                  showRecommendations
                    ? "font-medium text-emerald-600"
                    : "text-muted-foreground"
                }`}
              >
                <Building2 className="h-4 w-4" />С новыми СМП
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <AnalyticsMap
            className="w-full h-full"
            showRecommendations={showRecommendations}
          />
        </CardContent>
      </Card>
    </div>
  );
}
