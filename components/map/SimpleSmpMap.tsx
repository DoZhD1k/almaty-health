"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";

interface SimpleSmpMapProps {
  className?: string;
}

export function SimpleSmpMap({ className = "" }: SimpleSmpMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    console.log("Initializing simple map...");
    setIsLoading(true);
    setError(null);

    try {
      const map = new maplibregl.Map({
        container: containerRef.current,
        style:
          "https://api.maptiler.com/maps/streets-v2/style.json?key=9zZ4lJvufSPFPoOGi6yZ",
        center: [76.886, 43.238], // Almaty coordinates
        zoom: 11,
        attributionControl: false,
      });

      map.on("load", () => {
        console.log("Simple map loaded successfully");
        setIsLoading(false);

        // Добавляем простой маркер для тестирования
        new maplibregl.Marker({ color: "#3b82f6" })
          .setLngLat([76.886, 43.238])
          .setPopup(new maplibregl.Popup().setHTML("<h3>Тестовый маркер</h3>"))
          .addTo(map);
      });

      map.on("error", (e) => {
        console.error("Simple map error:", e);
        setError(
          `Ошибка загрузки карты: ${e.error?.message || "Неизвестная ошибка"}`
        );
        setIsLoading(false);
      });

      mapRef.current = map;
    } catch (error) {
      console.error("Error creating simple map:", error);
      setError(`Ошибка создания карты: ${error}`);
      setIsLoading(false);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center h-96 bg-red-50 rounded-lg ${className}`}
      >
        <div className="text-center p-4">
          <div className="text-red-600 text-lg mb-2">❌</div>
          <p className="text-red-700 font-medium">Ошибка загрузки карты</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center h-96 bg-gray-100 rounded-lg ${className}`}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Загрузка простой карты...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className="w-full h-96 rounded-lg overflow-hidden shadow-md"
      />
      <div className="absolute bottom-4 left-4 bg-white/90 p-2 rounded">
        <p className="text-sm text-green-600">✅ Простая карта загружена</p>
      </div>
    </div>
  );
}
