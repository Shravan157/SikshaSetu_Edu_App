package com.ssid.collegeportal.dto;

import lombok.Data;

@Data
public class ZegoTokenResponse {
    private String token;
    private Long appId;
}