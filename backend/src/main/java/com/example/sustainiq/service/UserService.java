package com.example.sustainiq.service;

import com.example.sustainiq.dto.RegisterRequest;
import com.example.sustainiq.model.User;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Handles registration and login using simple in-memory storage.
 *
 * <p>Storage is intentionally in-memory (a List) so the project runs with zero
 * database setup during the competition. The service boundary is kept clean so
 * this can later be swapped for a Spring Data JPA repository backed by MySQL
 * without touching the controllers.</p>
 */
@Service
public class UserService {

    private final List<User> users = new ArrayList<>();
    private final AtomicLong idSequence = new AtomicLong(1);

    /**
     * Registers a new user.
     *
     * @throws IllegalArgumentException if passwords don't match or the email already exists
     */
    public User register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        boolean emailTaken = users.stream()
                .anyMatch(u -> u.getEmail().equalsIgnoreCase(request.getEmail()));
        if (emailTaken) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        User user = new User(
                idSequence.getAndIncrement(),
                request.getFullName().trim(),
                request.getEmail().trim().toLowerCase(),
                request.getPassword(),          // stored in-memory only; never serialized back (see User#password)
                request.getRole(),
                request.getUniversityId().trim(),
                request.getFaculty().trim()
        );
        users.add(user);
        return user;
    }

    /**
     * Validates credentials and returns the matching user.
     *
     * @throws IllegalArgumentException if the email/password combination is invalid
     */
    public User login(String email, String password) {
        return users.stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(email) && u.getPassword().equals(password))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
    }

    public int getRegisteredCount() {
        return users.size();
    }
}
