# API ENDPOINTS

## Healthcare Facility Statistic List

##### Request

```
GET /api/v1/healthcare/facility-statistic
```

##### Response

```
{
    "count": 94,
    "next": "http://admin.smartalmaty.kz/api/v1/healthcare/facility-statistic/?limit=2&offset=2",
    "previous": null,
    "results": [
        {
            "id": 1,
            "medical_organization": "ТОО \"Алгамед\"",
            "bed_profile": "по частным МО",
            "is_deleted": null,
            "facility_type": "Многопрофильные/частные клиники",
            "ownership_type": "Частные",
            "beds_deployed_withdrawn_for_rep": 39.0,
            "beds_deployed_withdrawn_for_rep_avg_annual": 39.0,
            "total_admitted_patients": 153.0,
            "admitted_rural_residents": 11.0,
            "patients_aged_0_to_14": 0.0,
            "patients_aged_15_to_17": 0.0,
            "treatment_outcome_improved": 137.0,
            "treatment_outcome_no_change": 0.0,
            "treatment_outcome_worsened": 0.0,
            "death_without_improvement": 0.0,
            "total_inpatient_bed_days": 1502.0,
            "rural_inpatient_bed_days": 127.0,
            "address": "Абая проспект, 157а",
            "district": "Бостандыкский район",
            "latitude": 43.152914,
            "longitude": 76.895668,
            "search_method": "Полное название",
            "occupancy_rate_percent": 0.16047008547008548,
            "occupancy_status_color": "grey",
            "emergency_mo": null
        },
        {
            "id": 2,
            "medical_organization": "РГП на ПХВ \"Детский клинический санаторий \"Алатау\"МЗ РК",
            "bed_profile": "Республиканским МО",
            "is_deleted": null,
            "facility_type": "Детские и педиатрические центры",
            "ownership_type": "гос",
            "beds_deployed_withdrawn_for_rep": 140.0,
            "beds_deployed_withdrawn_for_rep_avg_annual": 140.0,
            "total_admitted_patients": 1595.0,
            "admitted_rural_residents": 565.0,
            "patients_aged_0_to_14": 1575.0,
            "patients_aged_15_to_17": 20.0,
            "treatment_outcome_improved": 1465.0,
            "treatment_outcome_no_change": 0.0,
            "treatment_outcome_worsened": 0.0,
            "death_without_improvement": 0.0,
            "total_inpatient_bed_days": 27161.0,
            "rural_inpatient_bed_days": 4590.0,
            "address": "Керей-Жанибек хандар улица, 470",
            "district": "Медеуский район",
            "latitude": 43.18142,
            "longitude": 77.015316,
            "search_method": "Полное название",
            "occupancy_rate_percent": 0.8083630952380952,
            "occupancy_status_color": "orange",
            "emergency_mo": null
        }
    ]
}
```

---
