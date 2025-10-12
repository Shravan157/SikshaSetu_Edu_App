package com.ssid.collegeportal.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import jakarta.annotation.PostConstruct;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Service
public class PerplexityAiService {
    @Value("${perplexity.api.key}")
    private String apiKey;

    @Value("${spring.ai.openai.base-url:https://api.perplexity.ai/v1}")
    private String apiUrl;

    @Value("${perplexity.api.model:pplx-70b-chat}")
    private String modelName;

    @Value("${perplexity.api.endpoint:chat/completions}")
    private String endpointPath;

    private final List<Map<String, String>> chatHistory = new ArrayList<>();
    private HttpClient httpClient;
    private ObjectMapper objectMapper;

    @PostConstruct
    public void init() {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    public String askQuestion(String question) {
        try {
            // Create a new messages list for this request
            List<Map<String, String>> messages = new ArrayList<>(chatHistory);
            messages.add(Map.of("role", "user", "content", question));

            ObjectNode payload = objectMapper.createObjectNode();
            payload.put("model", modelName);
            payload.set("messages", objectMapper.valueToTree(messages));

            String requestUrl = apiUrl + (apiUrl.endsWith("/") ? "" : "/") + endpointPath;
            System.out.println("Sending request to: " + requestUrl);
            System.out.println("Request payload: " + payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(requestUrl))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .header("User-Agent", "CollegePortal/1.0 (+https://localhost)")
                    .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            // Debug: Log the full response
            System.out.println("API Response Status: " + response.statusCode());
            System.out.println("API Response Body: " + response.body());

            if (response.statusCode() == 200) {
                String reply = extractAssistantReply(response.body());
                if (reply != null) {
                    String cleanedReply = cleanResponse(reply);
                    // Add both user question and assistant reply to history
                    chatHistory.add(Map.of("role", "user", "content", question));
                    chatHistory.add(Map.of("role", "assistant", "content", cleanedReply));
                    return cleanedReply;
                }
                return "No response from AI.";
            } else {
                // Improved error logging
                String errorMsg = "API Error: " + response.statusCode() + " - " + response.body();
                System.err.println(errorMsg);
                return errorMsg;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }

    public void clearChatHistory() {
        chatHistory.clear();
    }

    private String extractAssistantReply(String responseBody) {
        try {
            // Perplexity API returns JSON with choices[0].message.content
            var jsonNode = objectMapper.readTree(responseBody);
            var choices = jsonNode.get("choices");
            if (choices != null && choices.isArray() && choices.size() > 0) {
                var message = choices.get(0).get("message");
                if (message != null && message.has("content")) {
                    return message.get("content").asText();
                }
            }
        } catch (Exception e) {
            // Ignore parsing errors
        }
        return null;
    }

    /**
     * Clean the AI response by removing citations and improving formatting
     */
    private String cleanResponse(String response) {
        if (response == null || response.trim().isEmpty()) {
            return response;
        }
        
        String cleaned = response
            // Remove citation marks like [1], [2], [1][2], etc.
            .replaceAll("\\[\\d+\\](?:\\[\\d+\\])*", "")
            // Remove multiple consecutive spaces
            .replaceAll("\\s{2,}", " ")
            // Remove leading/trailing whitespace
            .trim()
            // Clean up sentence spacing after citation removal
            .replaceAll("\\s+([.!?])", "$1")
            // Ensure proper spacing after periods
            .replaceAll("([.!?])([A-Z])", "$1 $2")
            // Remove any remaining double periods or spaces before periods
            .replaceAll("\\s+\\.", ".")
            .replaceAll("\\.{2,}", ".");
            
        return cleaned;
    }
}
