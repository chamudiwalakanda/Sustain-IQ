package com.example.sustainiq.controller;

import com.example.sustainiq.dto.ApiResponse;
import com.example.sustainiq.dto.LoginRequest;
import com.example.sustainiq.dto.RegisterRequest;
import com.example.sustainiq.model.User;
import com.example.sustainiq.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.register(request);
        // User#password is @JsonIgnore-d, so the response never includes the password.
        return ResponseEntity.ok(ApiResponse.ok("Registration successful. Welcome to SustainIQ!", user));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<User>> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.login(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(ApiResponse.ok("Welcome back, " + user.getFullName() + "!", user));
    }
}
