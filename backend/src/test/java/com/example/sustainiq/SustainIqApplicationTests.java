package com.example.sustainiq;

import com.example.sustainiq.service.CanteenService;
import com.example.sustainiq.service.GrievanceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class SustainIqApplicationTests {

    @Autowired
    private CanteenService canteenService;

    @Autowired
    private GrievanceService grievanceService;

    @Test
    void contextLoads() {
        // Verifies the Spring context starts with all beans wired correctly.
    }

    @Test
    void reservingAMealDecrementsPortionsAndCountsWasteSaved() {
        int before = canteenService.getMenu().get(0).getPortionsLeft();
        canteenService.reserve(1L);
        int after = canteenService.getMenu().get(0).getPortionsLeft();

        assertEquals(before - 1, after);
        assertTrue(canteenService.getMealsReservedToday() >= 1);
        assertTrue(canteenService.getFoodWasteSavedKg() > 0);
    }

    @Test
    void grievanceTriageCategorisesKeywords() {
        assertEquals("Maintenance", grievanceService.categorize("the water tap is broken in my room"));
        assertEquals("Canteen", grievanceService.categorize("the rice and curry was stale today"));
        assertEquals("Safety", grievanceService.categorize("I feel unsafe walking back at night"));
        assertEquals("Hostel", grievanceService.categorize("my hostel roommate situation is bad"));
        assertEquals("General", grievanceService.categorize("just a quick suggestion"));
    }
}
