package com.streamix.identity_service.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.streamix.identity_service.dto.RegisterRequest;
import com.streamix.identity_service.entity.UserCredential;
import com.streamix.identity_service.repository.UserCredentialRepository;

@Service
public class AuthService {

    private final UserCredentialRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final org.springframework.data.redis.core.RedisTemplate<String, Object> redisTemplate;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    public AuthService(UserCredentialRepository repository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailService emailService,
            org.springframework.data.redis.core.RedisTemplate<String, Object> redisTemplate,
            com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    // Register new user (Saves to Redis temporarily)
    public String saveUser(RegisterRequest request) {
        // 1. Check if email already exists in main Postgres DB
        if (repository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User with this email already exists!");
        }

        // 2. Encrypt the password
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // 3. Generate Verification Code
        String code = String.format("%06d", new java.util.Random().nextInt(999999));

        // 4. Create Temporary User Object
        // Using regex to strip control characters and formatting marks (like U+200E)
        String sanitizedName = request.getName().replaceAll("[\\p{Cc}\\p{Cf}\\p{Cs}\\p{Co}\\p{Cn}]", "").trim();
        String sanitizedEmail = request.getEmail().replaceAll("[\\p{Cc}\\p{Cf}\\p{Cs}\\p{Co}\\p{Cn}]", "").trim();

        com.streamix.identity_service.dto.TempUserDto tempUser = new com.streamix.identity_service.dto.TempUserDto(
                sanitizedName,
                sanitizedEmail,
                encodedPassword,
                code);

        // 5. Save to Redis with 15-minute expiration
        try {
            String tempUserJson = objectMapper.writeValueAsString(tempUser);
            redisTemplate.opsForValue().set(
                    "PRE_VERIFY_" + request.getEmail(),
                    tempUserJson,
                    15,
                    java.util.concurrent.TimeUnit.MINUTES);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            throw new RuntimeException("Error processing registration data");
        }

        // 6. Send Email
        emailService.sendRegistrationVerificationCode(request.getEmail(), code);

        return "User registration initiated! Please check your email for verification code.";
    }

    // Verify User from Redis and Save to Postgres
    @org.springframework.transaction.annotation.Transactional
    public String verifyUser(String email, String code) {
        // 1. Get temporary user from Redis
        String redisKey = "PRE_VERIFY_" + email;
        Object tempUserJsonObj = redisTemplate.opsForValue().get(redisKey);

        if (tempUserJsonObj == null) {
            throw new RuntimeException("Verification code expired or invalid email");
        }

        try {
            com.streamix.identity_service.dto.TempUserDto tempUser = objectMapper.readValue(tempUserJsonObj.toString(),
                    com.streamix.identity_service.dto.TempUserDto.class);

            // 2. Validate Code
            if (!tempUser.getOtp().equals(code)) {
                throw new RuntimeException("Invalid verification code");
            }

            // 3. Save to Main Postgres Database
            UserCredential newUser = new UserCredential();
            newUser.setName(tempUser.getName());
            newUser.setEmail(tempUser.getEmail());
            newUser.setPassword(tempUser.getPassword());

            repository.save(newUser);

            // 4. Delete from Redis
            redisTemplate.delete(redisKey);

            return "Account verified and created successfully!";

        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            throw new RuntimeException("Error processing verification data");
        }
    }

    // Generate JWT token after validating credentials
    public String generateToken(String email) {
        // If they exist in Postgres, they are verified
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