// Утилита для работы с геопространственными данными в Vercel-совместимом формате
import { promises as fs } from "fs";
import path from "path";

export interface GeoJSONFeature {
  type: "Feature";
  properties: Record<string, any>;
  geometry: any;
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

// Кэш для загруженных данных
const layerCache = new Map<string, GeoJSONFeatureCollection>();

// Функция для чтения слоя (из файла или генерации fallback данных)
export async function getLayerData(
  layerName: string
): Promise<GeoJSONFeatureCollection> {
  // Проверяем кэш
  if (layerCache.has(layerName)) {
    console.log(`📋 Using cached data for ${layerName}`);
    return layerCache.get(layerName)!;
  }

  try {
    // Пытаемся прочитать GeoJSON файл
    const geoJsonPath = path.join(
      process.cwd(),
      "public",
      "geo-files",
      `${layerName}.geojson`
    );
    const fileContent = await fs.readFile(geoJsonPath, "utf-8");
    const geoJsonData = JSON.parse(fileContent);

    console.log(
      `📄 Loaded ${layerName} from file (${
        geoJsonData.features?.length || 0
      } features)`
    );

    // Сохраняем в кэш
    layerCache.set(layerName, geoJsonData);
    return geoJsonData;
  } catch (fileError) {
    console.warn(
      `⚠️  File not found for ${layerName}, generating fallback data`
    );

    // Генерируем fallback данные
    const fallbackData = generateFallbackData(layerName);

    // Сохраняем в кэш
    layerCache.set(layerName, fallbackData);
    return fallbackData;
  }
}

// Генерация fallback данных для разных слоев
function generateFallbackData(layerName: string): GeoJSONFeatureCollection {
  const almatyCenter = [76.9, 43.25];

  switch (layerName) {
    case "roads_accessible_10min":
      return {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              accessibility: "10min",
              description: "Зона 10-минутной доступности (тестовые данные)",
            },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [almatyCenter[0] - 0.03, almatyCenter[1] - 0.02],
                  [almatyCenter[0] + 0.03, almatyCenter[1] - 0.02],
                  [almatyCenter[0] + 0.03, almatyCenter[1] + 0.02],
                  [almatyCenter[0] - 0.03, almatyCenter[1] + 0.02],
                  [almatyCenter[0] - 0.03, almatyCenter[1] - 0.02],
                ],
              ],
            },
          },
        ],
      };

    case "roads_accessible_15min":
      return {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              accessibility: "15min",
              description: "Зона 15-минутной доступности (тестовые данные)",
            },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [almatyCenter[0] - 0.06, almatyCenter[1] - 0.04],
                  [almatyCenter[0] + 0.06, almatyCenter[1] - 0.04],
                  [almatyCenter[0] + 0.06, almatyCenter[1] + 0.04],
                  [almatyCenter[0] - 0.06, almatyCenter[1] + 0.04],
                  [almatyCenter[0] - 0.06, almatyCenter[1] - 0.04],
                ],
              ],
            },
          },
        ],
      };

    case "roads_accessible_30min":
      return {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              accessibility: "30min",
              description: "Зона 30-минутной доступности (тестовые данные)",
            },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [almatyCenter[0] - 0.1, almatyCenter[1] - 0.07],
                  [almatyCenter[0] + 0.1, almatyCenter[1] - 0.07],
                  [almatyCenter[0] + 0.1, almatyCenter[1] + 0.07],
                  [almatyCenter[0] - 0.1, almatyCenter[1] + 0.07],
                  [almatyCenter[0] - 0.1, almatyCenter[1] - 0.07],
                ],
              ],
            },
          },
        ],
      };

    case "roads_accessible_60min":
      return {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              accessibility: "60min",
              description: "Зона 60-минутной доступности (тестовые данные)",
            },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [almatyCenter[0] - 0.15, almatyCenter[1] - 0.1],
                  [almatyCenter[0] + 0.15, almatyCenter[1] - 0.1],
                  [almatyCenter[0] + 0.15, almatyCenter[1] + 0.1],
                  [almatyCenter[0] - 0.15, almatyCenter[1] + 0.1],
                  [almatyCenter[0] - 0.15, almatyCenter[1] - 0.1],
                ],
              ],
            },
          },
        ],
      };

    case "road_network":
      return {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              road_type: "highway",
              name: "Аль-Фараби (тестовая)",
              description: "Главная магистраль (тестовые данные)",
            },
            geometry: {
              type: "LineString",
              coordinates: [
                [almatyCenter[0] - 0.05, almatyCenter[1] - 0.05],
                [almatyCenter[0] + 0.05, almatyCenter[1] + 0.05],
              ],
            },
          },
          {
            type: "Feature",
            properties: {
              road_type: "primary",
              name: "Достык (тестовая)",
              description: "Основная дорога (тестовые данные)",
            },
            geometry: {
              type: "LineString",
              coordinates: [
                [almatyCenter[0] - 0.03, almatyCenter[1] + 0.03],
                [almatyCenter[0] + 0.03, almatyCenter[1] - 0.03],
              ],
            },
          },
        ],
      };

    case "grid_accessibility":
      return {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              population_density: "high",
              description: "Сетка доступности (тестовые данные)",
            },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [almatyCenter[0] - 0.02, almatyCenter[1] - 0.02],
                  [almatyCenter[0] + 0.02, almatyCenter[1] - 0.02],
                  [almatyCenter[0] + 0.02, almatyCenter[1] + 0.02],
                  [almatyCenter[0] - 0.02, almatyCenter[1] + 0.02],
                  [almatyCenter[0] - 0.02, almatyCenter[1] - 0.02],
                ],
              ],
            },
          },
        ],
      };

    default:
      return {
        type: "FeatureCollection",
        features: [],
      };
  }
}

