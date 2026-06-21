package com.example.sustainiq.model;

import java.util.List;

/**
 * A hostel room, identified by a code such as "A-101" and grouped under a
 * named hostel block (e.g. "Wijayaba Hostel").
 */
public class Room {

    private String id;     // e.g. "A-101"
    private String block;  // e.g. "Wijayaba Hostel (Block A)"
    private List<Bed> beds;

    public Room() {
    }

    public Room(String id, String block, List<Bed> beds) {
        this.id = id;
        this.block = block;
        this.beds = beds;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getBlock() {
        return block;
    }

    public void setBlock(String block) {
        this.block = block;
    }

    public List<Bed> getBeds() {
        return beds;
    }

    public void setBeds(List<Bed> beds) {
        this.beds = beds;
    }
}
