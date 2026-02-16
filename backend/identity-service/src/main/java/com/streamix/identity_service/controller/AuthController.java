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
    private final com.streamix.identity_service.service.PasswordResetService passwordResetService;

    public AuthController(AuthService service,
                          AuthenticationManager authenticationManager,
                          com.streamix.identity_service.service.PasswordResetService passwordResetService) {
        this.service = service;
        this.authenticationManager = authenticationManager;
        this.passwordResetService = passwordResetService;
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

    // ========================= PASSWORD RESET =========================

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody com.streamix.identity_service.dto.ForgotPasswordRequest request) {
        try {
            String result = passwordResetService.initiatePasswordReset(request.getEmail());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody com.streamix.identity_service.dto.VerifyCodeRequest request) {
        try {
            boolean isValid = passwordResetService.verifyResetCode(request.getEmail(), request.getCode());
            
            if (isValid) {
                return ResponseEntity.ok("Verification code is valid");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Invalid or expired verification code");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Verification failed: " + e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody com.streamix.identity_service.dto.ResetPasswordRequest request) {
        try {
            String result = passwordResetService.resetPassword(
                request.getEmail(), 
                request.getCode(), 
                request.getNewPassword()
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
}
