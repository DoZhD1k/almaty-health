"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalyticsMap } from "@/components/map/AnalyticsMap";
import { TrendingUp } from "lucide-react";

export function SmpTab() {
  const [showRecommendations, setShowRecommendations] = useState(false);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Карта оптимального покрытия */}
        <Card className="lg:col-span-2 lg:row-span-2 flex flex-col">
          <CardHeader>
            <CardTitle className="flex flex-col gap-1">
              Карта оптимального покрытия доступностью
            </CardTitle>
            <CardDescription>
              Прогноз покрытия с учётом рекомендуемых новых СМП
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-2">
            <AnalyticsMap className="w-full h-full" />
          </CardContent>
        </Card>

        <div className="gap-4 grid grid-cols-1">
          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle className="flex flex-col gap-1 text-center">
                <span>Количество госпитализированных и отказавшихся</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <div className="flex items-center gap-2 leading-none font-medium">
                Всего госпитализировано:
              </div>
              <div className="flex items-center gap-2 leading-none font-medium">
                Всего отказались:
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="text-muted-foreground leading-none"></div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col gap-1">
                <span>Сельские жители</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-hidden">
              <div className="flex items-center gap-2 leading-none font-medium">
                число %
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col gap-1">
                <span>Общее количество коек</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-hidden">
              <div className="flex items-center gap-2 leading-none font-medium">
                число
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col gap-1">
                <span>Средняя загруженность</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-hidden">
              <div className="flex items-center gap-2 leading-none font-medium">
                число %
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
