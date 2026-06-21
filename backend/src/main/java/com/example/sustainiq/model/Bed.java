package com.example.sustainiq.model;

/**
 * A single bed slot inside a hostel room.
 */
public class Bed {

    private int id;
    private boolean occupied;

    public Bed() {
    }

    public Bed(int id, boolean occupied) {
        this.id = id;
        this.occupied = occupied;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public boolean isOccupied() {
        return occupied;
    }

    public void setOccupied(boolean occupied) {
        this.occupied = occupied;
    }
}
