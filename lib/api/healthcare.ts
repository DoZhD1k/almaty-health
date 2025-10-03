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
  private async request<T>(endpoint: string): Promise<ApiResponse<T>> {
    // Remove leading slash from endpoint if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${cleanEndpoint}`;

    console.log("Making API request to:", url);

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as ApiResponse<T>;
  }

  async getFacilityStatistics(): Promise<ApiResponse<FacilityStatistic>> {
    return this.request<FacilityStatistic>(
      "/api/v1/healthcare/facility-statistic/?limit=1000"
    );
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
