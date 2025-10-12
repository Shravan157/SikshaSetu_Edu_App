package com.ssid.collegeportal.controller;

import com.ssid.collegeportal.service.PerplexityAiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    private final PerplexityAiService perplexityAiService;

    @Autowired
    public ChatbotController(PerplexityAiService perplexityAiService) {
        this.perplexityAiService = perplexityAiService;
    }


    @PostMapping("/ask")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ChatResponse> askQuestion(@RequestBody ChatRequest request) {
        String answer = perplexityAiService.askQuestion(request.getMessage());
        ChatResponse response = new ChatResponse();
        response.setResponse(answer);
        return ResponseEntity.ok(response);
    }


    @PostMapping("/clear")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> clearChat() {
        perplexityAiService.clearChatHistory();
        return ResponseEntity.ok("Chat history cleared.");
    }

    public static class ChatRequest {
        private String message;

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
    
    public static class ChatResponse {
        private String response;

        public String getResponse() {
            return response;
        }

        public void setResponse(String response) {
            this.response = response;
        }
    }
}
