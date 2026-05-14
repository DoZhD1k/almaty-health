"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { ExpressionSpecification } from "maplibre-gl";
import { useMapInitialization } from "@/hooks/use-map-initialization";
import { FacilityStatistic, Hospital, SeismicPoint } from "@/types/healthcare";
import { healthcareApi } from "@/lib/api/healthcare";

interface MapLibreFacilityMapProps {
  facilities?: Hospital[];
  className?: string;
  fullscreen?: boolean;
  selectedDistrict?: string;
  mapMode?: "load" | "buildings" | "geo";
  seismicData?: SeismicPoint[];
  showSeismicGrid?: boolean;
  refusalsData?: any[];
  plannedZones?: any;
  plannedObjects?: any;
  gridCells?: any;
  geoAccessMode?: "current" | "planned";
  activeGeoLayers?: string[];
}

interface DistrictFeature {
  type: string;
  geometry: any;
  properties: {
    id: number;
    name_ru: string;
    name_kz: string;
    marker: [number, number];
  };
}


let _popupCssInjected = false;
const injectPopupCss = () => {
  if (_popupCssInjected) return;
  _popupCssInjected = true;
  const css = `
  .ml-card{max-width:320px;max-height:480px;overflow-y:auto;border:1px solid rgba(0,0,0,.08);border-radius:10px;scrollbar-width:thin;background:#fff;
    box-shadow:0 6px 16px rgba(0,0,0,.06);font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}
  .ml-card::-webkit-scrollbar { width: 3px; }
  .ml-card::-webkit-scrollbar-thumb { background: #ddd;}
  .ml-hd{padding:10px 12px 6px}
  .ml-hd > div{display:flex;gap:8px;align-items:flex-start;flex-wrap:wrap}
  .ml-ttl{margin:0;margin-bottom:2px;font-weight:600;font-size:14px;line-height:1.25;color:#111;flex:1;min-width:0}
  .ml-chip{flex-shrink:0;border-radius:999px;padding:2px 8px;font-weight:700;font-size:11px;white-space:nowrap}
  .ml-chip.low{background:rgba(107,114,128,.15);color:#374151}
  .ml-chip.normal{background:rgba(16,185,129,.15);color:#065f46}
  .ml-chip.high{background:rgba(245,158,11,.15);color:#92400e}
  .ml-chip.critical{background:rgba(239,68,68,.15);color:#7f1d1d}
  .ml-meta{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}
  .ml-pill{background:#f3f4f6;border-radius:6px;padding:1px 6px;font-size:10px;color:#4b5563}
  .ml-bd{padding:0 12px 10px}
  .ml-kpi{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:4px}
  .ml-box{background:#f9fafb;border-radius:6px;padding:4px 8px}
  .ml-cap{font-size:11px;color:#6b7280}
  .ml-val{font-weight:600;color:#111}
  .ml-row{display:flex;justify-content:space-between;align-items:center;font-size:10px;margin:2px 0;color:#6b7280}
  .ml-bar{height:4px;margin-bottom:4px;width:100%;background:#f3f4f6;border-radius:999px;overflow:hidden}
  .ml-bar>i{display:block;height:100%}
  .ml-addr{margin-top:10px;font-size:11px;color:#6b7280}
  .ml-addr b{color:#374151}
  .ml-detail-card {
    max-width: 420px;
    font-family: 'Inter', -apple-system, sans-serif;
    color: #333;
    line-height: 1.4;
  }
  .ml-header-title { font-size: 18px; font-weight: 800; color: #2c3e50; margin-bottom: 8px; line-height: 1.2; }
  .ml-tag { background: #f1f3f5; border-radius: 12px; padding: 4px 12px; font-size: 13px; font-weight: 600; color: #495057; display: inline-flex; align-items: center; gap: 6px; }
  .ml-subheader { font-size: 13px; color: #868e96; margin: 8px 0 12px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
  .ml-alert-box { 
    background: #FFF9F2; border: 1px solid #FFD8A8; border-radius: 8px; padding: 10px; 
    color: #D9480F; font-size: 13px; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;
  }
  .ml-section-header { 
    font-weight: 700; font-size: 14px; margin: 16px 0 10px; 
    display: flex; align-items: center; gap: 8px; color: #212529;
  }
  .ml-occ-value { font-weight: 700; font-size: 15px; }
  .ml-main-progress { height: 10px; background: #e9ecef; border-radius: 5px; margin: 8px 0; overflow: hidden; }
  .ml-main-fill { height: 100%; transition: width 0.3s ease; }
  .ml-metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 12px; color: #495057; background: #f8f9fa; padding: 10px; border-radius: 8px; }
  .ml-metrics-grid b { color: #212529; }
  .ml-row-item { margin-bottom: 10px; }
  .ml-row-label { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: #495057; }
  .ml-mini-bar { height: 6px; background: #e9ecef; border-radius: 3px; position: relative; }
  .ml-mini-fill { height: 100%; border-radius: 3px; }
  .ml-bld-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 5px; }
  .ml-bld-table th { text-align: left; color: #adb5bd; font-weight: 500; padding-bottom: 5px; border-bottom: 1px solid #eee; }
  .ml-bld-table td { padding: 6px 0; border-bottom: 1px solid #f8f9fa; }
  .ml-bld-wrapper {
    max-height: 120px;
    overflow-y: auto;
    margin-top: 4px;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    scrollbar-width: thin;
  }
  .ml-profiles {
    max-height: 100px; 
    overflow-y: auto; 
    margin-top:8px;
  }
  .ml-bld-wrapper::-webkit-scrollbar { width: 3px; }
  .ml-bld-wrapper::-webkit-scrollbar-thumb { background: #ccc; }
  .ml-profiles::-webkit-scrollbar { width: 3px; }
  .ml-profiles::-webkit-scrollbar-thumb { background: #ccc; }
  .ml-wear-badge { padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; color: white; }
  .ml-section-title { font-weight: bold; font-size: 11px; margin: 8px 0 4px; display: flex; align-items: center; gap: 6px; }
  .ml-warning-box { background: #fff5f2; border: 1px solid #ffccbc; border-radius: 6px; padding: 8px; color: #d32f2f; font-size: 12px; margin-bottom: 10px; }
  .ml-stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 12px; }
  .ml-progress-row { margin-bottom: 8px; font-size: 12px; }
  .ml-progress-bar-wrapper { display: flex; align-items: center; gap: 10px; }
  .ml-progress-bar { flex: 1; height: 8px; background: #eee; border-radius: 4px; overflow: hidden; }
  .ml-progress-fill { height: 100%; border-radius: 4px; }
  .ml-table { width: 100%; font-size: 11px; border-collapse: collapse; }
  .ml-table th { text-align: left; color: #888; padding-bottom: 5px; }
  .ml-table td { padding: 4px 0; border-bottom: 1px solid #f0f0f0; }
  .ml-table thead th {
    position: sticky;
    top: 0;
    background: #fff;
    z-index: 1;
    box-shadow: inset 0 -1px 0 #eee;
    padding-top: 4px;
    padding-bottom: 4px;
  }
  .ml-badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
};

const fmt = (v: number | string) =>
  new Intl.NumberFormat("ru-RU").format(Number(v ?? 0));

const statusColor = (rate01: number) => {
  if (rate01 > 0.95)
    return { hex: "#dc2626", chip: "critical", label: "Критическая" };
  if (rate01 > 0.8) return { hex: "#ea580c", chip: "high", label: "Высокая" };
  if (rate01 >= 0.5)
    return { hex: "#16a34a", chip: "normal", label: "Нормальная" };
  return { hex: "#6b7280", chip: "low", label: "Низкая" };
};

function buildComplexHospitalPopup(d: any) {
  injectPopupCss();

  const getOccColor = (cat: string) => {
    const map: any = { over: '#dc2626', vhigh: '#ea580c', high: '#f59e0b', norm: '#16a34a', low: '#6b7280', vlow: '#9ca3af' };
    return map[cat] || '#6b7280';
  };

  const getOccLabel = (cat: string) => {
    const map: any = { over: 'Критическая', vhigh: 'Очень высокая', high: 'Высокая', norm: 'Нормальная', low: 'Низкая', vlow: 'Минимальная' };
    return map[cat] || 'Неизвестно';
  };

  const occColor = getOccColor(d.occ_cat);

  const profilesHtml = d.bed_profiles?.map((p: any) => {
    const pct = d.total_beds > 0 ? Math.round((p.beds / d.total_beds) * 100) : 0;
    return `
      <div class="ml-row" style="margin-bottom: 2px;">
        <span>${p.profile_name}</span>
        <b>${p.beds} к. (${pct}%)</b>
      </div>
      <div class="ml-bar" style="height: 4px; margin-bottom: 8px;"><i style="width: ${pct}%; background: #3b82f6"></i></div>
    `;
  }).join('') || '';

  const patientStats = [
    { label: 'Сельские', val: d.rural_admitted, color: '#16a34a' },
    { label: 'Дети 0–14', val: d.children_admitted, color: '#0ea5e9' },
  ].map(s => {
    const pct = d.admitted > 0 ? ((s.val / d.admitted) * 100).toFixed(1) : '0.0';
    return `
      <div class="ml-row">
        <span>${s.label}</span> <b style="color:${s.color}">${pct}%</b>
      </div>
      <div class="ml-bar"><i style="width:${pct}%; background:${s.color}"></i></div>
    `;
  }).join('');

  return `
  <div class="ml-card">
    <div class="ml-hd">
      <h3 class="ml-ttl">${d.name}</h3>
      <div style="display:flex; align-items:center; gap:6px;">
         <span class="ml-chip" style="background:${occColor}22; color:${occColor}; font-size:10px; padding:1px 6px;">
          ${d.pct_occupied}% загрузки
        </span>
        <span style="font-size:10px; color:#999;">${d.ownership}</span>
      </div>
      <div class="ml-meta">
        <span class="ml-pill">🚐 ${d.org_type}</span>
        <span class="ml-pill">${d.district}</span>
      </div>
    </div>

    <div class="ml-bd">
      ${d.work > 340 ? `
        <div class="ml-warning-box" style="margin-top:0; margin-bottom:8px; background:#fff5f2; border:1px solid #ffccbc; padding:4px 8px; border-radius:8px; font-size:10px; color:#d32f2f;">
          ⚠️ Работа койки <b>${d.work} дн/год</b> — перегружено (норма ≤340)
        </div>
      ` : ''}

      <div class="ml-row">
        <span>Загруженность коек</span>
        <b style="color:${occColor}">${d.pct_occupied}%</b>
      </div>
      <div class="ml-bar"><i style="width:${Math.min(d.pct_occupied, 100)}%; background:${occColor}"></i></div>
      <div style="font-size: 10px; color: #999; margin-top: 4px; display:flex; justify-content:space-between;">
        <span>Занято: <b>${Math.round(d.occupied_beds)}</b></span>
        <span>Всего: <b>${d.total_beds}</b></span>
      </div>

      <div class="ml-section-title" style="margin-top:14px; font-size:12px; border-bottom:1px solid #eee; padding-bottom:4px;">📊 Основные показатели</div>
      <div class="ml-kpi">
        <div class="ml-box">
          <div class="ml-cap">СДПБ / Оборот</div>
          <div class="ml-val" style="font-size:12px;">${d.sdpb} дн / ${d.turnover}</div>
        </div>
        <div class="ml-box">
          <div class="ml-cap">Летальность</div>
          <div class="ml-val" style="font-size:12px; color:#dc2626;">${d.lethal}%</div>
        </div>
      </div>

      <div class="ml-section-title">👥 Пациенты</div>
      ${patientStats}

      <div class="ml-section-title" style="margin-top:14px; font-size:12px; border-bottom:1px solid #eee; padding-bottom:4px;">🛌 Профили (${d.total_beds} коек)</div>
      <div class="ml-profiles">
        ${profilesHtml}
      </div>

      <div class="ml-section-title">🏢 Все здания (${d.bld_count} корп.)</div>
      <div class="ml-bld-wrapper">
        <table class="ml-table" style="font-size:10px; margin-top: 0; width: 100%;">
          <thead>
            <tr>
              <th style="padding-left: 4px;">Год</th>
              <th>Состояние</th>
              <th style="text-align:right; padding-right: 4px;">Износ</th>
            </tr>
          </thead>
          <tbody>
            ${d.all_blds && d.all_blds.length > 0 ? d.all_blds.map((b: any) => `
              <tr>
                <td style="padding-left: 4px;">${b.year_built || '—'}</td>
                <td>
                  <span style="display:flex; align-items:center; gap:4px; color:${b.wear > 50 ? '#ea580c' : '#16a34a'}">
                    ${b.wear > 50 ? '● Кап.рем' : '● Исправно'}
                  </span>
                </td>
                <td style="text-align:right; padding-right: 4px;"><b>${b.wear}%</b></td>
              </tr>
            `).join('') : '<tr><td colspan="3" style="text-align:center; padding: 10px;">Нет данных</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const dy = (lat2 - lat1) * 111000;
  const dx = (lng2 - lng1) * 111000 * Math.cos(lat1 * Math.PI / 180);
  return Math.sqrt(dx * dx + dy * dy);
}

function computeGridData(gridGeoJSON: any, hospitalPoints: {lat: number, lng: number}[]) {
  if (!gridGeoJSON || !hospitalPoints.length) return gridGeoJSON;

  const features = gridGeoJSON.features.map((f: any) => {
    const coords = f.geometry.coordinates[0][0][0]; 
    const cellLng = coords[0];
    const cellLat = coords[1];

    let minD = Infinity;
    for (const p of hospitalPoints) {
      const d = getDistanceMeters(cellLat, cellLng, p.lat, p.lng);
      if (d < minD) minD = d;
    }

    let color = "#C62828"; // Красный (>5км)
    if (minD <= 1200) color = "#2E7D32";      // Зеленый (пешком)
    else if (minD <= 5000) color = "#1565C0"; // Синий (транспорт)

    return {
      ...f,
      properties: { ...f.properties, dynamicColor: color, dist: minD }
    };
  });

  return { ...gridGeoJSON, features };
}

export function MapLibreFacilityMap({
  facilities = [],
  className = "",
  fullscreen = false,
  selectedDistrict = "Все районы",
  mapMode = "load",
  seismicData = [],
  showSeismicGrid = false,
  refusalsData = [],
  plannedZones = null,
  plannedObjects = null,
  gridCells = null,
  geoAccessMode = "current",
  activeGeoLayers = [],
}: MapLibreFacilityMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { mapRef, isLoading, zoomIn, zoomOut, resetView } =
    useMapInitialization(containerRef);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [districts, setDistricts] = useState<DistrictFeature[]>([]);

  useEffect(() => {
    fetch("https://admin.smartalmaty.kz/api/v1/address/districts")
      .then((res) => res.json())
      .then((data) => {
        console.log("Districts API response:", data);
        if (data.results && data.results.features) {
          const filteredDistricts = data.results.features.filter(
            (feature: any) => {
              const id = feature.id || feature.properties?.id;
              console.log(
                "District id:",
                id,
                "name:",
                feature.properties?.name_ru,
              );
              return id !== 0 && id !== 9;
            },
          );
          console.log(
            "Districts loaded (filtered):",
            filteredDistricts.length,
            "from",
            data.results.features.length,
          );
          setDistricts(filteredDistricts);
        }
      })
      .catch((err) => console.error("Error loading districts:", err));
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!districts.length) {
      console.log("No districts data yet");
      return;
    }

    const map = mapRef.current;
    console.log(
      "Districts effect triggered, isLoading:",
      isLoading,
      "style loaded:",
      map.isStyleLoaded(),
    );

    const addLayers = () => {
      try {
        const geojson = {
          type: "FeatureCollection",
          features: districts,
        };

        console.log(
          "Adding districts source with",
          districts.length,
          "features",
        );
        console.log("Sample feature:", districts[0]);

        if (map.getLayer("districts-fill")) {
          console.log("Removing existing districts-fill layer");
          map.removeLayer("districts-fill");
        }
        if (map.getLayer("districts-outline")) {
          console.log("Removing existing districts-outline layer");
          map.removeLayer("districts-outline");
        }
        if (map.getLayer("districts-highlight")) {
          console.log("Removing existing districts-highlight layer");
          map.removeLayer("districts-highlight");
        }
        if (map.getSource("districts")) {
          console.log("Removing existing districts source");
          map.removeSource("districts");
        }

        map.addSource("districts", {
          type: "geojson",
          data: geojson as any,
        });
        console.log("Districts source added");

        if (selectedDistrict !== "Все районы") {
          map.addLayer({
            id: "districts-fill",
            type: "fill",
            source: "districts",
            filter: ["==", ["get", "name_ru"], selectedDistrict],
            paint: {
              "fill-color": "#3772ff",
              "fill-opacity": 0.3,
            },
          });
          console.log(
            "Districts fill layer added (filtered for:",
            selectedDistrict,
            ")",
          );

          map.addLayer({
            id: "districts-outline",
            type: "line",
            source: "districts",
            filter: ["==", ["get", "name_ru"], selectedDistrict],
            paint: {
              "line-color": "#3772ff",
              "line-width": 3,
              "line-opacity": 0.9,
            },
          });
          console.log(
            "Districts outline layer added (filtered for:",
            selectedDistrict,
            ")",
          );
        } else {
          map.addLayer({
            id: "districts-fill",
            type: "fill",
            source: "districts",
            paint: {
              "fill-color": "#3772ff",
              "fill-opacity": 0.1,
            },
          });
          console.log("Districts fill layer added (all districts)");

          map.addLayer({
            id: "districts-outline",
            type: "line",
            source: "districts",
            paint: {
              "line-color": "#3772ff",
              "line-width": 2,
              "line-opacity": 0.6,
            },
          });
          console.log("Districts outline layer added (all districts)");
        }

        if (map.getLayer("facility-clusters"))
          map.moveLayer("facility-clusters");
        if (map.getLayer("cluster-count")) map.moveLayer("cluster-count");
        if (map.getLayer("unclustered-facility"))
          map.moveLayer("unclustered-facility");

        console.log("All district layers added successfully");
      } catch (error) {
        console.error("Error adding district layers:", error);
      }
    };

    const attemptAddLayers = () => {
      if (map.isStyleLoaded()) {
        addLayers();
      } else {
        map.once("idle", addLayers);
      }
    };

    setTimeout(attemptAddLayers, 500);

    return () => {
      if (!map || map._removed) return;
      try {
        if (map.getLayer("districts-fill")) map.removeLayer("districts-fill");
        if (map.getLayer("districts-outline"))
          map.removeLayer("districts-outline");
        if (map.getLayer("districts-highlight"))
          map.removeLayer("districts-highlight");
        if (map.getSource("districts")) map.removeSource("districts");
      } catch (e) {
        console.warn("Error cleaning up districts:", e);
      }
    };
  }, [districts, selectedDistrict, mapRef]);

  useEffect(() => {
    if (!mapRef.current || isLoading) return;

    const map = mapRef.current;

    const geoJsonFeatures = facilities
      .filter(
        (f) =>
          f.lat != null &&
          f.lng != null &&
          !isNaN(f.lat) &&
          !isNaN(f.lng),
      )
      .map((hospital) => ({
        type: "Feature" as const,
        properties: {
          ...hospital,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [
            Number(hospital.lng),
            Number(hospital.lat),
          ],
        },
      }));

    const geoJsonData = {
      type: "FeatureCollection" as const,
      features: geoJsonFeatures,
    };

    const addClusterLayers = () => {
      if (map.getSource("facilities-clustered")) {
        (
          map.getSource("facilities-clustered") as maplibregl.GeoJSONSource
        ).setData(geoJsonData);
        map.setPaintProperty("unclustered-facility", "circle-color", getMapColorExpression(mapMode));
        return;
      }

      map.addSource("facilities-clustered", {
        type: "geojson",
        data: geoJsonData,
      });

      map.addLayer({
        id: "unclustered-facility",
        type: "circle",
        source: "facilities-clustered",
        paint: {
          "circle-radius": [
            "max",
            7,
            ["min", 28, ["+", 7, ["*", ["sqrt", ["get", "total_beds"]], 0.45]]]
          ],
          "circle-color": getMapColorExpression(mapMode),
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
          "circle-opacity": 0.9,
        },
      });

      if (map.getLayer("districts-fill") || map.getLayer("districts-outline")) {
        map.moveLayer("unclustered-facility");
      }

      map.setPaintProperty(
        "unclustered-facility", 
        "circle-opacity", 
        mapMode === "geo" ? 0.3 : 0.9 // В геоанализе делаем точки бледными
      );

      map.on("click", "unclustered-facility", async (e: any) => {
        if (!e.features || !e.features.length) return;
        
        const feature = e.features[0];
        const coords = feature.geometry.coordinates.slice();
        const hospitalId = feature.properties.unified_id;

        const popup = new maplibregl.Popup({ offset: 25, maxWidth: '400px' })
          .setLngLat(coords)
          .setHTML('<div style="padding: 20px; text-align:center;">Загрузка данных...</div>')
          .addTo(map);

        try {
          const detailData = await healthcareApi.getHospitalDetail(hospitalId);
          
          popup.setHTML(buildComplexHospitalPopup(detailData));
        } catch (err) {
          console.error(err);
          popup.setHTML('<div style="padding: 20px; color: red;">Ошибка при загрузке данных</div>');
        }
      });

      map.on("mouseenter", "unclustered-facility", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "unclustered-facility", () => {
        map.getCanvas().style.cursor = "";
      });
    };

    if (map.isStyleLoaded()) {
      addClusterLayers();
    } else {
      map.once("idle", addClusterLayers);
    }
  }, [facilities, isLoading, mapRef, mapMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const sourceId = "seismic-source";
    const layerId = "seismic-layer";

    const updateSeismic = () => {
      if (!map.isStyleLoaded()) {
        map.once('idle', updateSeismic);
        return;
      }
      
      if (!showSeismicGrid || !seismicData || seismicData.length === 0) {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
        return;
      }

    const geojson: any = {
      type: "FeatureCollection",
      features: seismicData
        // .filter(s => s.seismic_score >= 0.1)
        .map(s => ({
          type: "Feature",
          properties: { ...s, seismic_score: Number(s.seismic_score)  },
          geometry: { type: "Point", coordinates: [Number(s.lng), Number(s.lat)] }
        }))
    };

    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(geojson);
    } else {
      map.addSource(sourceId, { type: "geojson", data: geojson });
      map.addLayer({
        id: layerId,
        type: "circle",
        source: sourceId,
        paint: {
          "circle-radius": ["+", 8, ["*", ["get", "seismic_score"], 24]],
          "circle-color": [
            "step", ["get", "seismic_score"],
            "#FDD835", 0.4, "#EF6C00", 0.7, "#B71C1C"
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": [
            "step", ["get", "seismic_score"],
            "#FDD835", 0.4, "#EF6C00", 0.7, "#B71C1C"
          ],
          "circle-opacity": 0.18,
          "circle-stroke-opacity": 0.7
        }
      });
      if (map.getLayer("unclustered-facility")) {
        map.moveLayer(layerId, "unclustered-facility");
      }
    }
    };

    updateSeismic();
  }, [seismicData, showSeismicGrid, isLoading, mapMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || isLoading || mapMode !== "geo") return;

    const sourceId = "zones-source";
    const fillLayerId = "zones-fill-layer";
    const lineLayerId = "zones-line-layer";

    const updateZones = () => {
      if (!map.isStyleLoaded()) return;

      if (!activeGeoLayers?.includes("zones") || !plannedZones) {
        if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
        if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
        return;
      }

      if (map.getSource(sourceId)) {
        (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(plannedZones);
      } else {
        map.addSource(sourceId, { type: "geojson", data: plannedZones });

        map.addLayer({
          id: fillLayerId,
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color": [
              "match", ["get", "priority"],
              "critical", "#D32F2F",
              "high", "#1565C0",
              "moderate", "#78909C",
              "none", "#CFD8DC",
              "#78909C"
            ],
            "fill-opacity": 0.35
          }
        });

        map.addLayer({
          id: lineLayerId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": [
              "match", ["get", "priority"],
              "critical", "#B71C1C",
              "high", "#0D47A1",
              "#546E7A"
            ],
            "line-width": 1
          }
        });

        if (map.getLayer("districts-fill")) {
          map.moveLayer(fillLayerId, "districts-fill");
          map.moveLayer(lineLayerId, "districts-fill");
        }
      }
    };

    if (map.isStyleLoaded()) updateZones();
    else map.once("idle", updateZones);

  }, [plannedZones, activeGeoLayers, mapMode, isLoading]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || isLoading || mapMode !== "geo") return;

    const sourceId = "planned-obj-source";
    const layerId = "planned-obj-layer";

    const updateLayer = () => {
      if (!map.isStyleLoaded()) return;

      if (geoAccessMode !== "planned" || !plannedObjects) {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, 'visibility', 'none');
        }
        return;
      }
      
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, { type: "geojson", data: plannedObjects });
      } else {
        (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(plannedObjects);
      }

      if (!map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: "circle",
          source: sourceId,
          paint: {
            "circle-radius": 9,
            "circle-color": "#FF6F00",
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 2.5,
            "circle-opacity": 1
          }
        });
      }

      map.setLayoutProperty(layerId, 'visibility', 'visible');
      map.moveLayer(layerId);
    };

    if (map.isStyleLoaded()) {
      updateLayer();
    } else {
      map.once('idle', updateLayer);
    }

  }, [plannedObjects, geoAccessMode, mapMode, isLoading]);


  useEffect(() => {
    const map = mapRef.current;
    if (!map || isLoading || mapMode !== "geo") return;

    const sourceId = "refusals-source";
    const layerId = "refusals-layer";

    const updateRefusals = () => {
      if (!activeGeoLayers?.includes("refusals") || !refusalsData) {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
        return;
      }

      const geojson: any = {
        type: "FeatureCollection",
        features: refusalsData.map(r => ({
          type: "Feature",
          properties: { 
            ...r,
            pct_ref: r.total_emergency_visits > 0 
              ? (r.hospitalization_denied / r.total_emergency_visits) * 100 
              : 0
          },
          geometry: { type: "Point", coordinates: [r.longitude, r.latitude] }
        }))
      };

      if (map.getSource(sourceId)) {
        (map.getSource(sourceId) as any).setData(geojson);
      } else {
        map.addSource(sourceId, { type: "geojson", data: geojson });
        map.addLayer({
          id: layerId,
          type: "circle",
          source: sourceId,
          paint: {
            "circle-radius": ["max", 8, ["min", 30, ["sqrt", ["/", ["get", "total_emergency_visits"], 500]]]],
            "circle-color": [
              "step", ["get", "pct_ref"],
              "#2E7D32", 50, "#EF6C00", 70, "#C62828", 85, "#7B0000"
            ],
            "circle-stroke-color": [
              "step", ["get", "pct_ref"],
              "#2E7D32", 50, "#EF6C00", 70, "#C62828", 85, "#7B0000"
            ],
            "circle-stroke-width": 1.5,
            "circle-opacity": 0.72
          }
        });
      }
    };

    if (map.isStyleLoaded()) updateRefusals();
    else map.once("idle", updateRefusals);

  }, [refusalsData, activeGeoLayers, mapMode, isLoading]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || isLoading || !gridCells) return;

    const sourceId = "grid-source";
    const layerId = "grid-layer";

    const updateGrid = () => {
      if (!map.isStyleLoaded()) return;

      const isVisible = mapMode === "geo" && activeGeoLayers?.includes("grid");

      if (!isVisible) {
        if (map.getLayer(layerId)) map.setLayoutProperty(layerId, 'visibility', 'none');
        return;
      }

      const points = facilities.map(f => ({ lat: f.lat, lng: f.lng }));
      if (geoAccessMode === "planned" && plannedObjects) {
        plannedObjects.features.forEach((f: any) => {
          points.push({ lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] });
        });
      }

      const calculatedGrid = computeGridData(gridCells, points);

      if (map.getSource(sourceId)) {
        (map.getSource(sourceId) as any).setData(calculatedGrid);
        map.setLayoutProperty(layerId, 'visibility', 'visible');
      } else {
        map.addSource(sourceId, { type: "geojson", data: calculatedGrid });
        
        const beforeId = map.getLayer("districts-fill") ? "districts-fill" : 
                        map.getLayer("unclustered-facility") ? "unclustered-facility" : undefined;

        map.addLayer({
          id: layerId,
          type: "fill",
          source: sourceId,
          layout: { 'visibility': 'visible' },
          paint: {
            "fill-color": ["get", "dynamicColor"],
            "fill-opacity": 0.3
          }
        }, beforeId);

        if (map.getLayer("planned-obj-layer")) {
          map.moveLayer("planned-obj-layer");
        }
      }
    };

    const timer = setTimeout(updateGrid, 100);
    return () => clearTimeout(timer);

  }, [gridCells, facilities, plannedObjects, geoAccessMode, activeGeoLayers, mapMode, isLoading]);

  return (
    <div
      className={`relative ${
        fullscreen ? "h-full w-full" : "h-[600px] w-full"
      } ${className}`}
    >
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ width: "100%", height: "100%" }}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--blue-normal))] mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Загрузка карты...</p>
          </div>
        </div>
      )}

      {/* Debug info */}
      <div className="absolute top-4 left-4 bg-white p-2 rounded shadow text-xs z-10">
        <div>Districts: {districts.length}</div>
        <div>Map Ready: {mapRef.current?.loaded() ? "Yes" : "No"}</div>
        <div>
          Style Loaded: {mapRef.current?.isStyleLoaded() ? "Yes" : "No"}
        </div>
        <div>
          Has Source: {mapRef.current?.getSource("districts") ? "Yes" : "No"}
        </div>
        <div>
          Has Layer: {mapRef.current?.getLayer("districts-fill") ? "Yes" : "No"}
        </div>
      </div>

      {/* Map controls */}
      {!fullscreen && (
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <button
            onClick={zoomIn}
            className="bg-white hover:bg-gray-100 p-2 rounded shadow-md transition-colors"
            title="Приблизить"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
          <button
            onClick={zoomOut}
            className="bg-white hover:bg-gray-100 p-2 rounded shadow-md transition-colors"
            title="Отдалить"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
          </button>
          <button
            onClick={resetView}
            className="bg-white hover:bg-gray-100 p-2 rounded shadow-md transition-colors"
            title="Сбросить вид"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

function getMapColorExpression(mode: string): any {
  if (mode === "buildings") {
    return [
      "case",
      ["any", 
        ["==", ["get", "bld_priority"], "срочно"],
        ["==", ["get", "bld_condition"], "Аварийное (Снос)"]
      ], "#7B0000",
      
      ["match", ["get", "bld_condition"], 
        "Аварийное", true, 
        "Ветхое", true, 
        false
      ], "#B71C1C",

      ["any",
        ["coalesce", ["get", "bld_seismic"], false],
        ["==", ["get", "bld_priority"], "плановый"]
      ], "#EF6C00",

      ["==", ["get", "bld_condition"], "Исправное/Удовлетворительное"], "#2E7D32",

      "#9E9E9E"
    ];
  }

  return [
    "match",
    ["get", "occ_cat"],
    "over", "#7B0000",
    "vhigh", "#C62828",
    "high", "#EF6C00",
    "norm", "#2E7D32",
    "low", "#FDD835",
    "vlow", "#9E9E9E",
    "#9E9E9E"
  ];
}