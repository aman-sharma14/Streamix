package com.streamix.identity_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Send verification code email to user
     */
    @org.springframework.scheduling.annotation.Async
    public void sendVerificationCode(String toEmail, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Streamix - Password Reset Verification Code");
        message.setText(
                "Hello,\n\n" +
                        "You have requested to reset your password for your Streamix account.\n\n" +
                        "Your verification code is: " + code + "\n\n" +
                        "This code will expire in 15 minutes.\n\n" +
                        "If you did not request this password reset, please ignore this email.\n\n" +
                        "Best regards,\n" +
                        "The Streamix Team");

        mailSender.send(message);
    }

    /**
     * Send password change confirmation email
     */
    @org.springframework.scheduling.annotation.Async
    public void sendPasswordChangeConfirmation(String toEmail) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Streamix - Password Changed Successfully");
        message.setText(
                "Hello,\n\n" +
                        "Your password has been successfully changed.\n\n" +
                        "If you did not make this change, please contact our support team immediately.\n\n" +
                        "Best regards,\n" +
                        "The Streamix Team");

        mailSender.send(message);
    }

    /**
     * Send registration verification code email to user
     */
    @org.springframework.scheduling.annotation.Async
    public void sendRegistrationVerificationCode(String toEmail, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Streamix - Verify Your Email");
        message.setText(
                "Welcome to Streamix!\n\n" +
                        "Please verify your email address to complete your registration.\n\n" +
                        "Your verification code is: " + code + "\n\n" +
                        "This code will expire in 15 minutes.\n\n" +
                        "Best regards,\n" +
                        "The Streamix Team");

        mailSender.send(message);
    }
}
