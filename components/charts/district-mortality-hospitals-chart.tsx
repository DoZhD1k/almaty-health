"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { FacilityStatistic } from "@/types/healthcare";

type EChartsOption = echarts.EChartsOption;

interface DistrictMortalityHospitalsChartProps {
  filteredFacilities: FacilityStatistic[];
  height?: number;
  className?: string;
}

export function DistrictMortalityHospitalsChart({
  filteredFacilities,
  height = 400,
  className = "",
}: DistrictMortalityHospitalsChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Initialize chart
    chartInstance.current = echarts.init(chartRef.current);

    // Группируем данные по районам
    const districtData = (() => {
      const districtStats = new Map();

      filteredFacilities.forEach((facility) => {
        const district = facility.district || "Не указан";
        if (!districtStats.has(district)) {
          districtStats.set(district, {
            hospitalCount: 0,
            totalDeaths: 0,
            totalPatients: 0,
          });
        }

        const stats = districtStats.get(district);
        stats.hospitalCount += 1;
        stats.totalDeaths +=
          (facility.death_smp || 0) + (facility.death_vtmp || 0);
        stats.totalPatients += facility.total_admitted_patients || 0;
      });

      const data = Array.from(districtStats.entries()).map(
        ([district, stats]) => ({
          district,
          hospitalCount: stats.hospitalCount,
          mortalityRate:
            stats.totalPatients > 0
              ? (stats.totalDeaths / stats.totalPatients) * 100
              : 0,
        })
      );

      // Сортируем по количеству стационаров (по убыванию)
      return data.sort((a, b) => b.hospitalCount - a.hospitalCount);
    })();

    const districts = districtData.map((item) => item.district);
    const hospitalCounts = districtData.map((item) => item.hospitalCount);
    const mortalityRates = districtData.map((item) =>
      Number(item.mortalityRate.toFixed(2))
    );

    const option: EChartsOption = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          crossStyle: {
            color: "#999",
          },
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#E5E7EB",
        borderWidth: 1,
        borderRadius: 8,
        textStyle: {
          color: "#374151",
          fontSize: 13,
        },
        extraCssText:
          "box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);",
      },
      legend: {
        data: ["Количество стационаров", "Смертность"],
        top: "5%",
        left: "center",
        textStyle: {
          fontSize: 13,
          color: "#374151",
        },
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 20,
      },
      grid: {
        left: "5%",
        right: "5%",
        bottom: "15%",
        top: "15%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          data: districts,
          axisPointer: {
            type: "shadow",
          },
          axisLabel: {
            fontSize: 11,
            color: "#374151",
            rotate: -45,
            interval: 0,
            formatter: function (value: string) {
              // Укорачиваем длинные названия районов
              if (value.length > 15) {
                return value.substring(0, 12) + "...";
              }
              return value;
            },
          },
          axisLine: {
            lineStyle: {
              color: "#E5E7EB",
            },
          },
          axisTick: {
            show: false,
          },
        },
      ],
      yAxis: [
        {
          type: "value",
          name: "Количество стационаров",
          nameTextStyle: {
            color: "#374151",
            fontSize: 12,
          },
          axisLabel: {
            formatter: "{value}",
            fontSize: 11,
            color: "#6B7280",
          },
          axisLine: {
            lineStyle: {
              color: "#E5E7EB",
            },
          },
          splitLine: {
            lineStyle: {
              color: "#F3F4F6",
              type: "dashed",
            },
          },
        },
        {
          type: "value",
          name: "Смертность (%)",
          nameTextStyle: {
            color: "#374151",
            fontSize: 12,
          },
          axisLabel: {
            formatter: "{value}%",
            fontSize: 11,
            color: "#6B7280",
          },
          axisLine: {
            lineStyle: {
              color: "#E5E7EB",
            },
          },
          splitLine: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: "Количество стационаров",
          type: "bar",
          yAxisIndex: 0,
          data: hospitalCounts,
          itemStyle: {
            color: "#3B82F6",
            borderRadius: [4, 4, 0, 0],
            shadowBlur: 6,
            shadowColor: "rgba(59, 130, 246, 0.3)",
            shadowOffsetY: 3,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(59, 130, 246, 0.5)",
            },
          },
          barMaxWidth: 40,
          label: {
            show: true,
            position: "top",
            fontSize: 10,
            color: "#374151",
            fontWeight: 500,
          },
          animationDelay: function (idx: number) {
            return idx * 100;
          },
        },
        {
          name: "Смертность",
          type: "line",
          yAxisIndex: 1,
          data: mortalityRates,
          lineStyle: {
            color: "#ff4033",
            width: 3,
            shadowBlur: 8,
            shadowColor: "rgba(30, 64, 175, 0.3)",
            shadowOffsetY: 2,
          },
          itemStyle: {
            color: "#ff4033",
            borderWidth: 3,
            borderColor: "#ffffff",
            shadowBlur: 8,
            shadowColor: "rgba(30, 64, 175, 0.3)",
          },
          symbol: "circle",
          symbolSize: 8,
          emphasis: {
            itemStyle: {
              borderWidth: 4,
              shadowBlur: 12,
            },
          },
          label: {
            show: true,
            position: "top",
            fontSize: 10,
            color: "#ff8c84",
            fontWeight: 600,
            formatter: "{c}%",
            offset: [0, -10],
          },
          animationDelay: function (idx: number) {
            return idx * 100 + 500;
          },
        },
      ],
      animation: true,
      animationDuration: 1000,
      animationEasing: "cubicOut",
    };

    chartInstance.current.setOption(option);

    // Handle resize
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstance.current?.dispose();
    };
  }, [filteredFacilities]);

  return (
    <div
      ref={chartRef}
      className={`w-full ${className}`}
      // eslint-disable-next-line react/no-inline-styles
      style={{
        height: height,
      }}
    />
  );
}
