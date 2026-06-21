package com.example.sustainiq.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Incoming payload when a student submits a grievance.
 */
public class GrievanceRequest {

    @NotBlank(message = "Please describe your concern")
    @Size(min = 3, message = "Please add a little more detail")
    private String message;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
