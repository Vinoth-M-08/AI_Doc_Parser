package com.migration.tool.service;

import com.migration.tool.model.DocumentMetrics;
import com.migration.tool.model.HeadingNode;
import com.migration.tool.model.ParsedDocument;
import org.springframework.stereotype.Service;

@Service
public class MetricsService {

    public DocumentMetrics compute(ParsedDocument doc) {
        int wordCount = doc.getFullText() == null
                ? 0
                : doc.getFullText().trim().isEmpty()
                    ? 0
                    : doc.getFullText().trim().split("\\s+").length;

        int paragraphCount = doc.getParagraphs() != null ? doc.getParagraphs().size() : 0;
        int headingCount = doc.getHeadings() != null ? doc.getHeadings().size() : 0;

        double avgWordsPerParagraph = paragraphCount == 0
                ? 0
                : (double) wordCount / paragraphCount;

        int sectionCount = 0;
        if (doc.getHeadings() != null) {
            for (HeadingNode h : doc.getHeadings()) {
                if (h.getLevel() == 1) sectionCount++;
            }
            if (sectionCount == 0 && headingCount > 0) sectionCount = 1;
        }

        return DocumentMetrics.builder()
                .totalPages(doc.getPageCount())
                .wordCount(wordCount)
                .paragraphCount(paragraphCount)
                .headingCount(headingCount)
                .sectionCount(sectionCount)
                .avgWordsPerParagraph(Math.round(avgWordsPerParagraph * 10.0) / 10.0)
                .imageCount(doc.getImageCount())
                .tableCount(doc.getTableCount())
                .hyperlinkCount(doc.getHyperlinkCount())
                .listCount(doc.getListCount())
                .build();
    }
}
