package com.streamix.identity_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.streamix.identity_service.entity.UserCredential;
import com.streamix.identity_service.repository.UserCredentialRepository;

@Service
public class AuthService {

    @Autowired
    private UserCredentialRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    // Register new user
    public String saveUser(UserCredential credential) {
        // Check if email already exists
        if (repository.findByEmail(credential.getEmail()).isPresent()) {
            return "User with this email already exists!";
        }
        
        // Encrypt the password before saving
        credential.setPassword(passwordEncoder.encode(credential.getPassword()));
        repository.save(credential);
        return "User registered successfully!";
    }

    // Generate JWT token after validating credentials
    public String generateToken(String email) {
        return jwtService.generateToken(email);
    }

    // Validate if user exists
    public boolean validateUser(String email) {
        return repository.findByEmail(email).isPresent();
    }
    // Validate JWT token
    public void validateToken(String token) {
        jwtService.validateToken(token);
    }

    public UserCredential getUserByEmail(String email) {
        return repository.findByEmail(email).orElse(null);
    }
}