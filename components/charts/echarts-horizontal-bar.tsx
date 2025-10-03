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
            textStyle: {
              fontSize: 16,
              fontWeight: "normal",
            },
            subtextStyle: {
              fontSize: 12,
              color: "#666",
            },
          }
        : undefined,
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        formatter: function (params: any) {
          const value = params[0].value;
          return `${params[0].name}: ${value}${showAsPercentage ? "%" : ""}`;
        },
      },
      legend: series && series.length > 1 ? {} : undefined,
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "value",
        boundaryGap: [0, 0.01],
        axisLabel: {
          formatter: showAsPercentage ? "{value}%" : "{value}",
        },
      },
      yAxis: {
        type: "category",
        data: series && categories ? categories : data.map((item) => item.name),
      },
      series:
        series && series.length > 0
          ? series.map((s) => ({
              name: s.name,
              type: "bar",
              data: s.data,
              itemStyle: s.color
                ? {
                    color: s.color,
                  }
                : undefined,
            }))
          : [
              {
                name: title || "Data",
                type: "bar",
                data: data.map((item) => ({
                  value: item.value,
                  name: item.name,
                  itemStyle: item.color
                    ? {
                        color: item.color,
                      }
                    : undefined,
                })),
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
  }, [data, title, subtitle, series, categories, onChartReady]);

  // Update chart when data changes
  useEffect(() => {
    if (!chartInstance.current) return;

    const option: EChartsOption = {
      yAxis: {
        data: series && categories ? categories : data.map((item) => item.name),
      },
      series:
        series && series.length > 0
          ? series.map((s) => ({
              data: s.data,
            }))
          : [
              {
                data: data.map((item) => ({
                  value: item.value,
                  name: item.name,
                  itemStyle: item.color
                    ? {
                        color: item.color,
                      }
                    : undefined,
                })),
              },
            ],
    };

    chartInstance.current.setOption(option);
  }, [data, series, categories]);

  return (
    <div ref={chartRef} className={`w-full h-[${height}px] ${className}`} />
  );
}
