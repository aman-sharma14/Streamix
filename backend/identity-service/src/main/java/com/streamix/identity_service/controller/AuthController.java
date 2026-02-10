package com.streamix.identity_service.controller;

import com.streamix.identity_service.dto.AuthRequest;
import com.streamix.identity_service.dto.AuthResponse;
import com.streamix.identity_service.entity.UserCredential;
import com.streamix.identity_service.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService service;
    private final AuthenticationManager authenticationManager;

    public AuthController(AuthService service,
                          AuthenticationManager authenticationManager) {
        this.service = service;
        this.authenticationManager = authenticationManager;
    }

    // ========================= REGISTER =========================

    @PostMapping("/register")
    public ResponseEntity<?> addNewUser(@RequestBody UserCredential credential) {
        try {
            String result = service.saveUser(credential);

            if (result.contains("already exists")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(result);
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Registration failed: " + e.getMessage());
        }
    }

    // ========================= LOGIN =========================

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest) {
        try {
            // Authenticate user (email + password)
            authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(
                            authRequest.getEmail(),
                            authRequest.getPassword()
                    )
            );

            // If authentication succeeds → generate token
            String token = service.generateToken(authRequest.getEmail());
            UserCredential user = service.getUserByEmail(authRequest.getEmail());

            AuthResponse response = AuthResponse.builder()
                    .email(authRequest.getEmail())
                    .token(token)
                    .userId(user.getId())
                    .message("Login successful")
                    .build();

            return ResponseEntity.ok(response);

        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Login failed: " + e.getMessage());
        }
    }

    // ========================= TOKEN VALIDATION =========================

    @GetMapping("/validate")
    public ResponseEntity<String> validateToken(
            @RequestHeader("Authorization") String authHeader) {

        try {
            if (!authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Missing or invalid Authorization header");
            }

            String token = authHeader.substring(7); // remove "Bearer "
            service.validateToken(token);

            return ResponseEntity.ok("Token is valid");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid or expired token");
        }
    }
}
