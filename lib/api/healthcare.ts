import {
  FacilityStatistic,
  HospitalizationStatistic,
  CityMedicalOrganization,
  ApiResponse,
  DashboardFilters,
} from "@/types/healthcare";

// Get base URL from environment variable with fallback
const baseUrl =
  process.env.NEXT_PUBLIC_API_URL || "https://admin.smartalmaty.kz";

// Log warning if environment variable is not set
if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn(
    "⚠️ NEXT_PUBLIC_API_URL is not defined. Using fallback URL:",
    baseUrl
  );
}

class HealthcareApiClient {
  // Проверка доступности API
  async checkApiHealth(): Promise<boolean> {
    try {
      const healthUrl = `${baseUrl}/api/v1/health/`;
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.ok;
    } catch (error) {
      console.error("API health check failed:", error);
      return false;
    }
  }

  private async request<T>(endpoint: string): Promise<ApiResponse<T>> {
    // Remove leading slash from endpoint if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${cleanEndpoint}`;

    console.log("Making API request to:", url);

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      console.log("API Response status:", response.status);
      console.log("API Response headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP ${response.status} error:`, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log("API Response data sample:", data.results ? `${data.results.length} items` : 'No results array');
      return data as ApiResponse<T>;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async getFacilityStatistics(): Promise<ApiResponse<FacilityStatistic>> {
    try {
      // Сначала проверяем здоровье API
      const isHealthy = await this.checkApiHealth();
      if (!isHealthy) {
        console.warn("API health check failed, but trying to proceed anyway");
      }

      return await this.request<FacilityStatistic>(
        "/api/v1/healthcare/facility-statistic/?limit=1000"
      );
    } catch (error) {
      console.error("Failed to load from API:", error);
      
      // Попробуем упрощенный эндпоинт
      try {
        console.log("Trying simplified endpoint...");
        return await this.request<FacilityStatistic>(
          "/api/v1/healthcare/facility-statistic/"
        );
      } catch (fallbackError) {
        console.error("Fallback endpoint also failed:", fallbackError);
        throw new Error(`API недоступен: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
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

    return this.request<HospitalizationStatistic>(endpoint);
  }

  async getCityMedicalOrganizations(): Promise<
    ApiResponse<CityMedicalOrganization>
  > {
    return this.request<CityMedicalOrganization>(
      "/api/v1/healthcare/city-medical-organization/?limit=1000"
    );
  }
}

export const healthcareApi = new HealthcareApiClient();