// Функция для получения данных медучреждений из внешнего API
export async function getHospitalsData(): Promise<GeoJSONFeatureCollection> {
  const cacheKey = "hospitals";

  // Проверяем кэш
  if (layerCache.has(cacheKey)) {
    console.log(`📋 Using cached hospitals data`);
    return layerCache.get(cacheKey)!;
  }

  try {
    console.log("🏥 Loading hospitals from external API...");

    const response = await fetch(
      "https://admin.smartalmaty.kz/api/v1/healthcare/extra-mo-refusal/?limit=200",
      {
        headers: {
          "User-Agent": "AlmatyHealth/1.0",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    const facilities = data.results || data;

    if (!Array.isArray(facilities)) {
      throw new Error("API did not return an array of facilities");
    }

    const geoJsonFeatures: GeoJSONFeature[] = facilities.map(
      (facility: any) => ({
        type: "Feature",
        properties: {
          medical_organization: facility.medical_organization,
          total_emergency_visits: facility.total_emergency_visits || 0,
          hospitalized_emerg: facility.hospitalized_emerg || 0,
          hospitalization_denied: facility.hospitalization_denied || 0,
          rural_patients: facility.rural_patients || 0,
          rural_hospitalized: facility.rural_hospitalized || 0,
          rural_refused: facility.rural_refused || 0,
          fac_stat_id: facility.fac_stat_id,
          occupancy_rate_percent: facility.occupancy_rate_percent || 0,
          bed_profile: facility.bed_profile || "Неизвестно",
          facility_type: facility.facility_type || "Неизвестно",
          beds_avg_annual: facility.beds_avg_annual || 0,
          address: facility.address || "Адрес не указан",
          district: facility.district || "Район не указан",
        },
        geometry: {
          type: "Point",
          coordinates: [facility.longitude || 76.9, facility.latitude || 43.25],
        },
      })
    );

    const result: GeoJSONFeatureCollection = {
      type: "FeatureCollection",
      features: geoJsonFeatures,
    };

    console.log(`✅ Loaded ${geoJsonFeatures.length} hospitals from API`);

    // Сохраняем в кэш
    layerCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("❌ Failed to load hospitals from API:", error);

    // Возвращаем fallback данные
    const fallback: GeoJSONFeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            medical_organization: "Тестовая больница",
            facility_type: "Многопрофильная",
            bed_profile: "Государственная",
            occupancy_rate_percent: 0.75,
            address: "Алматы, центр",
            district: "Центральный",
          },
          geometry: {
            type: "Point",
            coordinates: [76.9, 43.25],
          },
        },
      ],
    };

    layerCache.set(cacheKey, fallback);
    return fallback;
  }
}

// Очистка кэша
export function clearCache() {
  layerCache.clear();
  console.log("🗑️  Cache cleared");
}
