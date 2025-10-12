package com.ssid.collegeportal.service;

import com.ssid.collegeportal.dto.ZegoTokenResponse;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class ZegoCloudService {

    @Value("${zego.app.id}")
    private Long appId;

    @Value("${zego.server.secret}")
    private String serverSecret;

    public ZegoTokenResponse generateToken(String roomId, String userId) {
        String token = generateZegoToken(appId, serverSecret, roomId, userId);

        ZegoTokenResponse response = new ZegoTokenResponse();
        response.setToken(token);
        response.setAppId(appId);
        return response;
    }

    private String generateZegoToken(Long appId, String serverSecret, String roomId, String userId) {
        long expireTime = System.currentTimeMillis() / 1000 + 3600; // 1 hour

        return Jwts.builder()
            .setHeaderParam("alg", "HS256")
            .setHeaderParam("typ", "JWT")
            .claim("app_id", appId)
            .claim("user_id", userId)
            .claim("room_id", roomId)
            .claim("privilege", Map.of("1", 1, "2", 1)) // publish and play privileges
            .claim("expire_time", expireTime)
            .signWith(SignatureAlgorithm.HS256, serverSecret.getBytes())
            .compact();
    }
}