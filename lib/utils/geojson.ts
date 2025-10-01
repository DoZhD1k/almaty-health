/**
 * Утилиты для работы с GeoJSON данными
 */

export interface GeoJSONLayer {
  id: string;
  name: string;
  url: string;
  visible: boolean;
  color?: string;
  style?: LayerStyle;
}

export interface LayerStyle {
  color?: string;
  fillColor?: string;
  weight?: number;
  opacity?: number;
  fillOpacity?: number;
  dashArray?: string;
}

// Определение слоев с их стилями
export const GEOJSON_LAYERS: GeoJSONLayer[] = [
  {
    id: "districts",
    name: "Административные районы",
    url: "/geo-files/districts.geojson",
    visible: false, // Отключен по умолчанию
    style: {
      color: "#64748b", // Более мягкий серый
      fillColor: "#e2e8f0", // Светло-серая заливка
      weight: 1.5,
      opacity: 0.6,
      fillOpacity: 0.05, // Очень прозрачная заливка
    },
  },
  {
    id: "green_10min",
    name: "Зеленые зоны (10 мин)",
    url: "/geo-files/10min_green.geojson",
    visible: false,
    style: {
      color: "#22c55e", // Более приглушенный зеленый
      fillColor: "#dcfce7", // Светло-зеленая заливка
      weight: 1,
      opacity: 0.5,
      fillOpacity: 0.15, // Уменьшенная прозрачность
    },
  },
  {
    id: "accessibility_15min",
    name: "Доступность 15 мин",
    url: "/geo-files/15min.geojson",
    visible: false,
    style: {
      color: "#f59e0b", // Более мягкий оранжевый
      fillColor: "#fef3c7", // Светло-оранжевая заливка
      weight: 1,
      opacity: 0.5,
      fillOpacity: 0.1, // Очень прозрачная заливка
    },
  },
  {
    id: "accessibility_30min",
    name: "Доступность 30 мин",
    url: "/geo-files/30min.geojson",
    visible: false,
    style: {
      color: "#ef4444", // Более мягкий красный
      fillColor: "#fecaca", // Светло-красная заливка
      weight: 1,
      opacity: 0.5,
      fillOpacity: 0.1, // Очень прозрачная заливка
    },
  },
  {
    id: "medical_facilities",
    name: "Медицинские учреждения",
    url: "/geo-files/Extra_MO_coord.geojson",
    visible: false, // Отключаем по умолчанию, чтобы не конфликтовал с API данными
    style: {
      color: "#dc2626",
      fillColor: "#dc2626",
      weight: 2,
      opacity: 0.8, // Уменьшаем непрозрачность
      fillOpacity: 0.6, // Уменьшаем заливку
    },
  },
  {
    id: "population_grid",
    name: "Сетка населения",
    url: "/geo-files/pop_grids.geojson",
    visible: false,
    style: {
      color: "#6366f1",
      fillColor: "#e0e7ff", // Более светлая заливка
      weight: 0.5, // Очень тонкие линии
      opacity: 0.3, // Очень прозрачные линии
      fillOpacity: 0.05, // Очень прозрачная заливка
    },
  },
];

/**
 * Загружает GeoJSON данные с сервера
 */
