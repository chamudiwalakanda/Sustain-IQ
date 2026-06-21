package com.example.sustainiq.controller;

import com.example.sustainiq.dto.ApiResponse;
import com.example.sustainiq.model.Bed;
import com.example.sustainiq.model.Room;
import com.example.sustainiq.service.HostelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hostel")
public class HostelController {

    private final HostelService hostelService;

    public HostelController(HostelService hostelService) {
        this.hostelService = hostelService;
    }

    @GetMapping("/rooms")
    public ResponseEntity<Map<String, Object>> getRooms() {
        List<Room> rooms = hostelService.getRooms();
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("rooms", rooms);
        body.put("totalBeds", hostelService.getTotalBeds());
        body.put("vacantBeds", hostelService.getVacantBeds());
        body.put("curfew", hostelService.getCurfewLabel());
        return ResponseEntity.ok(body);
    }

    @PutMapping("/rooms/{roomId}/beds/{bedId}/toggle")
    public ResponseEntity<ApiResponse<Bed>> toggleBed(@PathVariable String roomId,
                                                      @PathVariable int bedId) {
        Bed bed = hostelService.toggleBed(roomId, bedId);
        String state = bed.isOccupied() ? "occupied" : "vacant";
        return ResponseEntity.ok(
                ApiResponse.ok("Bed " + bedId + " in room " + roomId + " marked " + state + ".", bed));
    }

    @PostMapping("/checkin")
    public ResponseEntity<ApiResponse<Void>> checkIn() {
        String message = hostelService.checkIn(LocalTime.now());
        return ResponseEntity.ok(ApiResponse.ok(message));
    }

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<Void>> checkOut() {
        String message = hostelService.checkOut(LocalTime.now());
        return ResponseEntity.ok(ApiResponse.ok(message));
    }
}
