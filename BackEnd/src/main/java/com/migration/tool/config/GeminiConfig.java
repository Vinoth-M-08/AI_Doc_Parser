package com.migration.tool.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "gemini")
@Data
public class GeminiConfig {

    private String apiKey;
    private String model;
    private String endpoint;
    private boolean enabled;
    private int maxInputChars = 30000;
    private int timeoutSeconds = 60;
    private List<String> availableModels = new ArrayList<>();

    @Bean
    public WebClient geminiWebClient() {
        return WebClient.builder()
                .baseUrl(endpoint)
                .codecs(c -> c.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();
    }
}
