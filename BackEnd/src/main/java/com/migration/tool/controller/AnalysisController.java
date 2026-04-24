package com.migration.tool.controller;

import com.migration.tool.model.*;
import com.migration.tool.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnalysisController {

    private final DocumentParserService parserService;
    private final MetricsService metricsService;
    private final StructureAnalysisService structureService;
    private final GeminiAnalysisService geminiService;

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "doc-migration-tool");
    }

    @GetMapping("/settings")
    public Map<String, Object> settings() {
        return Map.of(
                "geminiConfigured", geminiService.isConfigured(),
                "geminiEnabledByDefault", geminiService.isEnabledByDefault(),
                "defaultModel", geminiService.getDefaultModel(),
                "availableModels", geminiService.getAvailableModels()
        );
    }

    @PostMapping(value = "/analyze", consumes = "multipart/form-data")
    public ResponseEntity<AnalysisResponse> analyze(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "useAi", required = false) Boolean useAi,
            @RequestParam(value = "model", required = false) String model
    ) throws Exception {
        log.info("Received file: {} ({} bytes), useAi={}, model={}", file.getOriginalFilename(), file.getSize(), useAi, model);

        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }

        boolean wantAi = useAi != null ? useAi : geminiService.isEnabledByDefault();

        ParsedDocument parsed = parserService.parse(file);
        DocumentMetrics metrics = metricsService.compute(parsed);
        DocumentStructure structure = structureService.analyze(parsed);
        GeminiAnalysisService.Result result = geminiService.analyze(parsed, metrics, structure, wantAi, model);
        AiAnalysis ai = result.analysis();
        String analyzer = result.analyzer();
        String usedModel = result.model();

        boolean ready = "READY".equals(ai.getMigrationReadiness())
                     || "READY_WITH_MINOR_CHANGES".equals(ai.getMigrationReadiness());

        Verdict verdict = Verdict.builder()
                .isReadyForMigration(ready)
                .confidence(ai.getReadinessScore() / 100.0)
                .oneLineSummary(ai.getSummary())
                .build();

        AnalysisResponse response = AnalysisResponse.builder()
                .fileName(parsed.getFileName())
                .fileType(parsed.getFileType())
                .fileSizeKb(parsed.getFileSizeBytes() / 1024)
                .metrics(metrics)
                .structure(structure)
                .aiAnalysis(ai)
                .verdict(verdict)
                .analyzer(analyzer)
                .model(usedModel)
                .build();

        return ResponseEntity.ok(response);
    }
}
