package com.migration.tool.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAnalysis {
    private String readabilityLevel;
    private double contentClarity;
    private double structuralQuality;
    private String migrationReadiness;
    private int readinessScore;
    private String summary;
    private List<String> strengths;
    private List<String> issues;
    private List<String> suggestions;
}
