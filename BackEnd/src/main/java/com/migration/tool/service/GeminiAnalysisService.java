package com.migration.tool.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.migration.tool.config.GeminiConfig;
import com.migration.tool.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiAnalysisService {

    private final GeminiConfig config;
    private final WebClient geminiWebClient;
    private final ObjectMapper mapper = new ObjectMapper();

    public boolean isConfigured() {
        return config.getApiKey() != null && !config.getApiKey().isBlank();
    }

    public boolean isEnabledByDefault() {
        return config.isEnabled();
    }

    public String getDefaultModel() {
        return config.getModel();
    }

    public List<String> getAvailableModels() {
        List<String> list = new ArrayList<>();
        if (config.getAvailableModels() != null) list.addAll(config.getAvailableModels());
        if (config.getModel() != null && !list.contains(config.getModel())) list.add(0, config.getModel());
        return list;
    }

    public record Result(AiAnalysis analysis, String analyzer, String model) {}

    public Result analyze(ParsedDocument doc, DocumentMetrics metrics, DocumentStructure structure, boolean useAi, String modelOverride) {
        String model = (modelOverride != null && !modelOverride.isBlank()) ? modelOverride : config.getModel();
        if (!useAi || !isConfigured()) {
            log.info("Gemini skipped (useAi={}, configured={}) — using heuristic", useAi, isConfigured());
            return new Result(heuristicFallback(metrics, structure), "heuristic", null);
        }

        try {
            log.info("Calling Gemini ({})", model);
            AiAnalysis ai = callGemini(doc, metrics, structure, model);
            return new Result(ai, "gemini", model);
        } catch (Exception e) {
            log.error("Gemini call failed, falling back to heuristic: {}", e.getMessage());
            AiAnalysis fallback = heuristicFallback(metrics, structure);
            String reason = e.getMessage() != null && e.getMessage().contains("429")
                    ? "Heuristic analysis — Gemini quota exceeded (HTTP 429). Falling back to rule-based insights."
                    : "Heuristic analysis — Gemini call failed (" + (e.getMessage() != null ? e.getMessage().split("\\n")[0] : "unknown") + ").";
            fallback.setSummary(reason);
            return new Result(fallback, "heuristic", null);
        }
    }

    private AiAnalysis callGemini(ParsedDocument doc, DocumentMetrics metrics, DocumentStructure structure, String model) throws Exception {
        String prompt = buildPrompt(doc, metrics, structure);
        Map<String, Object> body = buildRequestBody(prompt);

        String path = "/" + model + ":generateContent?key=" + config.getApiKey();

        String responseBody = geminiWebClient.post()
                .uri(path)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(config.getTimeoutSeconds()))
                .block();

        return parseGeminiResponse(responseBody);
    }

    private String buildPrompt(ParsedDocument doc, DocumentMetrics metrics, DocumentStructure structure) {
        String content = doc.getFullText() == null ? "" : doc.getFullText();
        if (content.length() > config.getMaxInputChars()) {
            content = content.substring(0, config.getMaxInputChars()) + "\n[... truncated]";
        }

        return String.format("""
            You are a documentation migration expert evaluating content for migration to a knowledge base platform (like Document360).

            Analyze the following document and produce a JSON response.

            DOCUMENT METRICS:
            - Pages: %d
            - Words: %d
            - Paragraphs: %d
            - Headings: %d
            - Avg words/paragraph: %.1f
            - Images: %d, Tables: %d, Hyperlinks: %d

            STRUCTURAL ANALYSIS:
            - Consistent heading hierarchy: %s
            - Orphan headings: %d
            - Long paragraphs (>150 words): %d

            DOCUMENT CONTENT:
            ---
            %s
            ---

            Evaluate the document on these dimensions and return STRICT JSON (no markdown, no explanation):

            {
              "readabilityLevel": "Easy" | "Medium" | "Complex",
              "contentClarity": 0-10,
              "structuralQuality": 0-10,
              "migrationReadiness": "READY" | "READY_WITH_MINOR_CHANGES" | "NEEDS_RESTRUCTURING" | "NOT_READY",
              "readinessScore": 0-100,
              "summary": "1-2 sentence overall verdict",
              "strengths": ["specific strength 1", ...],
              "issues": ["specific issue 1", ...],
              "suggestions": ["specific actionable suggestion 1", ...]
            }

            Be specific. Reference actual content observations, not generic advice.
            """,
            metrics.getTotalPages(), metrics.getWordCount(), metrics.getParagraphCount(),
            metrics.getHeadingCount(), metrics.getAvgWordsPerParagraph(),
            metrics.getImageCount(), metrics.getTableCount(), metrics.getHyperlinkCount(),
            structure.isHasConsistentHierarchy(),
            structure.getOrphanHeadings() != null ? structure.getOrphanHeadings().size() : 0,
            structure.getLongParagraphs(),
            content
        );
    }

    private Map<String, Object> buildRequestBody(String prompt) {
        return Map.of(
            "contents", List.of(Map.of(
                "parts", List.of(Map.of("text", prompt))
            )),
            "generationConfig", Map.of(
                "temperature", 0.3,
                "maxOutputTokens", 2048,
                "responseMimeType", "application/json"
            )
        );
    }

    private AiAnalysis parseGeminiResponse(String body) throws Exception {
        JsonNode root = mapper.readTree(body);
        JsonNode candidate = root.path("candidates").path(0);
        JsonNode contentNode = candidate.path("content").path("parts").path(0).path("text");

        if (contentNode.isMissingNode()) {
            throw new RuntimeException("Gemini returned no content: " + body);
        }

        String jsonText = contentNode.asText().trim();
        if (jsonText.startsWith("```")) {
            jsonText = jsonText.replaceAll("^```(?:json)?\\s*", "").replaceAll("```$", "").trim();
        }

        JsonNode parsed = mapper.readTree(jsonText);

        return AiAnalysis.builder()
                .readabilityLevel(parsed.path("readabilityLevel").asText("Medium"))
                .contentClarity(parsed.path("contentClarity").asDouble(7.0))
                .structuralQuality(parsed.path("structuralQuality").asDouble(7.0))
                .migrationReadiness(parsed.path("migrationReadiness").asText("READY_WITH_MINOR_CHANGES"))
                .readinessScore(parsed.path("readinessScore").asInt(70))
                .summary(parsed.path("summary").asText(""))
                .strengths(toStringList(parsed.path("strengths")))
                .issues(toStringList(parsed.path("issues")))
                .suggestions(toStringList(parsed.path("suggestions")))
                .build();
    }

    private List<String> toStringList(JsonNode arr) {
        List<String> out = new ArrayList<>();
        if (arr != null && arr.isArray()) {
            arr.forEach(n -> out.add(n.asText()));
        }
        return out;
    }

    private AiAnalysis heuristicFallback(DocumentMetrics m, DocumentStructure s) {
        int score = 60;
        if (s.isHasConsistentHierarchy()) score += 10;
        if (m.getHeadingCount() >= 3) score += 10;
        if (s.getLongParagraphs() == 0) score += 10;
        if (m.getAvgWordsPerParagraph() <= 60) score += 10;
        score = Math.min(100, score);

        String verdict = score >= 85 ? "READY"
                : score >= 70 ? "READY_WITH_MINOR_CHANGES"
                : score >= 50 ? "NEEDS_RESTRUCTURING"
                : "NOT_READY";

        String readability = m.getAvgWordsPerParagraph() < 40 ? "Easy"
                : m.getAvgWordsPerParagraph() < 80 ? "Medium" : "Complex";

        return AiAnalysis.builder()
                .readabilityLevel(readability)
                .contentClarity(7.0)
                .structuralQuality(s.isHasConsistentHierarchy() ? 8.0 : 5.0)
                .migrationReadiness(verdict)
                .readinessScore(score)
                .summary("Heuristic analysis — Gemini disabled or unavailable.")
                .strengths(List.of(
                        m.getHeadingCount() >= 3 ? "Good heading count" : "Document parsed successfully",
                        s.isHasConsistentHierarchy() ? "Consistent heading hierarchy" : "Structure extracted"
                ))
                .issues(s.getLongParagraphs() > 0
                        ? List.of(s.getLongParagraphs() + " paragraph(s) exceed 150 words")
                        : List.of())
                .suggestions(List.of(
                        "Enable Gemini for richer AI-driven insights",
                        s.getLongParagraphs() > 0 ? "Break long paragraphs for better scannability" : "Review structure for migration"
                ))
                .build();
    }
}
