package com.example.sustainiq.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * A registered campus user (student, warden, or canteen staff).
 * The password is annotated with {@link JsonIgnore} so it is never sent back
 * to the frontend in any API response.
 */
public class User {

    private Long id;
    private String fullName;
    private String email;

    @JsonIgnore
    private String password;

    private String role;        // student | warden | canteen
    private String universityId; // registration number or staff ID
    private String faculty;

    public User() {
    }

    public User(Long id, String fullName, String email, String password,
                String role, String universityId, String faculty) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.role = role;
        this.universityId = universityId;
        this.faculty = faculty;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getUniversityId() {
        return universityId;
    }

    public void setUniversityId(String universityId) {
        this.universityId = universityId;
    }

    public String getFaculty() {
        return faculty;
    }

    public void setFaculty(String faculty) {
        this.faculty = faculty;
    }
}
