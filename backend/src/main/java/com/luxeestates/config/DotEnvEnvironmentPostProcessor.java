package com.luxeestates.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.Map;

/**
 * Loads shrishyam/.env before Spring beans start (local IDE / mvn run).
 */
public class DotEnvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String SOURCE_NAME = "dotenv";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Map<String, Object> dotenv = DotEnvLoader.loadAll();
        if (dotenv.isEmpty()) {
            return;
        }
        if (environment.getPropertySources().contains(SOURCE_NAME)) {
            environment.getPropertySources().remove(SOURCE_NAME);
        }
        environment.getPropertySources().addFirst(new MapPropertySource(SOURCE_NAME, dotenv));
    }
}
