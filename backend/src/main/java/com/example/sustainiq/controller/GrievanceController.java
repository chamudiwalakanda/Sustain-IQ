package com.example.sustainiq.controller;

import com.example.sustainiq.dto.ApiResponse;
import com.example.sustainiq.dto.GrievanceRequest;
import com.example.sustainiq.model.Grievance;
import com.example.sustainiq.service.GrievanceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/grievances")
public class GrievanceController {

    private final GrievanceService grievanceService;

    public GrievanceController(GrievanceService grievanceService) {
        this.grievanceService = grievanceService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> submit(@Valid @RequestBody GrievanceRequest request) {
        Grievance grievance = grievanceService.submit(request.getMessage());
        String reply = grievanceService.responseFor(grievance.getCategory());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("grievance", grievance);
        data.put("category", grievance.getCategory());
        data.put("reply", reply);

        return ResponseEntity.ok(ApiResponse.ok("Grievance received", data));
    }

    @GetMapping
    public ResponseEntity<List<Grievance>> list() {
        return ResponseEntity.ok(grievanceService.getAll());
    }
}
