"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DataSources } from "./methodology/data-sources"
import { CalculationFormulas } from "./methodology/calculation-formulas"
import { ColorClassification } from "./methodology/color-classification"
import { SystemLimitations } from "./methodology/system-limitations"
import { Database, Calculator, Palette, AlertTriangle, Info } from "lucide-react"

export function MethodologyDocumentation() {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Обзор системы
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Система мониторинга медицинских организаций г. Алматы предназначена для отслеживания загруженности
            стационаров в режиме реального времени и оптимизации маршрутизации пациентов.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">27</div>
              <div className="text-sm text-muted-foreground">Медицинских организаций</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">2,150</div>
              <div className="text-sm text-muted-foreground">Коечная мощность</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">15</div>
              <div className="text-sm text-muted-foreground">Показателей мониторинга</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Режим обновления</div>
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Данная система предназначена для информационной поддержки принятия решений и не заменяет профессиональную
              медицинскую оценку ситуации.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Main Documentation Tabs */}
      <Tabs defaultValue="sources" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sources" className="gap-2">
            <Database className="h-4 w-4" />
            Источники данных
          </TabsTrigger>
          <TabsTrigger value="formulas" className="gap-2">
            <Calculator className="h-4 w-4" />
            Формулы расчета
          </TabsTrigger>
          <TabsTrigger value="classification" className="gap-2">
            <Palette className="h-4 w-4" />
            Цветовая классификация
          </TabsTrigger>
          <TabsTrigger value="limitations" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Ограничения
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sources">
          <DataSources />
        </TabsContent>

        <TabsContent value="formulas">
          <CalculationFormulas />
        </TabsContent>

        <TabsContent value="classification">
          <ColorClassification />
        </TabsContent>

        <TabsContent value="limitations">
          <SystemLimitations />
        </TabsContent>
      </Tabs>
    </div>
  )
}
