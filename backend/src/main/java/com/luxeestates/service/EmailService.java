package com.luxeestates.service;

import com.luxeestates.config.MailCredentials;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final MailCredentials mailCredentials;

    public boolean isConfigured() {
        return mailCredentials.isConfigured();
    }

    public void sendSimpleMessage(String to, String subject, String text) {
        if (!isConfigured()) {
            log.error("MAIL_PASSWORD or MAIL_USERNAME missing in server environment — OTP cannot be sent");
            throw new IllegalStateException(
                    "Email is not configured on the server. Please set MAIL_USERNAME and MAIL_PASSWORD (Gmail App Password) in .env and restart the backend container.");
        }

        String from = mailCredentials.getFrom();

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
