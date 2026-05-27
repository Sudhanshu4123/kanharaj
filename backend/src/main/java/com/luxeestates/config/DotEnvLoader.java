package com.luxeestates.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Loads KEY=VALUE pairs from .env files (project root or backend folder).
 * Needed when running via IDE / mvn spring-boot:run — Docker already injects env_file.
 */
public final class DotEnvLoader {

    private DotEnvLoader() {}

    public static Map<String, Object> loadAll() {
        Map<String, Object> merged = new LinkedHashMap<>();
        String userDir = System.getProperty("user.dir", ".");

        List<Path> candidates = List.of(
                Paths.get(userDir, ".env"),
                Paths.get(userDir, "..", ".env"),
                Paths.get(userDir, "..", "..", ".env"),
                Paths.get(".env"),
                Paths.get("..", ".env")
        );

        for (Path path : candidates) {
            Path normalized = path.normalize().toAbsolutePath();
            if (!Files.isRegularFile(normalized)) {
                continue;
            }
            try {
                Map<String, Object> fromFile = parse(normalized);
                fromFile.forEach((k, v) -> {
                    if (!merged.containsKey(k)) {
                        merged.put(k, v);
                    }
                });
            } catch (IOException ignored) {
                // try next path
            }
        }
        return merged;
    }

    static Map<String, Object> parse(Path file) throws IOException {
        Map<String, Object> map = new LinkedHashMap<>();
        for (String line : Files.readAllLines(file)) {
            String trimmed = line.trim();
            if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                continue;
            }
            int eq = trimmed.indexOf('=');
            if (eq <= 0) {
                continue;
            }
            String key = trimmed.substring(0, eq).trim();
            String value = trimmed.substring(eq + 1).trim();
            if (value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2) {
                value = value.substring(1, value.length() - 1);
            }
            map.put(key, value);
        }
        return map;
    }
}
