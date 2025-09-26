import {
  FacilityStatistic,
  HospitalizationStatistic,
  CityMedicalOrganization,
  ApiResponse,
  DashboardFilters,
} from "@/types/healthcare";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

class HealthcareApiClient {
  private async request<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
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
    } catch (error) {
      console.error("API request failed:", error);
      // Возвращаем пустой результат в случае ошибки
      return {
        count: 0,
        next: null,
        previous: null,
        results: [] as T[],
      };
    }
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

      if (params.toString()) {
        endpoint += `?${params.toString()}`;
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

  // Метод для получения мок данных для разработки (на случай если API недоступен)
  async getMockFacilityStatistics(): Promise<ApiResponse<FacilityStatistic>> {
    const mockData: FacilityStatistic[] = [
      {
        id: 1,
        medical_organization: 'ТОО "Алгамед"',
        bed_profile: "по частным МО",
        is_deleted: null,
        facility_type: "Многопрофильные/частные клиники",
        ownership_type: "Частные",
        beds_deployed_withdrawn_for_rep: 39,
        beds_deployed_withdrawn_for_rep_avg_annual: 39,
        total_admitted_patients: 153,
        admitted_rural_residents: 11,
        patients_aged_0_to_14: 0,
        patients_aged_15_to_17: 0,
        released_smp: 137,
        released_vtmp: 0,
        death_smp: 0,
        death_vtmp: 0,
        total_inpatient_bed_days: 1502,
        rural_inpatient_bed_days: 127,
        address: "Абая проспект, 157а",
        district: "Бостандыкский район",
        latitude: 43.152914,
        longitude: 76.895668,
        search_method: "Полное название",
        occupancy_rate_percent: 0.16047008547008548,
        occupancy_status_color: "grey",
        emergency_mo: null,
      },
      {
        id: 2,
        medical_organization:
          'РГП на ПХВ "Детский клинический санаторий "Алатау"МЗ РК',
        bed_profile: "Республиканским МО",
        is_deleted: null,
        facility_type: "Детские и педиатрические центры",
        ownership_type: "гос",
        beds_deployed_withdrawn_for_rep: 140,
        beds_deployed_withdrawn_for_rep_avg_annual: 140,
        total_admitted_patients: 1595,
        admitted_rural_residents: 565,
        patients_aged_0_to_14: 1575,
        patients_aged_15_to_17: 20,
        released_smp: 1465,
        released_vtmp: 0,
        death_smp: 0,
        death_vtmp: 0,
        total_inpatient_bed_days: 27161,
        rural_inpatient_bed_days: 4590,
        address: "Керей-Жанибек хандар улица, 470",
        district: "Медеуский район",
        latitude: 43.18142,
        longitude: 77.015316,
        search_method: "Полное название",
        occupancy_rate_percent: 0.8083630952380952,
        occupancy_status_color: "orange",
        emergency_mo: null,
      },
    ];

    return {
      count: mockData.length,
      next: null,
      previous: null,
      results: mockData,
    };
  }

  async getMockHospitalizationStatistics(): Promise<
    ApiResponse<HospitalizationStatistic>
  > {
    const mockData: HospitalizationStatistic[] = [
      {
        id: 15,
        region: "Алматы г.а.",
        organization_name:
          'АО "Национальный научный центр хирургии имени А.Н.Сызганова" ',
        locality_category: "Город ",
        subordination_level: "Республиканский ",
        department_profile: "Онкологические  для взрослых",
        bed_count_end_of_period: null,
        avg_annual_beds: 6,
        total_admitted_patients: null,
        admitted_rural_patients: null,
        admitted_patients_0_14y: null,
        admitted_patients_15_17y: null,
        discharged_smc: null,
        discharged_htmc: null,
        deceased_smc: null,
        deceased_htmc: null,
        patient_bed_days_conducted: null,
        rural_patient_bed_days: null,
        avg_daily_patient_census: 0,
        avg_length_of_stay: "",
        bed_turnover_rate: "0",
        bed_utilization_days: "0",
        occupied_beds_avg: 0,
        vacant_beds_avg: 6,
        vacant_beds_percentage: "100",
        throughput_capacity: "0",
        avg_bed_downtime: "",
        lethality_rate: "",
        med_fk: 81,
      },
      {
        id: 3,
        region: "Алматы г.а.",
        organization_name:
          'АО "Научный центр акушерства, гинекологии и перинатологии" ',
        locality_category: "Город ",
        subordination_level: "Республиканский ",
        department_profile:
          "Гинекологические для взрослых, включая для производства абортов",
        bed_count_end_of_period: null,
        avg_annual_beds: 10,
        total_admitted_patients: 271,
        admitted_rural_patients: 110,
        admitted_patients_0_14y: 7,
        admitted_patients_15_17y: 6,
        discharged_smc: 247,
        discharged_htmc: 22,
        deceased_smc: null,
        deceased_htmc: null,
        patient_bed_days_conducted: 1840,
        rural_patient_bed_days: null,
        avg_daily_patient_census: 270,
        avg_length_of_stay: "6.840148698884758",
        bed_turnover_rate: "27",
        bed_utilization_days: "184",
        occupied_beds_avg: 8.105726872246697,
        vacant_beds_avg: 1.8942731277533031,
        vacant_beds_percentage: "18.94273127753303",
        throughput_capacity: "81.05726872246696",
        avg_bed_downtime: "1.5925925925925926",
        lethality_rate: "0",
        med_fk: 14,
      },
    ];

    return {
      count: mockData.length,
      next: null,
      previous: null,
      results: mockData,
    };
  }
}

export const healthcareApi = new HealthcareApiClient();
