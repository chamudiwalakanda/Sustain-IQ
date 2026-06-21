package com.example.sustainiq.model;

import java.time.LocalDateTime;

/**
 * A grievance (complaint) submitted by a student. The category is assigned by
 * the rule-based triage in the grievance service.
 */
public class Grievance {

    private Long id;
    private String message;
    private String category;   // Canteen | Hostel | Maintenance | Safety | General
    private String status;     // PENDING | RESOLVED
    private LocalDateTime submittedAt;

    public Grievance() {
    }

    public Grievance(Long id, String message, String category, String status,
                     LocalDateTime submittedAt) {
        this.id = id;
        this.message = message;
        this.category = category;
        this.status = status;
        this.submittedAt = submittedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
}
