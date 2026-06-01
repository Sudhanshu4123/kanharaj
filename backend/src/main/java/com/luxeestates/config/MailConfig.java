package com.luxeestates.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

/**
 * Reads MAIL_* directly from the process environment (Docker env_file / .env).
 * Avoids empty SPRING_MAIL_PASSWORD overriding values from docker-compose.
 */
@Configuration
@Slf4j
public class MailConfig {

    @Bean
    @Primary
    public JavaMailSender javaMailSender(Environment env) {
        String host = firstNonBlank(
                env.getProperty("MAIL_HOST"),
                env.getProperty("SPRING_MAIL_HOST"),
                "smtp.gmail.com"
        );
        String port = firstNonBlank(
                env.getProperty("MAIL_PORT"),
                env.getProperty("SPRING_MAIL_PORT"),
                "587"
        );
        String username = firstNonBlank(
                env.getProperty("MAIL_USERNAME"),
                env.getProperty("SPRING_MAIL_USERNAME"),
                "kanharaj1389@gmail.com"
        );
        String password = firstNonBlank(
                env.getProperty("MAIL_PASSWORD"),
                env.getProperty("SPRING_MAIL_PASSWORD"),
                env.getProperty("spring.mail.password"),
                "nonfivgrhpmvbdnj"
        );

        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(host);
        sender.setPort(Integer.parseInt(port));
        sender.setUsername(username);
        sender.setPassword(password != null ? password : "");

        Properties props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.connectiontimeout", "10000");
        props.put("mail.smtp.timeout", "10000");
        props.put("mail.smtp.writetimeout", "10000");

        boolean ok = password != null && !password.isBlank();
        log.info("Mail SMTP: host={}, user={}, passwordSet={} (cwd={})", host, username, ok,
                System.getProperty("user.dir"));
        if (!ok) {
            log.error(
                    "MAIL_PASSWORD is missing — add it to shrishyam/.env (MAIL_PASSWORD=...) and restart. "
                            + "When using Docker: docker compose up -d --force-recreate backend");
        }

        return sender;
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
