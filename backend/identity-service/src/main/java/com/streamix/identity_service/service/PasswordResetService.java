package com.streamix.identity_service.service;

import com.streamix.identity_service.entity.UserCredential;
import com.streamix.identity_service.repository.UserCredentialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class PasswordResetService {

    @Autowired
    private UserCredentialRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    private static final int CODE_EXPIRY_MINUTES = 15;

    /**
     * Generate a random 6-digit verification code
     */
    public String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // Generates 6-digit number
        return String.valueOf(code);
    }

    /**
     * Initiate password reset process
     * Generates code, saves to DB, sends email
     */
    public String initiatePasswordReset(String email) {
        Optional<UserCredential> userOpt = repository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("No account found with this email address");
        }

        UserCredential user = userOpt.get();
        
        // Generate verification code
        String code = generateVerificationCode();
        
        // Set code and expiry time
        user.setResetCode(code);
        user.setResetCodeExpiry(LocalDateTime.now().plusMinutes(CODE_EXPIRY_MINUTES));
        
        // Save to database
        repository.save(user);
        
        // Send email with verification code
        try {
            emailService.sendVerificationCode(email, code);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send verification email: " + e.getMessage());
        }
        
        return "Verification code sent to your email";
    }

    /**
     * Verify the reset code
     */
    public boolean verifyResetCode(String email, String code) {
        Optional<UserCredential> userOpt = repository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            return false;
        }

        UserCredential user = userOpt.get();
        
        // Check if code matches
        if (user.getResetCode() == null || !user.getResetCode().equals(code)) {
            return false;
        }
        
        // Check if code has expired
        if (user.getResetCodeExpiry() == null || LocalDateTime.now().isAfter(user.getResetCodeExpiry())) {
            return false;
        }
        
        return true;
    }

    /**
     * Reset password after verifying code
     */
    public String resetPassword(String email, String code, String newPassword) {
        // Validate password length (minimum 6 characters)
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters long");
        }

        // Verify the code first
        if (!verifyResetCode(email, code)) {
            throw new RuntimeException("Invalid or expired verification code");
        }

        Optional<UserCredential> userOpt = repository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        UserCredential user = userOpt.get();
        
        // Update password (hashed)
        user.setPassword(passwordEncoder.encode(newPassword));
        
        // Clear reset code and expiry
        user.setResetCode(null);
        user.setResetCodeExpiry(null);
        
        // Save to database
        repository.save(user);
        
        // Send confirmation email
        try {
            emailService.sendPasswordChangeConfirmation(email);
        } catch (Exception e) {
            // Log error but don't fail the password reset
            System.err.println("Failed to send confirmation email: " + e.getMessage());
        }
        
        return "Password reset successful";
    }
}
