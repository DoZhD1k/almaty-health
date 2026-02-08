"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";

type EChartsOption = echarts.EChartsOption;

interface HorizontalBarData {
  name: string;
  value: number;
  color?: string;
}

interface EChartsHorizontalBarProps {
  data: HorizontalBarData[];
  title?: string;
  subtitle?: string;
  height?: number;
  series?: Array<{
    name: string;
    data: number[];
    color?: string;
  }>;
  categories?: string[];
  className?: string;
  showAsPercentage?: boolean;
  onChartReady?: (chart: echarts.ECharts) => void;
}

export function EChartsHorizontalBar({
  data,
  title,
  subtitle,
  height = 400,
  series,
  categories,
  className = "",
  showAsPercentage = false,
  onChartReady,
}: EChartsHorizontalBarProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Initialize chart
    chartInstance.current = echarts.init(chartRef.current);

    if (onChartReady) {
      onChartReady(chartInstance.current);
    }

    const option: EChartsOption = {
      title: title
        ? {
            text: title,
            subtext: subtitle,
            left: "left",
            top: "5%",
            textStyle: {
              fontSize: 18,
              fontWeight: 600,
              color: "#1F2937",
            },
            subtextStyle: {
              fontSize: 14,
              color: "#6B7280",
              lineHeight: 20,
            },
          }
        : undefined,
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
          shadowStyle: {
            color: "rgba(0, 0, 0, 0.1)",
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
        formatter: function (params: any) {
          const value = params[0].value;
          return `${params[0].name}: ${
            showAsPercentage ? `${value}%` : value.toLocaleString("ru-RU")
          }`;
        },
      },
      legend:
        series && series.length > 1
          ? {
              top: "10%",
              left: "center",
              textStyle: {
                fontSize: 13,
                color: "#374151",
              },
              itemWidth: 12,
              itemHeight: 12,
              itemGap: 20,
            }
          : undefined,
      grid: {
        left: 160,
        right: "8%",
        top: 1,
        bottom: 1,
        containLabel: false,
      },
      xAxis: {
        type: "value",
        boundaryGap: [0, 0.01],
        axisLabel: {
          formatter: showAsPercentage ? "{value}%" : "{value}",
          fontSize: 12,
          color: "#6B7280",
          height: 1,
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
      yAxis: {
        type: "category",
        data: series && categories ? categories : data.map((item) => item.name),
        axisLabel: {
          fontSize: 11,
          color: "#374151",
          margin: 10,
          interval: 0,
          overflow: "truncate",
          width: 150,
          formatter: function (value: string) {
            if (value.length > 35) {
              return value.substring(0, 32) + "...";
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
      series:
        series && series.length > 0
          ? series.map((s, index) => ({
              name: s.name,
              type: "bar",
              data: s.data,
              barMaxWidth: 14,
              barCategoryGap: "30%",
              itemStyle: {
                color: s.color || `hsl(${210 + index * 30}, 70%, 60%)`,
                borderRadius: [0, 4, 4, 0],
                shadowBlur: 8,
                shadowColor: "rgba(0, 0, 0, 0.1)",
                shadowOffsetX: 2,
                shadowOffsetY: 2,
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 15,
                  shadowColor: "rgba(0, 0, 0, 0.2)",
                },
              },
              animationDelay: function (idx: number) {
                return idx * 50;
              },
            }))
          : [
              {
                name: title || "Data",
                type: "bar",
                data: data.map((item) => ({
                  value: item.value,
                  name: item.name,
                  itemStyle: {
                    color: item.color || "#3B82F6",
                    borderRadius: [0, 4, 4, 0],
                    shadowBlur: 8,
                    shadowColor: "rgba(0, 0, 0, 0.1)",
                    shadowOffsetX: 2,
                    shadowOffsetY: 2,
                  },
                })),
                barMaxWidth: 14,
                barCategoryGap: "30%",
                label: showAsPercentage
                  ? {
                      show: true,
                      position: "right",
                      formatter: "{c}%",
                      fontSize: 11,
                      color: "#374151",
                      fontWeight: 500,
                    }
                  : undefined,
                emphasis: {
                  itemStyle: {
                    shadowBlur: 15,
                    shadowColor: "rgba(0, 0, 0, 0.2)",
                  },
                },
                animationDelay: function (idx: number) {
                  return idx * 50;
                },
              },
            ],
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
  }, [
    data,
    title,
    subtitle,
    series,
    categories,
    showAsPercentage,
    onChartReady,
  ]);

  // Update chart when data changes
  useEffect(() => {
    if (!chartInstance.current) return;

    const option: EChartsOption = {
      yAxis: {
        data: series && categories ? categories : data.map((item) => item.name),
      },
      series:
        series && series.length > 0
          ? series.map((s, index) => ({
              data: s.data,
              itemStyle: {
                color: s.color || `hsl(${210 + index * 30}, 70%, 60%)`,
                borderRadius: [0, 4, 4, 0],
                shadowBlur: 8,
                shadowColor: "rgba(0, 0, 0, 0.1)",
                shadowOffsetX: 2,
                shadowOffsetY: 2,
              },
            }))
          : [
              {
                data: data.map((item) => ({
                  value: item.value,
                  name: item.name,
                  itemStyle: {
                    color: item.color || "#3B82F6",
                    borderRadius: [0, 4, 4, 0],
                    shadowBlur: 8,
                    shadowColor: "rgba(0, 0, 0, 0.1)",
                    shadowOffsetX: 2,
                    shadowOffsetY: 2,
                  },
                })),
              },
            ],
    };

    chartInstance.current.setOption(option);
  }, [data, series, categories]);

  return (
    <div
      ref={chartRef}
      className={`w-full ${className}`}
      style={{ height: `${height}px` }}
    />
  );
}
