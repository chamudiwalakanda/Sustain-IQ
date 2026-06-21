package com.example.sustainiq.service;

import com.example.sustainiq.model.Bed;
import com.example.sustainiq.model.Room;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Manages hostel rooms and bed availability for the University of Ruhuna
 * student accommodation.
 */
@Service
public class HostelService {

    /** Hostel gate closes for check-in at 7:00 PM. */
    private static final LocalTime CURFEW = LocalTime.of(19, 0);

    private final List<Room> rooms = new ArrayList<>();

    @PostConstruct
    private void seedRooms() {
        String blockA = "Wijayaba Hostel (Block A)";
        String blockB = "Gemunu Hostel (Block B)";

        // Deterministic occupancy pattern so demos are reproducible across restarts.
        boolean[][] blockAPattern = {
                {true, false, true, false},
                {false, false, true, true},
                {true, true, false, false},
                {false, true, true, false},
                {true, false, false, true},
                {false, false, false, true},
        };
        boolean[][] blockBPattern = {
                {true, true, true, false},
                {false, false, false, false},
                {true, false, true, true},
                {false, true, false, true},
                {true, true, false, false},
                {false, false, true, false},
        };

        for (int i = 0; i < blockAPattern.length; i++) {
            rooms.add(buildRoom("A-" + (101 + i), blockA, blockAPattern[i]));
        }
        for (int i = 0; i < blockBPattern.length; i++) {
            rooms.add(buildRoom("B-" + (201 + i), blockB, blockBPattern[i]));
        }
    }

    private Room buildRoom(String id, String block, boolean[] occupied) {
        List<Bed> beds = new ArrayList<>();
        for (int b = 0; b < occupied.length; b++) {
            beds.add(new Bed(b + 1, occupied[b]));
        }
        return new Room(id, block, beds);
    }

    public List<Room> getRooms() {
        return rooms;
    }

    /**
     * Toggles a bed between occupied and vacant (warden action).
     *
     * @throws IllegalArgumentException if the room or bed cannot be found
     */
    public Bed toggleBed(String roomId, int bedId) {
        Room room = rooms.stream()
                .filter(r -> r.getId().equalsIgnoreCase(roomId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Room " + roomId + " not found"));

        Bed bed = room.getBeds().stream()
                .filter(b -> b.getId() == bedId)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Bed " + bedId + " not found in room " + roomId));

        bed.setOccupied(!bed.isOccupied());
        return bed;
    }

    public int getTotalBeds() {
        return rooms.stream().mapToInt(r -> r.getBeds().size()).sum();
    }

    public int getVacantBeds() {
        return rooms.stream()
                .flatMap(r -> r.getBeds().stream())
                .mapToInt(b -> b.isOccupied() ? 0 : 1)
                .sum();
    }

    /**
     * Records a hostel check-in, enforcing the curfew rule server-side.
     *
     * @return a student-friendly confirmation message
     * @throws IllegalStateException if the attempt is after curfew
     */
    public String checkIn(LocalTime now) {
        if (now.isAfter(CURFEW)) {
            throw new IllegalStateException(
                    "Check-in closed for today. The hostel gate shuts at 7:00 PM. "
                            + "Please inform your warden if you are running late.");
        }
        return "Checked in at " + format(now) + ". Have a good evening!";
    }

    /**
     * Records a hostel check-out (allowed at any time).
     */
    public String checkOut(LocalTime now) {
        return "Checked out at " + format(now) + ". Stay safe on campus.";
    }

    public String getCurfewLabel() {
        return "7:00 PM";
    }

    private String format(LocalTime t) {
        int hour12 = t.getHour() % 12 == 0 ? 12 : t.getHour() % 12;
        String ampm = t.getHour() < 12 ? "AM" : "PM";
        return String.format("%d:%02d %s", hour12, t.getMinute(), ampm);
    }

    /** Convenience for callers that don't pass a clock. */
    public List<String> blockNames() {
        return Arrays.asList("Wijayaba Hostel (Block A)", "Gemunu Hostel (Block B)");
    }
}
