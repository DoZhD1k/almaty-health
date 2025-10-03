"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";

type EChartsOption = echarts.EChartsOption;

interface PieChartData {
  value: number;
  name: string;
  itemStyle?: {
    color?: string;
  };
}

interface EChartsPieChartProps {
  data: PieChartData[];
  title?: string;
  subtitle?: string;
  height?: number;
  radius?: string | [string, string];
  center?: [string, string];
  showLegend?: boolean;
  legendPosition?: "left" | "right" | "top" | "bottom";
  className?: string;
  onChartReady?: (chart: echarts.ECharts) => void;
}

export function EChartsPieChart({
  data,
  title,
  subtitle,
  height = 300,
  radius = "50%",
  center = ["50%", "50%"],
  showLegend = true,
  legendPosition = "right",
  className = "",
  onChartReady,
}: EChartsPieChartProps) {
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
            left: "center",
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
        trigger: "item",
        formatter: "{a} <br/>{b} : {c} ({d}%)",
      },
      legend: showLegend
        ? {
            orient:
              legendPosition === "left" || legendPosition === "right"
                ? "vertical"
                : "horizontal",
            left:
              legendPosition === "left"
                ? "left"
                : legendPosition === "right"
                ? "right"
                : "center",
            top:
              legendPosition === "top"
                ? "top"
                : legendPosition === "bottom"
                ? "bottom"
                : "middle",
            textStyle: {
              fontSize: 12,
            },
          }
        : undefined,
      series: [
        {
          name: title || "Data",
          type: "pie",
          radius: radius,
          center: center,
          data: data.map((item) => ({
            value: item.value,
            name: item.name,
            itemStyle: item.itemStyle,
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
          label: {
            show: true,
            formatter: "{b}: {d}%",
          },
          labelLine: {
            show: true,
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
    radius,
    center,
    showLegend,
    legendPosition,
    onChartReady,
  ]);

  // Update chart when data changes
  useEffect(() => {
    if (!chartInstance.current) return;

    const option: EChartsOption = {
      series: [
        {
          data: data.map((item) => ({
            value: item.value,
            name: item.name,
            itemStyle: item.itemStyle,
          })),
        },
      ],
    };

    chartInstance.current.setOption(option);
  }, [data]);

  return <div ref={chartRef} className={`w-full h-[300px] ${className}`} />;
}
