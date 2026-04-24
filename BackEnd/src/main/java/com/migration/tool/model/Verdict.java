package com.migration.tool.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class Verdict {
    private boolean isReadyForMigration;
    private double confidence;
    private String oneLineSummary;
}
