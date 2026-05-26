package com.luxeestates.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    /** Gmail requires From to match the authenticated account */
    @Value("${app.mail.from:}")
    private String mailFrom;

    public boolean isConfigured() {
        return mailUsername != null && !mailUsername.isBlank()
                && mailPassword != null && !mailPassword.isBlank();
    }

    public void sendSimpleMessage(String to, String subject, String text) {
        if (!isConfigured()) {
            log.error("MAIL_USERNAME or MAIL_PASSWORD is missing — OTP emails cannot be sent");
            throw new IllegalStateException(
                    "Email is not configured on the server. Please set MAIL_USERNAME and MAIL_PASSWORD (Gmail App Password).");
        }

        String from = (mailFrom != null && !mailFrom.isBlank()) ? mailFrom.trim() : mailUsername.trim();

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("Email sent to {} (subject: {})", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage(), e);
            throw new RuntimeException(
                    "Could not send verification email. Please check your email address or try again in a few minutes.");
        }
    }
}
