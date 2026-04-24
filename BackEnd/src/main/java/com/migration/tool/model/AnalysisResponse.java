package com.migration.tool.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AnalysisResponse {
    private String fileName;
    private String fileType;
    private long fileSizeKb;
    private DocumentMetrics metrics;
    private DocumentStructure structure;
    private AiAnalysis aiAnalysis;
    private Verdict verdict;
    private String analyzer;
    private String model;
}
