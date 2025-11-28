/**
 * Утилиты для расчета расстояний между медицинскими организациями
 */

import { FacilityStatistic } from "@/types/healthcare";
import facilityTypesMap from "./facility-types.json";

/**
 * Вычисляет расстояние между двумя точками по координатам (формула гаверсинусов)
 *
 * Формула Гаверсинусов (Haversine formula) — это уравнение для расчета расстояния
 * между двумя точками на поверхности сферы по их координатам (широта и долгота).
 * Учитывает кривизну Земли и дает более точный результат, чем простая теорема Пифагора.
 *
 * Формула:
 * a = sin²(Δφ/2) + cos(φ1) * cos(φ2) * sin²(Δλ/2)
 * c = 2 * atan2(√a, √(1-a))
 * d = R * c
 *
 * где:
 * - φ — широта (latitude)
 * - λ — долгота (longitude)
 * - R — радиус Земли (6371 км)
 *
 * @param lat1 - широта первой точки (градусы)
 * @param lon1 - долгота первой точки (градусы)
 * @param lat2 - широта второй точки (градусы)
 * @param lon2 - долгота второй точки (градусы)
 * @returns расстояние в километрах
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Радиус Земли в км
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Проверяет, может ли больница быть альтернативой для другой больницы
 * на основе их профилей (типов медицинских учреждений)
 * @param sourceFacilityType - тип источника (перегруженной больницы)
 * @param targetFacilityType - тип потенциальной альтернативы
 * @returns true, если может быть альтернативой
 */
export function isCompatibleFacilityType(
  sourceFacilityType: string,
  targetFacilityType: string
): boolean {
  // Если точное совпадение
  if (sourceFacilityType === targetFacilityType) {
    return true;
  }

  // Ищем в справочнике совместимых типов
  const compatibleTypes =
    facilityTypesMap[sourceFacilityType as keyof typeof facilityTypesMap];

  if (compatibleTypes) {
    return compatibleTypes.includes(targetFacilityType);
  }

  // Если нет в справочнике, проверяем обратную совместимость
  const reverseCompatibleTypes =
    facilityTypesMap[targetFacilityType as keyof typeof facilityTypesMap];
  if (reverseCompatibleTypes) {
    return reverseCompatibleTypes.includes(sourceFacilityType);
  }

  // Если ничего не найдено, возвращаем false (не совместимы)
  return false;
}

/**
 * Интерфейс для альтернативного МО с расстоянием
 */
export interface AlternativeFacility {
  facility: FacilityStatistic;
  distance: number;
  availableBeds: number;
  travelTime: number; // примерное время в пути (минуты)
}

/**
 * Находит ближайшие менее загруженные МО для перенаправления пациентов
 * @param sourceFacility - перегруженное МО
 * @param allFacilities - все доступные МО
 * @param maxDistance - максимальное расстояние поиска (км)
 * @param limit - максимальное количество альтернатив
 * @returns массив альтернативных МО с расстояниями
 */
export function findNearbyAlternatives(
  sourceFacility: FacilityStatistic,
  allFacilities: FacilityStatistic[],
  maxDistance: number = 15,
  limit: number = 5
): AlternativeFacility[] {
  // Фильтруем МО: исключаем источник, берём с загрузкой < 70%, совместимого типа
  const alternatives = allFacilities
    .filter((facility) => {
      // Исключаем само МО
      if (facility.id === sourceFacility.id) return false;

      // Только с достаточной загрузкой (меньше 70%)
      if (facility.occupancy_rate_percent >= 0.7) return false;

      // Проверяем совместимость профилей больниц
      if (
        !isCompatibleFacilityType(
          sourceFacility.facility_type,
          facility.facility_type
        )
      ) {
        return false;
      }

      // Должны быть координаты
      if (!facility.latitude || !facility.longitude) return false;

      // Должны быть доступные койки
      if (facility.beds_deployed_withdrawn_for_rep <= 0) return false;

      return true;
    })
    .map((facility) => {
      const distance = calculateDistance(
        sourceFacility.latitude,
        sourceFacility.longitude,
        facility.latitude,
        facility.longitude
      );

      // Расчет доступных коек
      const availableBeds = Math.floor(
        facility.beds_deployed_withdrawn_for_rep *
          (1 - facility.occupancy_rate_percent)
      );

      // Примерное время в пути (предполагаем среднюю скорость 40 км/ч в городе)
      const travelTime = Math.round((distance / 40) * 60);

      return {
        facility,
        distance,
        availableBeds,
        travelTime,
      };
    })
    .filter((alt) => alt.distance <= maxDistance && alt.availableBeds > 0)
    .sort((a, b) => {
      // Сортируем по приоритету: сначала расстояние, потом доступность коек
      const distanceWeight = 0.7;
      const capacityWeight = 0.3;

      const scoreA =
        distanceWeight * a.distance - capacityWeight * (a.availableBeds / 10);
      const scoreB =
        distanceWeight * b.distance - capacityWeight * (b.availableBeds / 10);

      return scoreA - scoreB;
    })
    .slice(0, limit);

  return alternatives;
}

/**
 * Группирует перегруженные МО по районам
 * @param facilities - все МО
 * @returns объект с группировкой по районам
 */
export function groupOverloadedByDistrict(
  facilities: FacilityStatistic[]
): Record<string, FacilityStatistic[]> {
  const overloaded = facilities.filter((f) => f.occupancy_rate_percent > 0.7);

  return overloaded.reduce((acc, facility) => {
    const district = facility.district || "Неизвестный район";
    if (!acc[district]) {
      acc[district] = [];
    }
    acc[district].push(facility);
    return acc;
  }, {} as Record<string, FacilityStatistic[]>);
}

/**
 * Вычисляет рекомендуемое количество пациентов для перенаправления
 * @param sourceFacility - перегруженное МО
 * @returns количество пациентов для перенаправления
 */
export function calculateRedirectionCount(
  sourceFacility: FacilityStatistic
): number {
  const targetOccupancy = 0.85; // Целевая загруженность
  const currentOccupancy = sourceFacility.occupancy_rate_percent;

  if (currentOccupancy <= targetOccupancy) {
    return 0;
  }

  const excessOccupancy = currentOccupancy - targetOccupancy;
  const totalBeds = sourceFacility.beds_deployed_withdrawn_for_rep;

  // Количество коек, которые нужно освободить
  const bedsToFree = Math.ceil(excessOccupancy * totalBeds);

  return bedsToFree;
}
