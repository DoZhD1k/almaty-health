/**
 * Unified popup styles for all map components
 * Ensures consistent look and feel across AnalyticsMap, SmpVtmpMapbox, and redirection-map
 */

export interface FacilityPopupData {
  name: string;
  district?: string;
  facilityType?: string;
  bedProfile?: string;
  occupancyRate: number; // 0-1 decimal
  totalBeds?: number;
  emergencyVisits?: number;
  isRecommended?: boolean;
  recommendationType?: "smp" | "vtmp";
}

/**
 * Get occupancy status text and color based on occupancy rate
 */
export function getOccupancyStatus(rate: number): {
  text: string;
  color: string;
  bgColor: string;
} {
  if (rate >= 0.9) {
    return { text: "Критическая", color: "#dc2626", bgColor: "#fef2f2" };
  } else if (rate >= 0.8) {
    return { text: "Высокая", color: "#ea580c", bgColor: "#fff7ed" };
  } else if (rate >= 0.7) {
    return { text: "Умеренная", color: "#ca8a04", bgColor: "#fefce8" };
  } else {
    return { text: "Нормальная", color: "#16a34a", bgColor: "#f0fdf4" };
  }
}

/**
 * Get marker color based on occupancy rate
 */
export function getMarkerColor(rate: number): string {
  if (rate >= 0.9) return "#dc2626"; // red-600
  if (rate >= 0.8) return "#ea580c"; // orange-600
  if (rate >= 0.7) return "#ca8a04"; // yellow-600
  return "#16a34a"; // green-600
}

/**
 * Generate unified popup HTML for facility markers
 */
