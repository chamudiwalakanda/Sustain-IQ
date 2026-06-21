package com.example.sustainiq.service;

import com.example.sustainiq.model.MealItem;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Manages the University of Ruhuna canteen menu and meal reservations.
 *
 * <p>Every successful reservation decrements the available portions and counts
 * as one meal saved from potential end-of-day waste, which feeds the
 * sustainability analytics.</p>
 */
@Service
public class CanteenService {

    /** Estimated kilograms of food waste avoided per reserved (and therefore not over-cooked) portion. */
    private static final double KG_SAVED_PER_MEAL = 0.35;

    private final List<MealItem> menu = new ArrayList<>();
    private int mealsReservedToday = 0;

    @PostConstruct
    private void seedMenu() {
        // Realistic, subsidised University of Ruhuna canteen prices (LKR).
        menu.add(new MealItem(1L, "Rice & Curry (Vegetable)", "Lunch", 130.0, 24, true));
        menu.add(new MealItem(2L, "Rice & Curry (Fish)", "Lunch", 190.0, 16, false));
        menu.add(new MealItem(3L, "Vegetable Kottu", "Dinner", 280.0, 9, true));
        menu.add(new MealItem(4L, "Egg Kottu", "Dinner", 350.0, 0, false));
        menu.add(new MealItem(5L, "Kiribath with Lunu Miris", "Breakfast", 100.0, 18, true));
        menu.add(new MealItem(6L, "String Hoppers with Dhal", "Breakfast", 140.0, 12, true));
        menu.add(new MealItem(7L, "Fish Bun", "Short Eats", 80.0, 30, false));
        menu.add(new MealItem(8L, "Plain Tea", "Beverage", 40.0, 50, true));
    }

    public List<MealItem> getMenu() {
        return menu;
    }

    /**
     * Reserves one portion of a meal.
     *
     * @throws IllegalArgumentException if no meal exists with the given id
     * @throws IllegalStateException    if the meal is sold out
     */
    public MealItem reserve(Long mealId) {
        MealItem meal = menu.stream()
                .filter(m -> m.getId().equals(mealId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Meal not found"));

        if (meal.getPortionsLeft() <= 0) {
            throw new IllegalStateException(meal.getName() + " is sold out for today");
        }

        meal.setPortionsLeft(meal.getPortionsLeft() - 1);
        mealsReservedToday++;
        return meal;
    }

    public int getMealsReservedToday() {
        return mealsReservedToday;
    }

    public double getFoodWasteSavedKg() {
        return Math.round(mealsReservedToday * KG_SAVED_PER_MEAL * 10.0) / 10.0;
    }
}