export async function loadGeoJSON(url: string): Promise<any> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading GeoJSON from ${url}:`, error);
    throw error;
  }
}

/**
 * Получает стиль для медицинского учреждения на основе загруженности
 */
export function getMedicalFacilityStyle(overload: string, color?: string) {
  let facilityColor = "#6b7280"; // default gray

  if (color) {
    switch (color.toLowerCase()) {
      case "red":
        facilityColor = "#dc2626";
        break;
      case "orange":
        facilityColor = "#ea580c";
        break;
      case "yellow":
        facilityColor = "#eab308";
        break;
      case "green":
        facilityColor = "#16a34a";
        break;
      case "bordo":
        facilityColor = "#7f1d1d";
        break;
      default:
        facilityColor = "#6b7280";
    }
  } else {
    // Fallback: определяем цвет по проценту загруженности
    const percentage = parseInt(overload?.replace("%", "") || "0");
    if (percentage >= 100) {
      facilityColor = "#7f1d1d"; // bordo
    } else if (percentage >= 90) {
      facilityColor = "#dc2626"; // red
    } else if (percentage >= 70) {
      facilityColor = "#ea580c"; // orange
    } else if (percentage >= 50) {
      facilityColor = "#eab308"; // yellow
    } else {
      facilityColor = "#16a34a"; // green
    }
  }

  return {
    color: facilityColor,
    fillColor: facilityColor,
    weight: 2,
    opacity: 0.9,
    fillOpacity: 0.7,
    radius: 8,
  };
}

/**
 * Получает стиль для района на основе общей загруженности
 */
export function getDistrictStyle(districtName: string, facilitiesData?: any[]) {
  // Базовый стиль
  let style = {
    color: "#3388ff",
    fillColor: "#3388ff",
    weight: 2,
    opacity: 0.8,
    fillOpacity: 0.1,
  };

  if (facilitiesData) {
    // Вычисляем среднюю загруженность по району
    const districtFacilities = facilitiesData.filter((facility) =>
      facility.properties?.district_2gis?.includes(
        districtName.replace("ский район", "").replace("ауданы", "")
      )
    );

    if (districtFacilities.length > 0) {
      const avgOverload =
        districtFacilities.reduce((sum, facility) => {
          const overload = parseInt(
            facility.properties?.Overload?.replace("%", "") || "0"
          );
          return sum + overload;
        }, 0) / districtFacilities.length;

      if (avgOverload >= 90) {
        style.fillColor = "#fee2e2";
        style.fillOpacity = 0.4;
      } else if (avgOverload >= 70) {
        style.fillColor = "#fed7aa";
        style.fillOpacity = 0.3;
      } else {
        style.fillColor = "#dcfce7";
        style.fillOpacity = 0.2;
      }
    }
  }

  return style;
}

/**
 * Создает всплывающее окно для медицинского учреждения
 */
export function createMedicalFacilityPopup(properties: any): string {
  const {
    medical_organization,
    type,
    type2,
    Number_of_beds_actually_deployed_closed,
    Patients_admitted_total,
    Overload,
    found_address_2gis,
    district_2gis,
  } = properties;

  return `
    <div class="p-3 min-w-64">
      <h3 class="font-semibold text-sm mb-2 text-gray-900">${
        medical_organization || "Неизвестное учреждение"
      }</h3>
      <div class="space-y-1 text-xs text-gray-600">
        <div><span class="font-medium">Тип:</span> ${type || "Не указан"}</div>
        <div><span class="font-medium">Форма собственности:</span> ${
          type2 || "Не указана"
        }</div>
        <div><span class="font-medium">Койки:</span> ${
          Number_of_beds_actually_deployed_closed || "Не указано"
        }</div>
        <div><span class="font-medium">Госпитализаций:</span> ${
          Patients_admitted_total || "Не указано"
        }</div>
        <div><span class="font-medium">Загруженность:</span> 
          <span class="${getOverloadColorClass(Overload)}">${
    Overload || "Не указано"
  }</span>
        </div>
        <div><span class="font-medium">Адрес:</span> ${
          found_address_2gis || "Не указан"
        }</div>
        <div><span class="font-medium">Район:</span> ${
          district_2gis || "Не указан"
        }</div>
      </div>
    </div>
  `;
}

/**
 * Создает всплывающее окно для района
 */
export function createDistrictPopup(
  properties: any,
  facilitiesData?: any[]
): string {
  const { name_ru, name_kz } = properties;

  let facilitiesInfo = "";
  if (facilitiesData) {
    const districtFacilities = facilitiesData.filter((facility) =>
      facility.properties?.district_2gis?.includes(
        name_ru?.replace("ский район", "").replace("ауданы", "")
      )
    );

    const totalFacilities = districtFacilities.length;
    const avgOverload =
      totalFacilities > 0
        ? Math.round(
            districtFacilities.reduce((sum, facility) => {
              const overload = parseInt(
                facility.properties?.Overload?.replace("%", "") || "0"
              );
              return sum + overload;
            }, 0) / totalFacilities
          )
        : 0;

    facilitiesInfo = `
      <div class="mt-2 pt-2 border-t border-gray-200">
        <div class="text-xs text-gray-600">
          <div><span class="font-medium">Медучреждений:</span> ${totalFacilities}</div>
          <div><span class="font-medium">Средняя загруженность:</span> 
            <span class="${getOverloadColorClass(
              `${avgOverload}%`
            )}">${avgOverload}%</span>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="p-3 min-w-48">
      <h3 class="font-semibold text-sm mb-1 text-gray-900">${
        name_ru || "Неизвестный район"
      }</h3>
      <div class="text-xs text-gray-500 mb-1">${name_kz || ""}</div>
      ${facilitiesInfo}
    </div>
  `;
}

/**
 * Получает CSS класс для цвета загруженности
 */
function getOverloadColorClass(overload?: string): string {
  if (!overload) return "text-gray-500";

  const percentage = parseInt(overload.replace("%", "") || "0");

  if (percentage >= 100) return "text-red-800 font-semibold";
  if (percentage >= 90) return "text-red-600 font-medium";
  if (percentage >= 70) return "text-orange-600";
  if (percentage >= 50) return "text-yellow-600";
  return "text-green-600";
}

/**
 * Типы для TypeScript
 */
export interface MedicalFacilityProperties {
  medical_organization: string;
  type: string;
  type2: string;
  Number_of_beds_actually_deployed_closed: string;
  Patients_admitted_total: string;
  Overload: string;
  color: string;
  found_address_2gis: string;
  district_2gis: string;
  latitude: number;
  longitude: number;
}

export interface DistrictProperties {
  id: number;
  name_kz: string;
  name_ru: string;
  response_name_kz: string;
  response_name_ru: string;
  gerb_img: string;
  city_id: number;
  akim_id: string;
  is_deleted: string;
}
