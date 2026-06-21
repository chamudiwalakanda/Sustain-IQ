package com.example.sustainiq.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Builds the dashboard analytics by pulling live numbers from the canteen,
 * hostel and grievance services. Because the data is read on demand, the
 * dashboard reflects real actions taken during the session (reserving a meal,
 * toggling a bed, submitting a grievance).
 */
@Service
public class AnalyticsService {

    private final CanteenService canteenService;
    private final HostelService hostelService;
    private final GrievanceService grievanceService;

    public AnalyticsService(CanteenService canteenService,
                            HostelService hostelService,
                            GrievanceService grievanceService) {
        this.canteenService = canteenService;
        this.hostelService = hostelService;
        this.grievanceService = grievanceService;
    }

    public Map<String, Object> buildAnalytics() {
        Map<String, Object> result = new LinkedHashMap<>();

        // Headline metric cards.
        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("mealsReservedToday", canteenService.getMealsReservedToday());
        metrics.put("foodWasteSavedKg", canteenService.getFoodWasteSavedKg());
        metrics.put("vacantBeds", hostelService.getVacantBeds());
        metrics.put("totalBeds", hostelService.getTotalBeds());
        metrics.put("pendingGrievances", grievanceService.getPendingCount());
        result.put("metrics", metrics);

        // Grievance categories — shaped for a Recharts bar chart.
        List<Map<String, Object>> grievanceChart = new ArrayList<>();
        grievanceService.categoryBreakdown().forEach((name, count) -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("name", name);
            row.put("count", count);
            grievanceChart.add(row);
        });
        result.put("grievanceByCategory", grievanceChart);

        // Hostel occupancy — shaped for a Recharts chart.
        int total = hostelService.getTotalBeds();
        int vacant = hostelService.getVacantBeds();
        List<Map<String, Object>> hostelChart = new ArrayList<>();
        hostelChart.add(rowOf("Occupied", total - vacant));
        hostelChart.add(rowOf("Vacant", vacant));
        result.put("hostelOccupancy", hostelChart);

        return result;
    }

    private Map<String, Object> rowOf(String name, int count) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("name", name);
        row.put("count", count);
        return row;
    }
}
