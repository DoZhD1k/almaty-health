"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Bed,
  Activity,
  AlertTriangle,
  Filter,
  TrendingUp,
  GitCommitVertical,
  BarChart3,
} from "lucide-react";
import { healthcareApi } from "@/lib/api/healthcare";
import {
  FacilityStatistic,
  HospitalizationStatistic,
} from "@/types/healthcare";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Функция для форматирования чисел с пробелами
const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export function AnalyticsDashboard() {
  const [facilities, setFacilities] = useState<FacilityStatistic[]>([]);
  const [hospitalizationData, setHospitalizationData] = useState<
    HospitalizationStatistic[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Состояние для фильтров
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedFacilityType, setSelectedFacilityType] = useState("all");
  const [selectedProfile, setSelectedProfile] = useState("all");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [facilitiesResponse, hospitalizationResponse] = await Promise.all(
          [
            healthcareApi.getFacilityStatistics(), // Используем реальную API
            healthcareApi.getHospitalizationStatistics(),
          ]
        );

        setFacilities(facilitiesResponse.results || []);
        setHospitalizationData(hospitalizationResponse.results || []);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Фильтрованные данные
  const filteredFacilities = useMemo(() => {
    return facilities.filter((facility) => {
      if (
        selectedDistrict !== "all" &&
        !facility.district?.includes(selectedDistrict)
      ) {
        return false;
      }
      if (
        selectedFacilityType !== "all" &&
        facility.ownership_type !== selectedFacilityType
      ) {
        return false;
      }
      if (
        selectedProfile !== "all" &&
        !facility.facility_type?.toLowerCase().includes(selectedProfile)
      ) {
        return false;
      }
      return true;
    });
  }, [facilities, selectedDistrict, selectedFacilityType, selectedProfile]);

  const overallStats = useMemo(() => {
    const totalHospitalizations = filteredFacilities.reduce(
      (sum, facility) => sum + (facility.total_admitted_patients || 0),
      0
    );
    const totalBedDays = filteredFacilities.reduce(
      (sum, facility) => sum + (facility.total_inpatient_bed_days || 0),
      0
    );
    const avgLoad =
      filteredFacilities.length > 0
        ? filteredFacilities.reduce(
            (sum, facility) =>
              sum + (facility.occupancy_rate_percent || 0) * 100,
            0
          ) / filteredFacilities.length
        : 0;
    const overloadedCount = filteredFacilities.filter(
      (facility) => (facility.occupancy_rate_percent || 0) > 0.9
    ).length;

    return { totalHospitalizations, avgLoad, overloadedCount, totalBedDays };
  }, [filteredFacilities]);

  const smpVtmpStats = useMemo(() => {
    // Используем данные из facilities вместо hospitalizationData
    const totalSmpReleased = filteredFacilities.reduce(
      (sum, facility) => sum + (facility.released_smp || 0),
      0
    );
    const totalSmpDeaths = filteredFacilities.reduce(
      (sum, facility) => sum + (facility.death_smp || 0),
      0
    );
    const totalVtmpReleased = filteredFacilities.reduce(
      (sum, facility) => sum + (facility.released_vtmp || 0),
      0
    );
    const totalVtmpDeaths = filteredFacilities.reduce(
      (sum, facility) => sum + (facility.death_vtmp || 0),
      0
    );

    const totalSmpAdmitted = totalSmpReleased + totalSmpDeaths;
    const totalVtmpAdmitted = totalVtmpReleased + totalVtmpDeaths;

    return {
      smp: {
        admitted: totalSmpAdmitted,
        deaths: totalSmpDeaths,
        mortality:
          totalSmpAdmitted > 0 ? (totalSmpDeaths / totalSmpAdmitted) * 100 : 0,
      },
      vtmp: {
        admitted: totalVtmpAdmitted,
        deaths: totalVtmpDeaths,
        mortality:
          totalVtmpAdmitted > 0
            ? (totalVtmpDeaths / totalVtmpAdmitted) * 100
            : 0,
      },
    };
  }, [filteredFacilities]);

  if (loading) {
    return <div className="p-6">Загрузка данных аналитики...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Фильтры аналитики
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Район</label>
              <Select
                value={selectedDistrict}
                onValueChange={setSelectedDistrict}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все районы</SelectItem>
                  <SelectItem value="Алмалинский">Алмалинский</SelectItem>
                  <SelectItem value="Ауэзовский">Ауэзовский</SelectItem>
                  <SelectItem value="Бостандыкский">Бостандыкский</SelectItem>
                  <SelectItem value="Медеуский">Медеуский</SelectItem>
                  <SelectItem value="Наурызбайский">Наурызбайский</SelectItem>
                  <SelectItem value="Турксибский">Турксибский</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Тип МО</label>
              <Select
                value={selectedFacilityType}
                onValueChange={setSelectedFacilityType}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="гос">Государственные</SelectItem>
                  <SelectItem value="Частные">Частные</SelectItem>
                  <SelectItem value="Ведомственные">Ведомственные</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Профиль</label>
              <Select
                value={selectedProfile}
                onValueChange={setSelectedProfile}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все профили</SelectItem>
                  <SelectItem value="multi">Многопрофильные</SelectItem>
                  <SelectItem value="cardio">Кардиология</SelectItem>
                  <SelectItem value="oncology">Онкология</SelectItem>
                  <SelectItem value="pediatrics">Педиатрия</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Всего госпитализаций
                </p>
                <p className="text-2xl font-bold">
                  {formatNumber(overallStats.totalHospitalizations)}
                </p>
                <p className="text-xs text-green-600">Данные из API</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Средняя загрузка
                </p>
                <p className="text-2xl font-bold">
                  {Math.round(overallStats.avgLoad)}%
                </p>
                <p className="text-xs text-yellow-600">По всем МО</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Перегруженных МО
                </p>
                <p className="text-2xl font-bold">
                  {overallStats.overloadedCount}
                </p>
                <p className="text-xs text-red-600">Загрузка больше 90%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Койко-дни
                </p>
                <p className="text-2xl font-bold">
                  {formatNumber(overallStats.totalBedDays)}
                </p>
                <p className="text-xs text-green-600">Общий объем</p>
              </div>
              <Bed className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="comparison" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comparison">Сравнение МО</TabsTrigger>
          <TabsTrigger value="smp-vtmp">СМП/ВТМП</TabsTrigger>
          <TabsTrigger value="districts">По районам</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* График сравнения по типам собственности */}
            <Card>
              <CardHeader>
                <CardTitle>Сравнение по типам собственности</CardTitle>
                <CardDescription>
                  Количество учреждений и средняя загруженность
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    count: {
                      label: "Количество МО",
                      color: "#3b82f6",
                    },
                    occupancy: {
                      label: "Средняя загруженность %",
                      color: "#22c55e",
                    },
                  }}
                  className="h-[300px]"
                >
                  <BarChart
                    data={[
                      ...new Set(
                        filteredFacilities.map((f) => f.ownership_type)
                      ),
                    ].map((ownershipType) => {
                      const facilities = filteredFacilities.filter(
                        (f) => f.ownership_type === ownershipType
                      );
                      const avgOccupancy =
                        facilities.length > 0
                          ? facilities.reduce(
                              (sum, f) =>
                                sum + (f.occupancy_rate_percent || 0) * 100,
                              0
                            ) / facilities.length
                          : 0;

                      return {
                        type: ownershipType || "Не указан",
                        count: facilities.length,
                        occupancy: Math.round(avgOccupancy),
                      };
                    })}
                    margin={{ left: 12, right: 12, top: 20, bottom: 50 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="type"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={11}
                    />
                    <YAxis yAxisId="left" tickLine={false} axisLine={false} />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                      formatter={(value: any, name: string) => [
                        name === "count" ? `${value} учреждений` : `${value}%`,
                        name === "count"
                          ? "Количество МО"
                          : "Средняя загруженность",
                      ]}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="count"
                      fill="#3b82f6"
                      radius={4}
                    >
                      <LabelList
                        dataKey="count"
                        position="top"
                        offset={12}
                        className="fill-foreground"
                        fontSize={12}
                      />
                    </Bar>
                    <Bar
                      yAxisId="right"
                      dataKey="occupancy"
                      fill="#22c55e"
                      radius={4}
                    >
                      <LabelList
                        dataKey="occupancy"
                        position="top"
                        offset={12}
                        className="fill-foreground"
                        fontSize={12}
                        formatter={(value: any) => `${value}%`}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                  Анализ по типам собственности{" "}
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                  Синие столбцы - количество, зеленые - загруженность
                </div>
              </CardFooter>
            </Card>

            {/* Таблица топ-5 МО по эффективности */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Топ-5 МО по эффективности использования коек
                </CardTitle>
                <CardDescription>
                  Рейтинг лучших учреждений по загруженности
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Медицинская организация</TableHead>
                        <TableHead>Тип собственности</TableHead>
                        <TableHead className="text-right">
                          Загруженность
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const topFacilities = filteredFacilities
                          .filter(
                            (f) =>
                              f.occupancy_rate_percent !== null &&
                              f.occupancy_rate_percent > 0
                          )
                          .sort(
                            (a, b) =>
                              (b.occupancy_rate_percent || 0) -
                              (a.occupancy_rate_percent || 0)
                          )
                          .slice(0, 5);

                        if (topFacilities.length === 0) {
                          return (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="text-center py-8 text-muted-foreground"
                              >
                                Нет данных о загруженности
                              </TableCell>
                            </TableRow>
                          );
                        }

                        return topFacilities.map((facility, index) => (
                          <TableRow
                            key={facility.id}
                            className={
                              index === 0
                                ? "bg-yellow-50 dark:bg-yellow-900/20"
                                : ""
                            }
                          >
                            <TableCell className="font-medium">
                              {index + 1}
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div
                                className="truncate"
                                title={facility.medical_organization}
                              >
                                {facility.medical_organization}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {facility.ownership_type || "Не указан"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="font-semibold text-lg text-yellow-600">
                                {Math.round(
                                  (facility.occupancy_rate_percent || 0) * 100
                                )}
                                %
                              </span>
                            </TableCell>
                          </TableRow>
                        ));
                      })()}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                  Рейтинг эффективности <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                  Топ-5 учреждений с максимальной загруженностью коек
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Всего МО с данными загруженности:{" "}
                  {
                    filteredFacilities.filter(
                      (f) =>
                        f.occupancy_rate_percent !== null &&
                        f.occupancy_rate_percent > 0
                    ).length
                  }
                </div>
              </CardFooter>
            </Card>

            {/* График сравнения объемов медицинской помощи */}
            <Card>
              <CardHeader>
                <CardTitle>Объемы медицинской помощи по типам МО</CardTitle>
                <CardDescription>
                  Сравнение поступлений СМП и ВТМП
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    smp: {
                      label: "СМП",
                      color: "#3b82f6",
                    },
                    vtmp: {
                      label: "ВТМП",
                      color: "#22c55e",
                    },
                  }}
                  className="h-[300px]"
                >
                  <BarChart
                    data={[
                      ...new Set(
                        filteredFacilities.map((f) => f.ownership_type)
                      ),
                    ].map((ownershipType) => {
                      const facilities = filteredFacilities.filter(
                        (f) => f.ownership_type === ownershipType
                      );
                      const totalSmp = facilities.reduce(
                        (sum, f) =>
                          sum + (f.released_smp || 0) + (f.death_smp || 0),
                        0
                      );
                      const totalVtmp = facilities.reduce(
                        (sum, f) =>
                          sum + (f.released_vtmp || 0) + (f.death_vtmp || 0),
                        0
                      );

                      return {
                        type: ownershipType || "Не указан",
                        smp: totalSmp,
                        vtmp: totalVtmp,
                      };
                    })}
                    margin={{ left: 12, right: 12, top: 20, bottom: 50 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="type"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={11}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                      formatter={(value: any, name: string) => [
                        formatNumber(Number(value)),
                        name === "smp" ? "СМП пациентов" : "ВТМП пациентов",
                      ]}
                    />
                    <Bar dataKey="smp" fill="#3b82f6" radius={4} />
                    <Bar dataKey="vtmp" fill="#22c55e" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                  Объемы по типам собственности{" "}
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                  Синие столбцы - СМП, зеленые - ВТМП
                </div>
              </CardFooter>
            </Card>

            {/* График средней смертности по типам МО */}
            <Card>
              <CardHeader>
                <CardTitle>Показатели смертности по типам МО</CardTitle>
                <CardDescription>Средний процент летальности</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    mortality: {
                      label: "Летальность %",
                      color: "#ef4444",
                    },
                  }}
                  className="h-[300px]"
                >
                  <BarChart
                    data={[
                      ...new Set(
                        filteredFacilities.map((f) => f.ownership_type)
                      ),
                    ].map((ownershipType) => {
                      const facilities = filteredFacilities.filter(
                        (f) => f.ownership_type === ownershipType
                      );
                      const totalAdmitted = facilities.reduce(
                        (sum, f) =>
                          sum +
                          (f.released_smp || 0) +
                          (f.death_smp || 0) +
                          (f.released_vtmp || 0) +
                          (f.death_vtmp || 0),
                        0
                      );
                      const totalDeaths = facilities.reduce(
                        (sum, f) =>
                          sum + (f.death_smp || 0) + (f.death_vtmp || 0),
                        0
                      );
                      const mortalityRate =
                        totalAdmitted > 0
                          ? (totalDeaths / totalAdmitted) * 100
                          : 0;

                      return {
                        type: ownershipType || "Не указан",
                        mortality: Number(mortalityRate.toFixed(2)),
                      };
                    })}
                    margin={{ left: 12, right: 12, top: 20, bottom: 50 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="type"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={11}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      domain={[0, "dataMax"]}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                      formatter={(value: any) => [`${value}%`, "Летальность"]}
                    />
                    <Bar dataKey="mortality" fill="#ef4444" radius={4}>
                      <LabelList
                        dataKey="mortality"
                        position="top"
                        offset={12}
                        className="fill-foreground"
                        fontSize={12}
                        formatter={(value: any) => `${value}%`}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                  Анализ показателей смертности{" "}
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                  Процент летальных исходов по типам собственности
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="smp-vtmp" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Круговая диаграмма СМП */}
            <Card className="flex flex-col">
              <CardHeader className="items-center pb-0">
                <CardTitle>Скорая медицинская помощь (СМП)</CardTitle>
                <CardDescription>Анализ исходов лечения</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-0">
                <ChartContainer
                  config={{
                    survived: {
                      label: "Выжило",
                      color: "#22c55e",
                    },
                    died: {
                      label: "Умерло",
                      color: "#ef4444",
                    },
                  }}
                  className="mx-auto aspect-square max-h-[250px]"
                >
                  <PieChart>
                    <ChartTooltip
                      content={<ChartTooltipContent hideLabel />}
                      formatter={(value: any) => formatNumber(Number(value))}
                    />
                    <Pie
                      data={[
                        {
                          category: "survived",
                          value:
                            smpVtmpStats.smp.admitted - smpVtmpStats.smp.deaths,
                          fill: "#22c55e",
                        },
                        {
                          category: "died",
                          value: smpVtmpStats.smp.deaths,
                          fill: "#ef4444",
                        },
                      ]}
                      dataKey="value"
                      nameKey="category"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 leading-none font-medium">
                  Всего поступило: {formatNumber(smpVtmpStats.smp.admitted)}
                </div>
                <div className="text-muted-foreground leading-none">
                  Летальность: {smpVtmpStats.smp.mortality.toFixed(2)}%
                </div>
              </CardFooter>
            </Card>

            {/* Круговая диаграмма ВТМП */}
            <Card className="flex flex-col">
              <CardHeader className="items-center pb-0">
                <CardTitle>
                  Высокотехнологичная медицинская помощь (ВТМП)
                </CardTitle>
                <CardDescription>Анализ исходов лечения</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-0">
                <ChartContainer
                  config={{
                    survived: {
                      label: "Выжило",
                      color: "#22c55e",
                    },
                    died: {
                      label: "Умерло",
                      color: "#ef4444",
                    },
                  }}
                  className="mx-auto aspect-square max-h-[250px]"
                >
                  <PieChart>
                    <ChartTooltip
                      content={<ChartTooltipContent hideLabel />}
                      formatter={(value: any) => formatNumber(Number(value))}
                    />
                    <Pie
                      data={[
                        {
                          category: "survived",
                          value:
                            smpVtmpStats.vtmp.admitted -
                            smpVtmpStats.vtmp.deaths,
                          fill: "#22c55e",
                        },
                        {
                          category: "died",
                          value: smpVtmpStats.vtmp.deaths,
                          fill: "#ef4444",
                        },
                      ]}
                      dataKey="value"
                      nameKey="category"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 leading-none font-medium">
                  Всего поступило: {formatNumber(smpVtmpStats.vtmp.admitted)}
                </div>
                <div className="text-muted-foreground leading-none">
                  Летальность: {smpVtmpStats.vtmp.mortality.toFixed(2)}%
                </div>
              </CardFooter>
            </Card>

            {/* Столбчатая диаграмма сравнения */}
            {/* <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Сравнение СМП и ВТМП</CardTitle>
                <CardDescription>
                  Сравнительный анализ медицинской помощи
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    admitted: {
                      label: "Поступило",
                      color: "#3b82f6",
                    },
                    died: {
                      label: "Умерло",
                      color: "#ef4444",
                    },
                    survived: {
                      label: "Выжило",
                      color: "#22c55e",
                    },
                  }}
                  className="h-[300px]"
                >
                  <BarChart
                    data={[
                      {
                        category: "СМП",
                        admitted: smpVtmpStats.smp.admitted,
                        died: smpVtmpStats.smp.deaths,
                        survived:
                          smpVtmpStats.smp.admitted - smpVtmpStats.smp.deaths,
                      },
                      {
                        category: "ВТМП",
                        admitted: smpVtmpStats.vtmp.admitted,
                        died: smpVtmpStats.vtmp.deaths,
                        survived:
                          smpVtmpStats.vtmp.admitted - smpVtmpStats.vtmp.deaths,
                      },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="category"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis tickFormatter={(value) => formatNumber(value)} />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value: any) => formatNumber(Number(value))}
                    />
                    <Bar dataKey="admitted" fill="#3b82f6" radius={4}>
                      <LabelList
                        position="top"
                        offset={12}
                        className="fill-foreground"
                        fontSize={12}
                      />
                    </Bar>
                    <Bar dataKey="died" fill="#ef4444" radius={4}>
                      <LabelList
                        position="top"
                        offset={12}
                        className="fill-foreground"
                        fontSize={12}
                      />
                    </Bar>
                    <Bar dataKey="survived" fill="#22c55e" radius={4}>
                      <LabelList
                        position="top"
                        offset={12}
                        className="fill-foreground"
                        fontSize={12}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                  Динамика показателей медицинской помощи{" "}
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                  Сравнение исходов лечения СМП и ВТМП
                </div>
              </CardFooter>
            </Card> */}

            {/* Диаграмма соотношения СМП и ВТМП */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>
                  Соотношение количества пациентов СМП и ВТМП
                </CardTitle>
                <CardDescription>
                  Сравнение объемов специализированной и высокотехнологичной
                  медицинской помощи
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    smp: {
                      label: "СМП",
                      color: "#3b82f6",
                    },
                    vtmp: {
                      label: "ВТМП",
                      color: "#22c55e",
                    },
                  }}
                  className="h-[400px]"
                >
                  <BarChart
                    data={[
                      {
                        type: "СМП",
                        patients: smpVtmpStats.smp.admitted,
                        fill: "#3b82f6",
                      },
                      {
                        type: "ВТМП",
                        patients: smpVtmpStats.vtmp.admitted,
                        fill: "#22c55e",
                      },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="type"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                      formatter={(value: any) => [
                        formatNumber(Number(value)),
                        "Количество пациентов",
                      ]}
                    />
                    <Bar dataKey="patients" radius={8}>
                      <LabelList
                        dataKey="patients"
                        position="top"
                        offset={12}
                        className="fill-foreground"
                        fontSize={14}
                        formatter={(value: any) => formatNumber(Number(value))}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                  Общее соотношение пациентов <BarChart3 className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                  СМП: {formatNumber(smpVtmpStats.smp.admitted)} пациентов,
                  ВТМП: {formatNumber(smpVtmpStats.vtmp.admitted)} пациентов
                </div>
              </CardFooter>
            </Card>

            {/* График корреляции СМП и ВТМП с двумя осями */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>
                  Корреляция СМП/ВТМП: Загруженность vs Количество больниц
                </CardTitle>
                <CardDescription>
                  Анализ зависимости между загруженностью и количеством
                  учреждений по районам
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    smp: {
                      label: "СМП",
                      color: "#3b82f6",
                    },
                    vtmp: {
                      label: "ВТМП",
                      color: "#22c55e",
                    },
                    hospitals: {
                      label: "Количество больниц",
                      color: "#ef4444",
                    },
                  }}
                  className="h-[400px]"
                >
                  <LineChart
                    data={[
                      "Алмалинский",
                      "Ауэзовский",
                      "Бостандыкский",
                      "Медеуский",
                      "Наурызбайский",
                      "Турксибский",
                    ].map((district) => {
                      const districtFacilities = filteredFacilities.filter(
                        (f) => f.district?.includes(district)
                      );

                      const avgLoad =
                        districtFacilities.length > 0
                          ? districtFacilities.reduce(
                              (sum, f) =>
                                sum + (f.occupancy_rate_percent || 0) * 100,
                              0
                            ) / districtFacilities.length
                          : 0;

                      const totalSmp = districtFacilities.reduce(
                        (sum, f) =>
                          sum + (f.released_smp || 0) + (f.death_smp || 0),
                        0
                      );

                      const totalVtmp = districtFacilities.reduce(
                        (sum, f) =>
                          sum + (f.released_vtmp || 0) + (f.death_vtmp || 0),
                        0
                      );

                      return {
                        district: district,
                        occupancy: Math.round(avgLoad),
                        hospitals: districtFacilities.length,
                        smp: totalSmp,
                        vtmp: totalVtmp,
                      };
                    })}
                    margin={{ left: 20, right: 20, top: 20, bottom: 50 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="district"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={11}
                    />
                    <YAxis
                      yAxisId="left"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                      formatter={(value: any, name: string) => {
                        if (name === "smp")
                          return [
                            formatNumber(Number(value)),
                            "СМП поступлений",
                          ];
                        if (name === "vtmp")
                          return [
                            formatNumber(Number(value)),
                            "ВТМП поступлений",
                          ];
                        if (name === "hospitals")
                          return [Number(value), "Количество больниц"];
                        return [`${value}%`, "Загруженность"];
                      }}
                    />
                    <Line
                      yAxisId="left"
                      dataKey="smp"
                      type="natural"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={({ cx, cy, payload }) => {
                        const r = 18;
                        return (
                          <GitCommitVertical
                            key={payload.district}
                            x={cx - r / 2}
                            y={cy - r / 2}
                            width={r}
                            height={r}
                            fill="hsl(var(--background))"
                            stroke="#3b82f6"
                          />
                        );
                      }}
                    />
                    <Line
                      yAxisId="left"
                      dataKey="vtmp"
                      type="natural"
                      stroke="#22c55e"
                      strokeWidth={3}
                      dot={({ cx, cy, payload }) => {
                        const r = 18;
                        return (
                          <GitCommitVertical
                            key={payload.district}
                            x={cx - r / 2}
                            y={cy - r / 2}
                            width={r}
                            height={r}
                            fill="hsl(var(--background))"
                            stroke="#22c55e"
                          />
                        );
                      }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                  Корреляционный анализ СМП и ВТМП{" "}
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                  Синяя линия - СМП, зеленая линия - ВТМП по районам города
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="districts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Столбчатая диаграмма - количество пациентов по районам */}
            <Card>
              <CardHeader>
                <CardTitle>Количество пациентов по районам</CardTitle>
                <CardDescription>
                  Общее количество госпитализаций
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    patients: {
                      label: "Пациентов",
                      color: "#3b82f6",
                    },
                  }}
                  className="h-[300px]"
                >
                  <BarChart
                    data={[
                      "Алмалинский",
                      "Ауэзовский",
                      "Бостандыкский",
                      "Медеуский",
                      "Наурызбайский",
                      "Турксибский",
                    ].map((district) => {
                      const districtFacilities = filteredFacilities.filter(
                        (f) => f.district?.includes(district)
                      );
                      const totalPatients = districtFacilities.reduce(
                        (sum, f) => sum + (f.total_admitted_patients || 0),
                        0
                      );
                      return {
                        district: district,
                        patients: totalPatients,
                      };
                    })}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="district"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis tickFormatter={(value) => formatNumber(value)} />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value: any) => formatNumber(Number(value))}
                    />
                    <Bar dataKey="patients" fill="#3b82f6" radius={4}>
                      <LabelList
                        position="top"
                        offset={12}
                        className="fill-foreground"
                        fontSize={12}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Столбчатая диаграмма - средняя загрузка по районам */}
            <Card>
              <CardHeader>
                <CardTitle>Средняя загрузка по районам</CardTitle>
                <CardDescription>
                  Процент загрузки медицинских учреждений
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    occupancy: {
                      label: "Загрузка %",
                      color: "#f59e0b",
                    },
                  }}
                  className="h-[300px]"
                >
                  <BarChart
                    data={[
                      "Алмалинский",
                      "Ауэзовский",
                      "Бостандыкский",
                      "Медеуский",
                      "Наурызбайский",
                      "Турксибский",
                    ].map((district) => {
                      const districtFacilities = filteredFacilities.filter(
                        (f) => f.district?.includes(district)
                      );
                      const avgLoad =
                        districtFacilities.length > 0
                          ? districtFacilities.reduce(
                              (sum, f) =>
                                sum + (f.occupancy_rate_percent || 0) * 100,
                              0
                            ) / districtFacilities.length
                          : 0;
                      return {
                        district: district,
                        occupancy: Math.round(avgLoad),
                      };
                    })}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="district"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="occupancy" fill="#f59e0b" radius={4}>
                      <LabelList
                        position="top"
                        offset={12}
                        className="fill-foreground"
                        fontSize={12}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Столбчатая диаграмма - смертность по районам */}
            <Card>
              <CardHeader>
                <CardTitle>Смертность по районам</CardTitle>
                <CardDescription>
                  Анализ летальных исходов по регионам
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    deaths: {
                      label: "Количество смертей",
                      color: "#ef4444",
                    },
                    deathsPerHospital: {
                      label: "Смертей на больницу",
                      color: "#dc2626",
                    },
                    mortalityRate: {
                      label: "Смертность %",
                      color: "#991b1b",
                    },
                  }}
                  className="h-[300px]"
                >
                  <BarChart
                    data={[
                      "Алмалинский",
                      "Ауэзовский",
                      "Бостандыкский",
                      "Медеуский",
                      "Наурызбайский",
                      "Турксибский",
                    ].map((district) => {
                      const districtFacilities = filteredFacilities.filter(
                        (f) => f.district?.includes(district)
                      );
                      const totalDeaths = districtFacilities.reduce(
                        (sum, f) =>
                          sum + (f.death_smp || 0) + (f.death_vtmp || 0),
                        0
                      );
                      const totalAdmitted = districtFacilities.reduce(
                        (sum, f) => sum + (f.total_admitted_patients || 0),
                        0
                      );
                      const hospitalsCount = districtFacilities.length;
                      const deathsPerHospital =
                        hospitalsCount > 0
                          ? (totalDeaths / hospitalsCount).toFixed(1)
                          : "0";
                      const mortalityRate =
                        totalAdmitted > 0
                          ? ((totalDeaths / totalAdmitted) * 100).toFixed(2)
                          : "0";
                      return {
                        district: district,
                        deaths: totalDeaths,
                        deathsPerHospital: parseFloat(deathsPerHospital),
                        mortalityRate: parseFloat(mortalityRate),
                      };
                    })}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="district"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis tickFormatter={(value) => formatNumber(value)} />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value: any, name: string) => [
                        name === "deaths"
                          ? formatNumber(Number(value))
                          : name === "deathsPerHospital"
                          ? `${value}`
                          : `${value}%`,
                        name === "deaths"
                          ? "Количество смертей"
                          : name === "deathsPerHospital"
                          ? "Смертей на больницу"
                          : "Смертность %",
                      ]}
                    />
                    <Bar dataKey="deaths" fill="#ef4444" radius={4}>
                      <LabelList
                        position="top"
                        offset={12}
                        className="fill-foreground"
                        fontSize={12}
                      />
                    </Bar>
                    <Bar dataKey="deathsPerHospital" fill="#dc2626" radius={4}>
                      <LabelList
                        position="top"
                        offset={12}
                        className="fill-foreground"
                        fontSize={12}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                  Анализ летальности и нагрузки по районам{" "}
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                  Показатели смертности и средняя нагрузка на медицинские
                  учреждения
                </div>
              </CardFooter>
            </Card>

            {/* Круговая диаграмма - распределение учреждений по районам */}
            <Card className="flex flex-col">
              <CardHeader className="items-center pb-0">
                <CardTitle>Распределение учреждений по районам</CardTitle>
                <CardDescription>
                  Количество медицинских организаций
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-0">
                <ChartContainer
                  config={{
                    алмалинский: {
                      label: "Алмалинский",
                      color: "#3b82f6",
                    },
                    ауэзовский: {
                      label: "Ауэзовский",
                      color: "#ef4444",
                    },
                    бостандыкский: {
                      label: "Бостандыкский",
                      color: "#22c55e",
                    },
                    медеуский: {
                      label: "Медеуский",
                      color: "#f59e0b",
                    },
                    наурызбайский: {
                      label: "Наурызбайский",
                      color: "#8b5cf6",
                    },
                    турксибский: {
                      label: "Турксибский",
                      color: "#06b6d4",
                    },
                  }}
                  className="mx-auto aspect-square max-h-[250px]"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={[
                        "Алмалинский",
                        "Ауэзовский",
                        "Бостандыкский",
                        "Медеуский",
                        "Наурызбайский",
                        "Турксибский",
                      ].map((district, index) => {
                        const districtFacilities = filteredFacilities.filter(
                          (f) => f.district?.includes(district)
                        );
                        const colors = [
                          "#3b82f6",
                          "#ef4444",
                          "#22c55e",
                          "#f59e0b",
                          "#8b5cf6",
                          "#06b6d4",
                        ];
                        return {
                          district: district.toLowerCase(),
                          value: districtFacilities.length,
                          fill: colors[index % colors.length],
                        };
                      })}
                      dataKey="value"
                      nameKey="district"
                      outerRadius={80}
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 leading-none font-medium">
                  Всего учреждений: {filteredFacilities.length}{" "}
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                  Распределение медицинских организаций по районам города
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
