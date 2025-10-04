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
import { SmpVtmpMapLibre } from "@/components/map/SmpVtmpMapLibre";

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
        facility.bed_profile !== selectedFacilityType
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
    const avgBedDaysPerPatient =
      totalHospitalizations > 0 ? totalBedDays / totalHospitalizations : 0;
    const avgLoad =
      filteredFacilities.length > 0
        ? (filteredFacilities.reduce(
            (sum, facility) => sum + (facility.occupancy_rate_percent || 0),
            0
          ) /
            filteredFacilities.length) *
          100 // Приводим к процентам только в конце
        : 0;
    const overloadedCount = filteredFacilities.filter(
      (facility) => (facility.occupancy_rate_percent || 0) > 0.9
    ).length;

    return {
      totalHospitalizations,
      avgLoad,
      overloadedCount,
      avgBedDaysPerPatient,
    };
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
                  <SelectItem value="Алатауский">Алатауский</SelectItem>
                  <SelectItem value="Жетысуский">Жетысуский</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Профиль коек</label>
              <Select
                value={selectedFacilityType}
                onValueChange={setSelectedFacilityType}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все профили</SelectItem>
                  <SelectItem value="терапевтические">
                    Терапевтические
                  </SelectItem>
                  <SelectItem value="хирургические">Хирургические</SelectItem>
                  <SelectItem value="педиатрические">Педиатрические</SelectItem>
                  <SelectItem value="родильные">Родильные</SelectItem>
                  <SelectItem value="реанимационные">Реанимационные</SelectItem>
                  <SelectItem value="по частным МО">По частным МО</SelectItem>
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
                <p className="text-xs text-green-600">
                  ср в мес:{" "}
                  {formatNumber(
                    Math.round(overallStats.totalHospitalizations / 12)
                  )}
                </p>
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
                  Койко-дни на пациента
                </p>
                <p className="text-2xl font-bold">
                  {overallStats.avgBedDaysPerPatient.toFixed(1)}
                </p>
                <p className="text-xs text-blue-600">Среднее значение</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Кольцевая диаграмма сравнения по типам собственности */}
            <Card>
              <CardHeader>
                <CardTitle>Сравнение по профилям коек</CardTitle>
                <CardDescription>
                  Распределение медицинских организаций по профилям коек
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    государственные: {
                      label: "Государственные",
                      color: "#3b82f6",
                    },
                    частные: {
                      label: "Частные",
                      color: "#ef4444",
                    },
                    ведомственные: {
                      label: "Ведомственные",
                      color: "#22c55e",
                    },
                  }}
                  className="h-[300px]"
                >
                  <PieChart>
                    <ChartTooltip
                      content={<ChartTooltipContent hideLabel />}
                      formatter={(value: any, name: string) => [
                        `${value} учреждений`,
                        name,
                      ]}
                    />
                    <Pie
                      data={[
                        ...new Set(
                          filteredFacilities.map((f) => f.bed_profile)
                        ),
                      ].map((bedProfile, index) => {
                        const facilities = filteredFacilities.filter(
                          (f) => f.bed_profile === bedProfile
                        );
                        const colors = [
                          "#3b82f6",
                          "#ef4444",
                          "#22c55e",
                          "#f59e0b",
                        ];

                        return {
                          type: bedProfile || "Не указан",
                          count: facilities.length,
                          fill: colors[index % colors.length],
                        };
                      })}
                      dataKey="count"
                      nameKey="type"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                    >
                      <LabelList
                        dataKey="count"
                        className="fill-background"
                        stroke="none"
                        fontSize={12}
                        formatter={(value: any) => `${value}`}
                      />
                    </Pie>
                    <Legend />
                  </PieChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                  Анализ по типам собственности{" "}
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                  Всего учреждений: {filteredFacilities.length}
                </div>
              </CardFooter>
            </Card>

            {/* Таблица урезанных коек за 2024-2025 годы */}
            <Card>
              <CardHeader>
                <CardTitle>Урезанные койки за 2024-2025 годы</CardTitle>
                <CardDescription>
                  Все учреждения с сортировкой по загруженности
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Медицинская организация</TableHead>
                        <TableHead>Профиль коек</TableHead>
                        <TableHead className="text-right">
                          Загруженность
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const allFacilities = filteredFacilities
                          .filter(
                            (f) =>
                              f.occupancy_rate_percent !== null &&
                              f.occupancy_rate_percent > 0
                          )
                          .sort(
                            (a, b) =>
                              (b.occupancy_rate_percent || 0) -
                              (a.occupancy_rate_percent || 0)
                          );

                        if (allFacilities.length === 0) {
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

                        return allFacilities.map((facility, index) => (
                          <TableRow
                            key={facility.id}
                            className={
                              index < 3
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
                                {facility.bed_profile || "Не указан"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <span
                                className={`font-semibold text-lg ${
                                  index < 3
                                    ? "text-yellow-600"
                                    : "text-blue-600"
                                }`}
                              >
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
                  Все учреждения с данными загруженности, топ-3 выделены
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

            {/* График иногородних пациентов по типу профиля (facility_type) */}
            <Card>
              <CardHeader>
                <CardTitle>Иногородние пациенты по типу профиля</CardTitle>
                <CardDescription>
                  Распределение иногородних пациентов по типам медицинских
                  профилей
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    outOfTown: {
                      label: "Иногородние",
                      color: "#8b5cf6",
                    },
                  }}
                  className="h-[300px]"
                >
                  <BarChart
                    data={[
                      ...new Set(
                        filteredFacilities.map((f) => f.facility_type)
                      ),
                    ].map((facilityType) => {
                      const facilities = filteredFacilities.filter(
                        (f) => f.facility_type === facilityType
                      );
                      // Используем данные admitted_rural_residents как иногородних
                      const outOfTownPatients = facilities.reduce(
                        (sum, f) => sum + (f.admitted_rural_residents || 0),
                        0
                      );

                      return {
                        type: facilityType || "Не указан",
                        outOfTown: outOfTownPatients,
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
                        "Иногородних пациентов",
                      ]}
                    />
                    <Bar dataKey="outOfTown" fill="#8b5cf6" radius={4}>
                      <LabelList
                        dataKey="outOfTown"
                        position="top"
                        offset={12}
                        className="fill-foreground"
                        fontSize={12}
                        formatter={(value: any) => formatNumber(Number(value))}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                  Анализ иногородних пациентов по профилям{" "}
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                  Фиолетовые столбцы - количество иногородних пациентов по типам
                  медицинских профилей
                </div>
              </CardFooter>
            </Card>

            {/* Таблица всех МО по эффективности */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>
                  МО по эффективности использования коекawdawdadad
                </CardTitle>
                <CardDescription>
                  Все учреждения с сортировкой по загруженности
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Медицинская организация</TableHead>
                        <TableHead>Тип собственности</TableHead>
                        <TableHead>Количество коек</TableHead>
                        <TableHead className="text-right">
                          Загруженность
                        </TableHead>
                        <TableHead>Койко-дни %</TableHead>
                        <TableHead>Койко-дни простой%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const allFacilities = filteredFacilities
                          .filter(
                            (f) =>
                              f.occupancy_rate_percent !== null &&
                              f.occupancy_rate_percent > 0
                          )
                          .sort(
                            (a, b) =>
                              (b.occupancy_rate_percent || 0) -
                              (a.occupancy_rate_percent || 0)
                          );

                        if (allFacilities.length === 0) {
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

                        return allFacilities.map((facility, index) => (
                          <TableRow
                            key={facility.id}
                            className={
                              index < 3
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
                                {facility.bed_profile || "Не указан"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <span
                                className={`font-semibold text-lg ${
                                  index < 3
                                    ? "text-yellow-600"
                                    : "text-blue-600"
                                }`}
                              >
                                {
                                  facility.beds_deployed_withdrawn_for_rep_avg_annual
                                }
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <span
                                className={`font-semibold text-lg ${
                                  index < 3
                                    ? "text-yellow-600"
                                    : "text-blue-600"
                                }`}
                                title={`API загруженность: ${Math.round(
                                  (facility.occupancy_rate_percent || 0) * 100
                                )}%, Расчетная: ${Math.round(
                                  240 *
                                    (facility.beds_deployed_withdrawn_for_rep_avg_annual ||
                                      0) >
                                    0
                                    ? ((facility.total_inpatient_bed_days ||
                                        0) /
                                        (240 *
                                          (facility.beds_deployed_withdrawn_for_rep_avg_annual ||
                                            0))) *
                                        100
                                    : 0
                                )}%`}
                              >
                                {(() => {
                                  const facticalBedDays =
                                    240 *
                                    (facility.beds_deployed_withdrawn_for_rep_avg_annual ||
                                      0);
                                  const calculatedOccupancy =
                                    facticalBedDays > 0
                                      ? ((facility.total_inpatient_bed_days ||
                                          0) /
                                          facticalBedDays) *
                                        100
                                      : 0;
                                  // Используем расчетную загруженность вместо API
                                  return Math.round(calculatedOccupancy);
                                })()}
                                %
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <span
                                className={`font-semibold text-lg ${
                                  index < 3
                                    ? "text-yellow-600"
                                    : "text-blue-600"
                                }`}
                                title={`Койко-дни проведенные: ${
                                  facility.total_inpatient_bed_days || 0
                                }, Плановые койко-дни: ${
                                  240 *
                                  (facility.beds_deployed_withdrawn_for_rep_avg_annual ||
                                    0)
                                }`}
                              >
                                {(() => {
                                  const facticalBedDays =
                                    240 *
                                    (facility.beds_deployed_withdrawn_for_rep_avg_annual ||
                                      0);
                                  const bedDaysPercentage =
                                    facticalBedDays > 0
                                      ? ((facility.total_inpatient_bed_days ||
                                          0) /
                                          facticalBedDays) *
                                        100
                                      : 0;
                                  return Math.round(bedDaysPercentage);
                                })()}
                                %
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <span
                                className={`font-semibold text-lg ${
                                  index < 3 ? "text-red-600" : "text-gray-600"
                                }`}
                              >
                                {(() => {
                                  // Повторяем тот же расчет, что и в предыдущей ячейке
                                  const facticalBedDays =
                                    240 *
                                    (facility.beds_deployed_withdrawn_for_rep_avg_annual ||
                                      0);
                                  const bedDaysPercentage =
                                    facticalBedDays > 0
                                      ? ((facility.total_inpatient_bed_days ||
                                          0) /
                                          facticalBedDays) *
                                        100
                                      : 0;
                                  // Простая формула: 100% - койко-дни%
                                  const idlePercentage =
                                    100 - bedDaysPercentage;
                                  return Math.round(
                                    idlePercentage > 0 ? idlePercentage : 0
                                  );
                                })()}
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
                  Все учреждения с данными загруженности, топ-3 выделены
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

            {/* График средней смертности по профилям коек */}
            <Card>
              <CardHeader>
                <CardTitle>Показатели смертности по профилям коек</CardTitle>
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
                      ...new Set(filteredFacilities.map((f) => f.bed_profile)),
                    ].map((bedProfile) => {
                      const facilities = filteredFacilities.filter(
                        (f) => f.bed_profile === bedProfile
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
                        type: bedProfile || "Не указан",
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
                  Процент летальных исходов по профилям коек
                </div>
              </CardFooter>
            </Card>

            {/* График простоя коек по типам */}
            <Card>
              <CardHeader>
                <CardTitle>Простой коек в разрезе по типам</CardTitle>
                <CardDescription>
                  Анализ недогрузки коечного фонда по типам коек
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    therapeutic: {
                      label: "Терапевтические",
                      color: "#3b82f6",
                    },
                    surgical: {
                      label: "Хирургические",
                      color: "#ef4444",
                    },
                    pediatric: {
                      label: "Педиатрические",
                      color: "#22c55e",
                    },
                    maternity: {
                      label: "Родильные",
                      color: "#f59e0b",
                    },
                    intensive: {
                      label: "Реанимационные",
                      color: "#8b5cf6",
                    },
                  }}
                  className="h-[300px]"
                >
                  <BarChart
                    data={[
                      {
                        bedType: "Терапевтические",
                        totalBeds: filteredFacilities.reduce(
                          (sum, f) =>
                            sum + (f.total_admitted_patients || 0) * 0.4,
                          0
                        ), // примерные данные
                        occupiedBeds: filteredFacilities.reduce(
                          (sum, f) =>
                            sum +
                            (f.total_admitted_patients || 0) *
                              0.4 *
                              (f.occupancy_rate_percent || 0),
                          0
                        ),
                        idleBeds: 0,
                        idlePercentage: 0,
                        fill: "#3b82f6",
                      },
                      {
                        bedType: "Хирургические",
                        totalBeds: filteredFacilities.reduce(
                          (sum, f) =>
                            sum + (f.total_admitted_patients || 0) * 0.3,
                          0
                        ),
                        occupiedBeds: filteredFacilities.reduce(
                          (sum, f) =>
                            sum +
                            (f.total_admitted_patients || 0) *
                              0.3 *
                              (f.occupancy_rate_percent || 0),
                          0
                        ),
                        idleBeds: 0,
                        idlePercentage: 0,
                        fill: "#ef4444",
                      },
                      {
                        bedType: "Педиатрические",
                        totalBeds: filteredFacilities.reduce(
                          (sum, f) =>
                            sum + (f.total_admitted_patients || 0) * 0.15,
                          0
                        ),
                        occupiedBeds: filteredFacilities.reduce(
                          (sum, f) =>
                            sum +
                            (f.total_admitted_patients || 0) *
                              0.15 *
                              (f.occupancy_rate_percent || 0),
                          0
                        ),
                        idleBeds: 0,
                        idlePercentage: 0,
                        fill: "#22c55e",
                      },
                      {
                        bedType: "Родильные",
                        totalBeds: filteredFacilities.reduce(
                          (sum, f) =>
                            sum + (f.total_admitted_patients || 0) * 0.1,
                          0
                        ),
                        occupiedBeds: filteredFacilities.reduce(
                          (sum, f) =>
                            sum +
                            (f.total_admitted_patients || 0) *
                              0.1 *
                              (f.occupancy_rate_percent || 0),
                          0
                        ),
                        idleBeds: 0,
                        idlePercentage: 0,
                        fill: "#f59e0b",
                      },
                      {
                        bedType: "Реанимационные",
                        totalBeds: filteredFacilities.reduce(
                          (sum, f) =>
                            sum + (f.total_admitted_patients || 0) * 0.05,
                          0
                        ),
                        occupiedBeds: filteredFacilities.reduce(
                          (sum, f) =>
                            sum +
                            (f.total_admitted_patients || 0) *
                              0.05 *
                              (f.occupancy_rate_percent || 0),
                          0
                        ),
                        idleBeds: 0,
                        idlePercentage: 0,
                        fill: "#8b5cf6",
                      },
                    ].map((item) => {
                      const idleBeds = item.totalBeds - item.occupiedBeds;
                      const idlePercentage =
                        item.totalBeds > 0
                          ? (idleBeds / item.totalBeds) * 100
                          : 0;
                      return {
                        ...item,
                        idleBeds: Math.round(idleBeds),
                        idlePercentage: Math.round(idlePercentage),
                      };
                    })}
                    margin={{ left: 12, right: 12, top: 20, bottom: 50 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="bedType"
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
                      formatter={(value: any, name: string, props: any) => [
                        `${formatNumber(Number(value))} коек (${
                          props.payload.idlePercentage
                        }% простоя)`,
                        "Простаивающих коек",
                      ]}
                    />
                    <Bar dataKey="idleBeds" radius={4}>
                      <LabelList
                        dataKey="idlePercentage"
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
                  Анализ простоя коечного фонда{" "}
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                  Процент простаивающих коек по типам медицинских отделений
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="smp-vtmp" className="space-y-4">
          {/* Карта СМП/ВТМП */}
          <Card>
            <CardHeader>
              <CardTitle>Карта медицинских организаций СМП и ВТМП</CardTitle>
              <CardDescription>
                Интерактивная карта размещения учреждений, оказывающих скорую и
                высокотехнологичную медицинскую помощь
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SmpVtmpMapLibre className="w-full" />
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
              <div className="flex gap-2 leading-none font-medium">
                Интерактивная карта СМП/ВТМП <TrendingUp className="h-4 w-4" />
              </div>
              <div className="text-muted-foreground leading-none">
                Синие маркеры - преобладает СМП, зеленые - ВТМП. Цвет границы
                показывает загруженность учреждения.
              </div>
            </CardFooter>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Диаграмма госпитализированных СМП и ВТМП */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Госпитализированные пациенты СМП и ВТМП</CardTitle>
                <CardDescription>
                  Сравнение количества госпитализированных пациентов по
                  специализированной и высокотехнологичной медицинской помощи
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
                        "Госпитализированных пациентов",
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
                  Соотношение госпитализированных пациентов{" "}
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                  СМП: {formatNumber(smpVtmpStats.smp.admitted)} пациентов,
                  ВТМП: {formatNumber(smpVtmpStats.vtmp.admitted)} пациентов
                </div>
              </CardFooter>
            </Card>

            {/* Круговая диаграмма соотношения госпитализированных СМП и ВТМП */}
            <Card className="flex flex-col">
              <CardHeader className="items-center pb-0">
                <CardTitle>
                  Соотношение госпитализированных СМП и ВТМП
                </CardTitle>
                <CardDescription>
                  Круговая диаграмма распределения пациентов
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-0">
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
                  className="mx-auto aspect-square max-h-[300px]"
                >
                  <PieChart>
                    <ChartTooltip
                      content={<ChartTooltipContent hideLabel />}
                      formatter={(value: any, name: string, props: any) => [
                        `${formatNumber(Number(value))} пациентов (${
                          props.payload.percentage
                        }%)`,
                        name,
                      ]}
                    />
                    <Pie
                      data={[
                        {
                          type: "СМП",
                          value: smpVtmpStats.smp.admitted,
                          fill: "#3b82f6",
                          percentage: (
                            (smpVtmpStats.smp.admitted /
                              (smpVtmpStats.smp.admitted +
                                smpVtmpStats.vtmp.admitted)) *
                            100
                          ).toFixed(1),
                        },
                        {
                          type: "ВТМП",
                          value: smpVtmpStats.vtmp.admitted,
                          fill: "#22c55e",
                          percentage: (
                            (smpVtmpStats.vtmp.admitted /
                              (smpVtmpStats.smp.admitted +
                                smpVtmpStats.vtmp.admitted)) *
                            100
                          ).toFixed(1),
                        },
                      ]}
                      dataKey="value"
                      nameKey="type"
                      innerRadius={50}
                      outerRadius={100}
                      paddingAngle={5}
                    >
                      <LabelList
                        dataKey="percentage"
                        className="fill-background"
                        stroke="none"
                        fontSize={14}
                        fontWeight="bold"
                        formatter={(value: any) => `${value}%`}
                      />
                    </Pie>
                    <Legend />
                  </PieChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 leading-none font-medium">
                  Всего госпитализировано:{" "}
                  {formatNumber(
                    smpVtmpStats.smp.admitted + smpVtmpStats.vtmp.admitted
                  )}
                </div>
                <div className="text-muted-foreground leading-none">
                  СМП: {formatNumber(smpVtmpStats.smp.admitted)} / ВТМП:{" "}
                  {formatNumber(smpVtmpStats.vtmp.admitted)}
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
                      "Алатауский",
                      "Жетысуский",
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
                    <Legend />
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
                  Общее количество госпитализаций с процентами
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
                    data={(() => {
                      const districts = [
                        "Алмалинский",
                        "Ауэзовский",
                        "Бостандыкский",
                        "Медеуский",
                        "Наурызбайский",
                        "Турксибский",
                        "Алатауский",
                        "Жетысуский",
                      ];

                      const districtData = districts.map((district) => {
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
                      });

                      const total = districtData.reduce(
                        (sum, d) => sum + d.patients,
                        0
                      );

                      return districtData.map((d) => ({
                        ...d,
                        percentage:
                          total > 0
                            ? ((d.patients / total) * 100).toFixed(1)
                            : "0",
                      }));
                    })()}
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
                      formatter={(value: any, name: string, props: any) => [
                        `${formatNumber(Number(value))} (${
                          props.payload.percentage
                        }%)`,
                        "Пациентов",
                      ]}
                    />
                    <Bar dataKey="patients" fill="#3b82f6" radius={4}>
                      <LabelList
                        dataKey="percentage"
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
                      "Алатауский",
                      "Жетысуский",
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
                        formatter={(value: any) => `${value}%`}
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
                  Процент летальности (смертей/общ кол-во пролеченных)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    mortalityRate: {
                      label: "Смертность %",
                      color: "#ef4444",
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
                      "Алатауский",
                      "Жетысуский",
                    ].map((district) => {
                      const districtFacilities = filteredFacilities.filter(
                        (f) => f.district?.includes(district)
                      );
                      const totalDeaths = districtFacilities.reduce(
                        (sum, f) =>
                          sum + (f.death_smp || 0) + (f.death_vtmp || 0),
                        0
                      );
                      const totalTreated = districtFacilities.reduce(
                        (sum, f) => sum + (f.total_admitted_patients || 0),
                        0
                      );
                      const mortalityRate =
                        totalTreated > 0
                          ? ((totalDeaths / totalTreated) * 100).toFixed(2)
                          : "0";

                      return {
                        district: district,
                        deaths: totalDeaths,
                        treated: totalTreated,
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
                    <YAxis
                      tickFormatter={(value) => `${value}%`}
                      domain={[0, "dataMax"]}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value: any, name: string, props: any) => [
                        `${value}%`,
                        `Смертность (${formatNumber(
                          props.payload.deaths
                        )} из ${formatNumber(props.payload.treated)})`,
                      ]}
                    />
                    <Bar dataKey="mortalityRate" fill="#ef4444" radius={4}>
                      <LabelList
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
                  Анализ летальности по районам{" "}
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                  Показатель рассчитывается как отношение количества смертей к
                  общему количеству пролеченных пациентов
                </div>
              </CardFooter>
            </Card>

            {/* Круговая диаграмма - распределение учреждений по районам */}
            <Card className="flex flex-col">
              <CardHeader className="items-center pb-0">
                <CardTitle>Распределение учреждений по районам</CardTitle>
                <CardDescription>
                  Количество медицинских организаций с процентами
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
                    алатауский: {
                      label: "Алатауский",
                      color: "#ec4899",
                    },
                    жетысуский: {
                      label: "Жетысуский",
                      color: "#84cc16",
                    },
                  }}
                  className="mx-auto aspect-square max-h-[250px]"
                >
                  <PieChart>
                    <ChartTooltip
                      content={<ChartTooltipContent hideLabel />}
                      formatter={(value: any, name: string, props: any) => [
                        `${value} учреждений (${props.payload.percentage}%)`,
                        name,
                      ]}
                    />
                    <Pie
                      data={(() => {
                        const districts = [
                          "Алмалинский",
                          "Ауэзовский",
                          "Бостандыкский",
                          "Медеуский",
                          "Наурызбайский",
                          "Турксибский",
                          "Алатауский",
                          "Жетысуский",
                        ];

                        const districtData = districts.map(
                          (district, index) => {
                            const districtFacilities =
                              filteredFacilities.filter((f) =>
                                f.district?.includes(district)
                              );
                            const colors = [
                              "#3b82f6",
                              "#ef4444",
                              "#22c55e",
                              "#f59e0b",
                              "#8b5cf6",
                              "#06b6d4",
                              "#ec4899",
                              "#84cc16",
                            ];
                            return {
                              district: district.toLowerCase(),
                              name: district,
                              value: districtFacilities.length,
                              fill: colors[index % colors.length],
                            };
                          }
                        );

                        const total = districtData.reduce(
                          (sum, d) => sum + d.value,
                          0
                        );

                        return districtData.map((d) => ({
                          ...d,
                          percentage:
                            total > 0
                              ? ((d.value / total) * 100).toFixed(1)
                              : "0",
                        }));
                      })()}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      label={({ name, percentage }) =>
                        `${name}: ${percentage}%`
                      }
                      labelLine={true}
                    />
                    <Legend />
                  </PieChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 leading-none font-medium">
                  Всего учреждений: {filteredFacilities.length}{" "}
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                  Распределение медицинских организаций по районам города с
                  указанием процентов
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
