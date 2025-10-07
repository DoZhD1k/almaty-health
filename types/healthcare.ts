// Интерфейсы для данных больниц и аналитики

export interface FacilityStatistic {
  id: number;
  medical_organization: string;
  bed_profile: string;
  is_deleted?: boolean | null;
  facility_type: string;
  ownership_type: string;
  beds_deployed_withdrawn_for_rep: number;
  beds_deployed_withdrawn_for_rep_avg_annual: number;
  total_admitted_patients: number;
  admitted_rural_residents: number;
  patients_aged_0_to_14: number;
  patients_aged_15_to_17: number;
  released_smp: number;
  released_vtmp: number;
  death_smp: number;
  death_vtmp: number;
  total_inpatient_bed_days: number;
  rural_inpatient_bed_days: number;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  search_method: string;
  occupancy_rate_percent: number;
  occupancy_status_color: string;
  emergency_mo: string | null;
  patient_bed_days_conducted: number;
  med_fk?: number;
}

export interface HospitalizationStatistic {
  id: number;
  region: string;
  organization_name: string;
  locality_category: string;
  subordination_level: string;
  department_profile: string;
  bed_count_end_of_period: number | null;
  avg_annual_beds: number;
  total_admitted_patients: number | null;
  admitted_rural_patients: number | null;
  admitted_patients_0_14y: number | null;
  admitted_patients_15_17y: number | null;
  discharged_smc: number | null;
  discharged_htmc: number | null;
  deceased_smc: number | null;
  deceased_htmc: number | null;
  patient_bed_days_conducted: number | null;
  rural_patient_bed_days: number | null;
  avg_daily_patient_census: number;
  avg_length_of_stay: string;
  bed_turnover_rate: string;
  bed_utilization_days: string;
  occupied_beds_avg: number;
  vacant_beds_avg: number;
  vacant_beds_percentage: string;
  throughput_capacity: string;
  avg_bed_downtime: string;
  lethality_rate: string;
  med_fk: number;
}

export interface CityMedicalOrganization {
  id: number;
  short_name: string;
  full_name: string;
  bed_count_2024: number;
  bed_count_2025: number;
  avg_annual_beds_2024: number;
  avg_annual_beds_2025: number;
  bed_reduction: number;
  admitted_patients_2024: number;
  admitted_patients_2025: number;
  admission_dynamics_pct: number;
  discharged_patients_2024: number;
  discharged_patients_2025: number;
  deceased_patients_2024: number;
  deceased_patients_2025: number;
  departed_total_2024: number;
  departed_total_2025: number;
  bed_days_2024: number;
  bed_days_2025: number;
  bed_utilization_days_2024: number;
  bed_utilization_days_2025: number;
  avg_length_of_stay_2024: number;
  avg_length_of_stay_2025: number;
  lethality_rate_2024: number;
  lethality_rate_2025: number;
  lethality_dynamics_pct: number | null;
  bed_turnover_rate_2024: number;
  bed_turnover_rate_2025: number;
  bed_downtime_2024: number;
  bed_downtime_2025: number;
  emergency_mo_flag: string;
  load2024: number;
  load2025: number;
  med_fk: number;
}

// Дополнительные интерфейсы для работы с данными
export interface TimeSeriesData {
  date: string;
  admissions: number;
  rejections: number;
  occupancyRate: number;
}

export interface RejectionAnalysis {
  reason: string;
  count: number;
  percentage: number;
}

export interface ForecastData {
  date: string;
  predictedAdmissions: number;
  confidence: number;
}

export interface Recommendation {
  id: string;
  type: "capacity" | "routing" | "scheduling" | "resource";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  actionRequired: string;
  facilityIds?: string[];
  estimatedBenefit: string;
}

export interface DashboardFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  facilityIds: string[];
  departmentTypes: string[];
  timeGranularity: "hour" | "day" | "week" | "month";
}

export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  status: "error";
  message: string;
  timestamp: string;
}
