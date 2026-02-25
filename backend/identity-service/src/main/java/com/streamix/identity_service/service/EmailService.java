package com.streamix.identity_service.service;

import com.google.auth.oauth2.UserCredentials;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import com.google.auth.http.HttpCredentialsAdapter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.mail.Session;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.Properties;

@Service
public class EmailService {

    private static final String APPLICATION_NAME = "Streamix Identity Service";
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    @Value("${spring.gmail.client-id}")
    private String clientId;

    @Value("${spring.gmail.client-secret}")
    private String clientSecret;

    @Value("${spring.gmail.refresh-token}")
    private String refreshToken;

    @Value("${spring.gmail.from-email}")
    private String fromEmail;

    /**
     * Helper to get an authenticated Gmail service instance
     */
    private Gmail getGmailService() throws Exception {
        NetHttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();

        UserCredentials credentials = UserCredentials.newBuilder()
                .setClientId(clientId)
                .setClientSecret(clientSecret)
                .setRefreshToken(refreshToken)
                .build();

        HttpRequestInitializer requestInitializer = new HttpCredentialsAdapter(credentials);

        return new Gmail.Builder(httpTransport, JSON_FACTORY, requestInitializer)
                .setApplicationName(APPLICATION_NAME)
                .build();
    }

    /**
     * Helper to encode and send the email
     */
    private void sendGmail(String toEmail, String subject, String bodyText) {
        try {
            Gmail service = getGmailService();

            Properties props = new Properties();
            Session session = Session.getDefaultInstance(props, null);

            MimeMessage email = new MimeMessage(session);
            email.setFrom(new InternetAddress(fromEmail));
            email.addRecipient(javax.mail.Message.RecipientType.TO, new InternetAddress(toEmail));
            email.setSubject(subject);
            email.setText(bodyText);

            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            email.writeTo(buffer);
            byte[] rawMessageBytes = buffer.toByteArray();
            String encodedEmail = Base64.getUrlEncoder().encodeToString(rawMessageBytes);

            Message message = new Message();
            message.setRaw(encodedEmail);

            service.users().messages().send("me", message).execute();

        } catch (Exception e) {
            System.err.println("Failed to send email via Gmail API: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @org.springframework.scheduling.annotation.Async
    public void sendVerificationCode(String toEmail, String code) {
        String subject = "Streamix - Password Reset Verification Code";
        String content = "Hello,\n\n" +
                "You have requested to reset your password for your Streamix account.\n\n" +
                "Your verification code is: " + code + "\n\n" +
                "This code will expire in 15 minutes.\n\n" +
                "If you did not request this password reset, please ignore this email.\n\n" +
                "Best regards,\n" +
                "The Streamix Team";
        sendGmail(toEmail, subject, content);
    }

    @org.springframework.scheduling.annotation.Async
    public void sendPasswordChangeConfirmation(String toEmail) {
        String subject = "Streamix - Password Changed Successfully";
        String content = "Hello,\n\n" +
                "Your password has been successfully changed.\n\n" +
                "If you did not make this change, please contact our support team immediately.\n\n" +
                "Best regards,\n" +
                "The Streamix Team";
        sendGmail(toEmail, subject, content);
    }

    @org.springframework.scheduling.annotation.Async
    public void sendRegistrationVerificationCode(String toEmail, String code) {
        String subject = "Streamix - Verify Your Email";
        String content = "Welcome to Streamix!\n\n" +
                "Please verify your email address to complete your registration.\n\n" +
                "Your verification code is: " + code + "\n\n" +
                "This code will expire in 15 minutes.\n\n" +
                "Best regards,\n" +
                "The Streamix Team";
        sendGmail(toEmail, subject, content);
    }
}
