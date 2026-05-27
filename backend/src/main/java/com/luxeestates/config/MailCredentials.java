package com.luxeestates.config;

import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class MailCredentials {

    private final String username;
    private final String password;
    private final String from;

    public MailCredentials(Environment env) {
        this.username = firstNonBlank(
                env.getProperty("MAIL_USERNAME"),
                env.getProperty("SPRING_MAIL_USERNAME"),
                env.getProperty("spring.mail.username"),
                "kanharaj1389@gmail.com"
        );
        this.password = firstNonBlank(
                env.getProperty("MAIL_PASSWORD"),
                env.getProperty("SPRING_MAIL_PASSWORD"),
                env.getProperty("spring.mail.password")
        );
        this.from = firstNonBlank(
                env.getProperty("MAIL_FROM"),
                env.getProperty("spring.mail.from"),
                this.username
        );
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public String getFrom() {
        return from;
    }

    public boolean isConfigured() {
        return username != null && !username.isBlank()
                && password != null && !password.isBlank();
    }

    private static String firstNonBlank(String... values) {
        if (values == null) return null;
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                return v.trim();
            }
        }
        return null;
    }
}