export function createFacilityPopupHTML(data: FacilityPopupData): string {
  const occupancyPercent = Math.round(data.occupancyRate * 100);
  const status = getOccupancyStatus(data.occupancyRate);

  // Calculate beds if available
  const totalBeds = data.totalBeds || 0;
  const occupiedBeds = Math.round(totalBeds * data.occupancyRate);
  const availableBeds = totalBeds - occupiedBeds;

  // Recommended badge
  const recommendedBadge = data.isRecommended
    ? `<div style="display: inline-flex; align-items: center; background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; margin-left: 6px;">
        ✓ Рекомендуемая ${
          data.recommendationType === "smp"
            ? "СМП"
            : data.recommendationType === "vtmp"
            ? "ВТМП"
            : ""
        }
      </div>`
    : "";

  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; padding: 12px; min-width: 260px; max-width: 320px;">
      <!-- Header -->
      <div style="margin-bottom: 10px;">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;">
          <div style="font-weight: 600; font-size: 14px; color: #1f2937; line-height: 1.3; flex: 1;">
            ${data.name}
          </div>
          ${recommendedBadge}
        </div>
      </div>
      
      <!-- Status Badge -->
      <div style="margin-bottom: 10px;">
        <div style="display: inline-flex; align-items: center; background: ${
          status.bgColor
        }; border: 1px solid ${
    status.color
  }20; padding: 4px 10px; border-radius: 16px; gap: 6px;">
          <span style="font-size: 13px; font-weight: 700; color: ${
            status.color
          };">${occupancyPercent}%</span>
          <span style="font-size: 11px; color: ${
            status.color
          }; font-weight: 500;">${status.text}</span>
        </div>
      </div>

      <!-- Info Grid -->
      <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px;">
        ${
          data.district
            ? `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 13px;">📍</span>
          <span style="font-size: 12px; color: #4b5563;">${data.district}</span>
        </div>
        `
            : ""
        }
        
        ${
          data.facilityType
            ? `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 13px;">🏥</span>
          <span style="font-size: 12px; color: #4b5563;">${data.facilityType}</span>
        </div>
        `
            : ""
        }
        
        ${
          data.bedProfile
            ? `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 13px;">🛏️</span>
          <span style="font-size: 12px; color: #4b5563;">${data.bedProfile}</span>
        </div>
        `
            : ""
        }
      </div>

      ${
        totalBeds > 0
          ? `
      <!-- Beds Stats -->
      <div style="background: #f8fafc; border-radius: 8px; padding: 10px; margin-bottom: 10px;">
        <div style="font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
          Коечный фонд
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
          <div style="text-align: center;">
            <div style="font-size: 16px; font-weight: 700; color: #1f2937;">${totalBeds}</div>
            <div style="font-size: 10px; color: #6b7280;">Всего</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 16px; font-weight: 700; color: #dc2626;">${occupiedBeds}</div>
            <div style="font-size: 10px; color: #6b7280;">Занято</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 16px; font-weight: 700; color: #16a34a;">${availableBeds}</div>
            <div style="font-size: 10px; color: #6b7280;">Свободно</div>
          </div>
        </div>
      </div>
      `
          : ""
      }

      ${
        data.emergencyVisits
          ? `
      <!-- Emergency Visits -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: #eff6ff; border-radius: 6px;">
        <span style="font-size: 11px; color: #3b82f6; font-weight: 500;">🚑 Экстренных обращений</span>
        <span style="font-size: 13px; font-weight: 700; color: #1d4ed8;">${data.emergencyVisits.toLocaleString(
          "ru-RU"
        )}</span>
      </div>
      `
          : ""
      }
    </div>
  `;
}

/**
 * Generate popup HTML with action buttons (for redirection-map)
 */
export function createFacilityPopupWithActionsHTML(
  data: FacilityPopupData & {
    id: string;
    isSelected?: boolean;
    onAnalyzeOverloaded?: string;
    onAnalyzeUnderloaded?: string;
    onAnalyze?: string;
  }
): string {
  const baseContent = createFacilityPopupHTML(data);

  // Remove closing div and add buttons
  const contentWithoutClosingDiv = baseContent.slice(
    0,
    baseContent.lastIndexOf("</div>")
  );

  let actionButton = "";

  if (data.isSelected) {
    actionButton = `
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 8px; font-size: 11px; color: #dc2626; font-weight: 600; text-align: center; margin-top: 10px;">
        🎯 Выбрана для анализа
      </div>
    `;
  } else if (data.occupancyRate > 0.8 && data.onAnalyzeOverloaded) {
    actionButton = `
      <button onclick="${data.onAnalyzeOverloaded}" style="background: #dc2626; color: white; border: none; border-radius: 6px; padding: 10px 12px; font-size: 11px; font-weight: 600; width: 100%; cursor: pointer; transition: all 0.2s; margin-top: 10px;">
        🚨 Найти альтернативы для перенаправления
      </button>
    `;
  } else if (data.occupancyRate < 0.7 && data.onAnalyzeUnderloaded) {
    actionButton = `
      <button onclick="${data.onAnalyzeUnderloaded}" style="background: #16a34a; color: white; border: none; border-radius: 6px; padding: 10px 12px; font-size: 11px; font-weight: 600; width: 100%; cursor: pointer; transition: all 0.2s; margin-top: 10px;">
        ✅ Найти источники перенаправления
      </button>
    `;
  } else if (data.onAnalyze) {
    actionButton = `
      <button onclick="${data.onAnalyze}" style="background: #6b7280; color: white; border: none; border-radius: 6px; padding: 10px 12px; font-size: 11px; font-weight: 600; width: 100%; cursor: pointer; transition: all 0.2s; margin-top: 10px;">
        📊 Анализировать больницу
      </button>
    `;
  }

  return `${contentWithoutClosingDiv}${actionButton}</div>`;
}

/**
 * CSS styles to inject for Mapbox/MapLibre popups
 */
export const popupStyles = `
  .mapboxgl-popup-content,
  .maplibregl-popup-content {
    padding: 0 !important;
    border-radius: 12px !important;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
    overflow: hidden;
  }
  
  .mapboxgl-popup-close-button,
  .maplibregl-popup-close-button {
    font-size: 18px !important;
    padding: 4px 8px !important;
    color: #6b7280 !important;
    right: 4px !important;
    top: 4px !important;
  }
  
  .mapboxgl-popup-close-button:hover,
  .maplibregl-popup-close-button:hover {
    color: #1f2937 !important;
    background: #f3f4f6 !important;
    border-radius: 4px !important;
  }
  
  .mapboxgl-popup-tip,
  .maplibregl-popup-tip {
    border-top-color: white !important;
  }
`;
