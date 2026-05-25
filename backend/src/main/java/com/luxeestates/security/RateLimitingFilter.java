package com.luxeestates.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int MAX_TRACKED_IPS = 10_000;

    private final Map<String, Bucket> authCache = new ConcurrentHashMap<>();
    private final Map<String, Bucket> loginCache = new ConcurrentHashMap<>();
    private final Map<String, Bucket> apiCache = new ConcurrentHashMap<>();

    private Bucket createAuthBucket() {
        Bandwidth limit = Bandwidth.builder().capacity(50).refillGreedy(50, Duration.ofMinutes(1)).build();
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket createLoginBucket() {
        Bandwidth limit = Bandwidth.builder().capacity(5).refillGreedy(5, Duration.ofMinutes(1)).build();
        return Bucket.builder().addLimit(limit).build();
    }

    /** General API: 300 requests/min per IP — prevents traffic spikes from crashing the server */
    private Bucket createApiBucket() {
        Bandwidth limit = Bandwidth.builder().capacity(300).refillGreedy(300, Duration.ofMinutes(1)).build();
        return Bucket.builder().addLimit(limit).build();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String ip = getClientIP(request);

        if (path.equals("/api/auth/login")) {
            Bucket bucket = getBucket(loginCache, ip, this::createLoginBucket);
            if (!bucket.tryConsume(1)) {
                sendErrorResponse(response, "Too many login attempts. Please try again after a minute.");
                return;
            }
        }

        if (path.startsWith("/api/auth/")) {
            Bucket bucket = getBucket(authCache, ip, this::createAuthBucket);
            if (!bucket.tryConsume(1)) {
                sendErrorResponse(response, "Too many requests. Please try again after a minute.");
                return;
            }
            filterChain.doFilter(request, response);
            return;
        }

        if (path.startsWith("/api/")) {
            Bucket bucket = getBucket(apiCache, ip, this::createApiBucket);
            if (!bucket.tryConsume(1)) {
                sendErrorResponse(response, "Too many requests. Please slow down and try again.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private Bucket getBucket(Map<String, Bucket> cache, String ip, java.util.function.Supplier<Bucket> factory) {
        if (cache.size() > MAX_TRACKED_IPS) {
            cache.clear();
        }
        return cache.computeIfAbsent(ip, k -> factory.get());
    }

    private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"message\": \"" + message.replace("\"", "'") + "\"}");
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isBlank()) {
            return xfHeader.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
