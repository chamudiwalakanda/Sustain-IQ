package com.example.sustainiq.controller;

import com.example.sustainiq.dto.ApiResponse;
import com.example.sustainiq.model.MealItem;
import com.example.sustainiq.service.CanteenService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/canteen")
public class CanteenController {

    private final CanteenService canteenService;

    public CanteenController(CanteenService canteenService) {
        this.canteenService = canteenService;
    }

    @GetMapping
    public ResponseEntity<List<MealItem>> getMenu() {
        return ResponseEntity.ok(canteenService.getMenu());
    }

    @PostMapping("/preorder/{mealId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> preorder(@PathVariable Long mealId) {
        MealItem meal = canteenService.reserve(mealId);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("meal", meal);
        data.put("portionsLeft", meal.getPortionsLeft());
        data.put("impact", "1 meal saved from potential waste");

        return ResponseEntity.ok(
                ApiResponse.ok("Reserved " + meal.getName() + ". Pick it up at the counter with your ID.", data));
    }
}
