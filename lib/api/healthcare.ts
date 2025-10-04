import {
  FacilityStatistic,
  HospitalizationStatistic,
  CityMedicalOrganization,
  ApiResponse,
  DashboardFilters,
} from "@/types/healthcare";

// Прямой доступ к внешнему API без прокси Next.js
const API_BASE_URL = "https://admin.smartalmaty.kz";

class HealthcareApiClient {
  private async directFetch<T>(endpoint: string): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    console.log("🚀 Direct fetch to:", url);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
        cache: "no-store",
      });

      console.log("📊 Response status:", response.status);
      console.log(
        "📋 Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP ${response.status} error:`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(
        "✅ Response data:",
        data.results ? `${data.results.length} items` : "No results array"
      );
      return data as ApiResponse<T>;
    } catch (error) {
      console.error("💥 Direct fetch failed:", error);
      throw error;
    }
  }

  async getFacilityStatistics(): Promise<ApiResponse<FacilityStatistic>> {
    try {
      return await this.directFetch<FacilityStatistic>(
        "/api/v1/healthcare/facility-statistic/?limit=1000"
      );
    } catch (error) {
      console.error("💥 Failed to load facilities:", error);

      // Попробуем упрощенный эндпоинт
      try {
        console.log("🔄 Trying simplified endpoint...");
        return await this.directFetch<FacilityStatistic>(
          "/api/v1/healthcare/facility-statistic/"
        );
      } catch (fallbackError) {
        console.error("💥 Fallback endpoint also failed:", fallbackError);
        throw new Error(
          `API недоступен: ${
            error instanceof Error ? error.message : "Неизвестная ошибка"
          }`
        );
      }
    }
  }

  async getHospitalizationStatistics(
    filters?: Partial<DashboardFilters>
  ): Promise<ApiResponse<HospitalizationStatistic>> {
    let endpoint =
      "/api/v1/healthcare/healthcare-inpatient-statistic/?limit=1000";

    if (filters) {
      const params = new URLSearchParams();
      if (filters.dateRange) {
        params.append("start_date", filters.dateRange.start.toISOString());
        params.append("end_date", filters.dateRange.end.toISOString());
      }
      if (filters.facilityIds && filters.facilityIds.length > 0) {
        params.append("facility_ids", filters.facilityIds.join(","));
      }
      if (filters.timeGranularity) {
        params.append("granularity", filters.timeGranularity);
      }

      const queryString = params.toString();
      if (queryString) {
        // Check if endpoint already has query parameters
        const separator = endpoint.includes("?") ? "&" : "?";
        endpoint += `${separator}${queryString}`;
      }
    }

    return this.directFetch<HospitalizationStatistic>(endpoint);
  }

  async getCityMedicalOrganizations(): Promise<
    ApiResponse<CityMedicalOrganization>
  > {
    return this.directFetch<CityMedicalOrganization>(
      "/api/v1/healthcare/city-medical-organization/?limit=1000"
    );
  }
}

export const healthcareApi = new HealthcareApiClient();
