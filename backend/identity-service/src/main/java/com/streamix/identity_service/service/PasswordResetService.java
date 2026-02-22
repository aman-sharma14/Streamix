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

    @Autowired
    private org.springframework.data.redis.core.RedisTemplate<String, Object> redisTemplate;

    private static final int CODE_EXPIRY_MINUTES = 15;
    private static final String RESET_PREFIX = "RESET_CODE_";

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
     * Generates code, saves to Redis, sends email
     */
    public String initiatePasswordReset(String email) {
        if (email == null)
            throw new RuntimeException("Email is required");
        String sanitizedEmail = email.replaceAll("[\\p{Cc}\\p{Cf}\\p{Cs}\\p{Co}\\p{Cn}]", "").trim();

        Optional<UserCredential> userOpt = repository.findByEmail(sanitizedEmail);

        if (userOpt.isEmpty()) {
            throw new RuntimeException("No account found with this email address");
        }

        // Generate verification code
        String code = generateVerificationCode();

        // Save to Redis with expiry
        redisTemplate.opsForValue().set(
                RESET_PREFIX + sanitizedEmail,
                code,
                CODE_EXPIRY_MINUTES,
                java.util.concurrent.TimeUnit.MINUTES);

        // Send email with verification code
        try {
            emailService.sendVerificationCode(sanitizedEmail, code);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send verification email: " + e.getMessage());
        }

        return "Verification code sent to your email";
    }

    /**
     * Verify the reset code
     */
    public boolean verifyResetCode(String email, String code) {
        if (email == null || code == null)
            return false;
        String sanitizedEmail = email.replaceAll("[\\p{Cc}\\p{Cf}\\p{Cs}\\p{Co}\\p{Cn}]", "").trim();
        String sanitizedCode = code.replaceAll("[\\p{Cc}\\p{Cf}\\p{Cs}\\p{Co}\\p{Cn}]", "").trim();

        String redisKey = RESET_PREFIX + sanitizedEmail;
        Object storedCode = redisTemplate.opsForValue().get(redisKey);

        if (storedCode == null) {
            return false;
        }

        return storedCode.toString().equals(sanitizedCode);
    }

    /**
     * Reset password after verifying code
     */
    public String resetPassword(String email, String code, String newPassword) {
        if (email == null || code == null || newPassword == null) {
            throw new RuntimeException("Missing required fields");
        }

        String sanitizedEmail = email.replaceAll("[\\p{Cc}\\p{Cf}\\p{Cs}\\p{Co}\\p{Cn}]", "").trim();
        String sanitizedCode = code.replaceAll("[\\p{Cc}\\p{Cf}\\p{Cs}\\p{Co}\\p{Cn}]", "").trim();

        // Validate password length (minimum 8 characters - matching Register policy)
        if (newPassword.length() < 8) {
            throw new RuntimeException("Password must be at least 8 characters long");
        }

        // Verify the code first
        if (!verifyResetCode(sanitizedEmail, sanitizedCode)) {
            throw new RuntimeException("Invalid or expired verification code");
        }

        Optional<UserCredential> userOpt = repository.findByEmail(sanitizedEmail);

        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        UserCredential user = userOpt.get();

        // Update password (hashed)
        user.setPassword(passwordEncoder.encode(newPassword));

        // Save to database
        repository.save(user);

        // Delete from Redis
        redisTemplate.delete(RESET_PREFIX + sanitizedEmail);

        // Send confirmation email
        try {
            emailService.sendPasswordChangeConfirmation(sanitizedEmail);
        } catch (Exception e) {
            // Log error but don't fail the password reset
            System.err.println("Failed to send confirmation email: " + e.getMessage());
        }

        return "Password reset successful";
    }
}
