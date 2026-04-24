package com.migration.tool.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DocumentMetrics {
    private int totalPages;
    private int wordCount;
    private int paragraphCount;
    private int headingCount;
    private int sectionCount;
    private double avgWordsPerParagraph;
    private int imageCount;
    private int tableCount;
    private int hyperlinkCount;
    private int listCount;
}
