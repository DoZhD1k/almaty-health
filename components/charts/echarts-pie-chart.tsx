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
  height = 400,
  radius = "60%",
  center = ["50%", "55%"],
  showLegend = true,
  legendPosition = "bottom",
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
        trigger: "item",
        formatter: "{b}: {c} ({d}%)",
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
                ? "10%"
                : legendPosition === "bottom"
                ? "85%"
                : "middle",
            textStyle: {
              fontSize: 13,
              color: "#374151",
            },
            itemWidth: 12,
            itemHeight: 12,
            itemGap: 15,
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
            itemStyle: {
              ...item.itemStyle,
              borderWidth: 2,
              borderColor: "#ffffff",
              shadowBlur: 8,
              shadowColor: "rgba(0, 0, 0, 0.1)",
            },
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 15,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.3)",
              borderWidth: 3,
              borderColor: "#ffffff",
            },
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 600,
            },
          },
          label: {
            show: true,
            formatter: "{d}%",
            fontSize: 12,
            fontWeight: 500,
            color: "#374151",
          },
          labelLine: {
            show: true,
            smooth: true,
            length: 15,
            length2: 8,
            lineStyle: {
              color: "#9CA3AF",
              width: 1,
            },
          },
          animationType: "scale",
          animationEasing: "elasticOut",
          animationDelay: function (idx: number) {
            return Math.random() * 200;
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
            itemStyle: {
              ...item.itemStyle,
              borderWidth: 2,
              borderColor: "#ffffff",
              shadowBlur: 8,
              shadowColor: "rgba(0, 0, 0, 0.1)",
            },
          })),
        },
      ],
    };

    chartInstance.current.setOption(option);
  }, [data]);

  return (
    <div
      ref={chartRef}
      className={`w-full ${className}`}
      style={{ height: `${height}px` }}
    />
  );
}
