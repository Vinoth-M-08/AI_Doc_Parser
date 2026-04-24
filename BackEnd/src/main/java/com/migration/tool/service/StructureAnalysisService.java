package com.migration.tool.service;

import com.migration.tool.model.DocumentStructure;
import com.migration.tool.model.HeadingNode;
import com.migration.tool.model.ParsedDocument;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class StructureAnalysisService {

    private static final int LONG_PARAGRAPH_THRESHOLD = 150;

    public DocumentStructure analyze(ParsedDocument doc) {
        List<HeadingNode> headings = doc.getHeadings() != null ? doc.getHeadings() : List.of();

        List<HeadingNode> enriched = computeWordsUnder(headings, doc.getParagraphs());

        boolean consistent = true;
        List<String> orphans = new ArrayList<>();
        int prevLevel = 0;
        for (HeadingNode h : headings) {
            if (prevLevel != 0 && h.getLevel() - prevLevel > 1) {
                consistent = false;
                orphans.add("H" + h.getLevel() + ": " + h.getText());
            }
            prevLevel = h.getLevel();
        }

        int longParas = 0;
        if (doc.getParagraphs() != null) {
            for (String p : doc.getParagraphs()) {
                if (p.trim().split("\\s+").length > LONG_PARAGRAPH_THRESHOLD) longParas++;
            }
        }

        int emptyHeadings = countEmptyHeadings(enriched);

        return DocumentStructure.builder()
                .headingHierarchy(enriched)
                .hasConsistentHierarchy(consistent)
                .orphanHeadings(orphans)
                .longParagraphs(longParas)
                .emptyHeadings(emptyHeadings)
                .build();
    }

    private List<HeadingNode> computeWordsUnder(List<HeadingNode> headings, List<String> paragraphs) {
        if (headings.isEmpty() || paragraphs == null || paragraphs.isEmpty()) return headings;

        int totalWords = 0;
        for (String p : paragraphs) totalWords += p.trim().split("\\s+").length;
        int avg = totalWords / Math.max(1, headings.size());

        List<HeadingNode> out = new ArrayList<>();
        for (HeadingNode h : headings) {
            out.add(HeadingNode.builder()
                    .level(h.getLevel())
                    .text(h.getText())
                    .wordsUnder(avg)
                    .build());
        }
        return out;
    }

    private int countEmptyHeadings(List<HeadingNode> headings) {
        int empty = 0;
        for (HeadingNode h : headings) {
            if (h.getWordsUnder() != null && h.getWordsUnder() == 0) empty++;
        }
        return empty;
    }
}
