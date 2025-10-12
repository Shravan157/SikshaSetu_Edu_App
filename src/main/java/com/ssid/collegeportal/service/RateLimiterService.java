package com.ssid.collegeportal.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {
    private static final int MAX_ATTEMPTS = 5;
    private static final int LOCKOUT_MINUTES = 15;
    private static final int RATE_LIMIT_WINDOW_SECONDS = 60;
    private static final int MAX_REQUESTS_PER_WINDOW = 5;

    private final Map<String, Integer> failedLoginAttempts = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> lockoutExpiry = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> lastRequestTime = new ConcurrentHashMap<>();
    private final Map<String, Integer> requestCount = new ConcurrentHashMap<>();

    // --- Account Lockout Logic ---
    public void recordFailedLogin(String email) {
        failedLoginAttempts.put(email, failedLoginAttempts.getOrDefault(email, 0) + 1);
        if (failedLoginAttempts.get(email) >= MAX_ATTEMPTS) {
            lockoutExpiry.put(email, LocalDateTime.now().plusMinutes(LOCKOUT_MINUTES));
        }
    }

    public void resetFailedLogins(String email) {
        failedLoginAttempts.remove(email);
        lockoutExpiry.remove(email);
    }

    public boolean isLockedOut(String email) {
        LocalDateTime expiry = lockoutExpiry.get(email);
        if (expiry == null) return false;
        if (expiry.isAfter(LocalDateTime.now())) return true;
        lockoutExpiry.remove(email);
        failedLoginAttempts.remove(email);
        return false;
    }

    // --- Rate Limiting Logic ---
    public boolean isRateLimited(String key) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime last = lastRequestTime.get(key);
        int count = requestCount.getOrDefault(key, 0);
        if (last == null || last.plusSeconds(RATE_LIMIT_WINDOW_SECONDS).isBefore(now)) {
            lastRequestTime.put(key, now);
            requestCount.put(key, 1);
            return false;
        } else {
            if (count >= MAX_REQUESTS_PER_WINDOW) {
                return true;
            }
            requestCount.put(key, count + 1);
            return false;
        }
    }
}
