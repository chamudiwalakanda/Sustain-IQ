package com.example.sustainiq.model;

/**
 * A canteen meal offered for pre-order.
 * Price is stored as a numeric value in Sri Lankan Rupees (LKR) so the backend
 * can do real arithmetic; the frontend formats it for display.
 */
public class MealItem {

    private Long id;
    private String name;
    private String category;      // Breakfast | Lunch | Dinner | Short Eats | Beverage
    private double priceLkr;
    private int portionsLeft;
    private boolean vegetarian;

    public MealItem() {
    }

    public MealItem(Long id, String name, String category, double priceLkr,
                    int portionsLeft, boolean vegetarian) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.priceLkr = priceLkr;
        this.portionsLeft = portionsLeft;
        this.vegetarian = vegetarian;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public double getPriceLkr() {
        return priceLkr;
    }

    public void setPriceLkr(double priceLkr) {
        this.priceLkr = priceLkr;
    }

    public int getPortionsLeft() {
        return portionsLeft;
    }

    public void setPortionsLeft(int portionsLeft) {
        this.portionsLeft = portionsLeft;
    }

    public boolean isVegetarian() {
        return vegetarian;
    }

    public void setVegetarian(boolean vegetarian) {
        this.vegetarian = vegetarian;
    }
}
