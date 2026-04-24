package com.migration.tool.service;

import com.migration.tool.model.HeadingNode;
import com.migration.tool.model.ParsedDocument;
import org.apache.poi.xwpf.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class DocxParserService {

    public ParsedDocument parse(MultipartFile file) throws IOException {
        try (InputStream is = file.getInputStream();
             XWPFDocument doc = new XWPFDocument(is)) {

            StringBuilder fullText = new StringBuilder();
            List<String> paragraphs = new ArrayList<>();
            List<HeadingNode> headings = new ArrayList<>();
            int hyperlinkCount = 0;
            int listCount = 0;

            for (XWPFParagraph p : doc.getParagraphs()) {
                String text = p.getText();
                if (text == null) continue;

                String styleId = p.getStyle();
                Integer headingLevel = extractHeadingLevel(styleId);

                if (headingLevel != null && !text.isBlank()) {
                    headings.add(HeadingNode.builder()
                            .level(headingLevel)
                            .text(text.trim())
                            .build());
                    fullText.append(text).append("\n");
                } else if (!text.isBlank()) {
                    paragraphs.add(text);
                    fullText.append(text).append("\n");
                }

                hyperlinkCount += p.getRuns().stream()
                        .filter(r -> r instanceof XWPFHyperlinkRun)
                        .toArray().length;

                if (p.getNumID() != null) listCount++;
            }

            int tableCount = doc.getTables().size();
            for (XWPFTable t : doc.getTables()) {
                for (XWPFTableRow row : t.getRows()) {
                    for (XWPFTableCell cell : row.getTableCells()) {
                        String cellText = cell.getText();
                        if (cellText != null && !cellText.isBlank()) {
                            fullText.append(cellText).append("\n");
                        }
                    }
                }
            }

            int imageCount = doc.getAllPictures().size();

            int estimatedPages = Math.max(1, fullText.length() / 3000);
            try {
                if (doc.getProperties() != null && doc.getProperties().getExtendedProperties() != null) {
                    int pages = doc.getProperties().getExtendedProperties().getPages();
                    if (pages > 0) estimatedPages = pages;
                }
            } catch (Exception ignored) { }

            return ParsedDocument.builder()
                    .fileName(file.getOriginalFilename())
                    .fileType("DOCX")
                    .fileSizeBytes(file.getSize())
                    .fullText(fullText.toString())
                    .paragraphs(paragraphs)
                    .headings(headings)
                    .pageCount(estimatedPages)
                    .imageCount(imageCount)
                    .tableCount(tableCount)
                    .hyperlinkCount(hyperlinkCount)
                    .listCount(listCount)
                    .build();
        }
    }

    private Integer extractHeadingLevel(String styleId) {
        if (styleId == null) return null;
        String s = styleId.toLowerCase();
        if (s.matches("heading\\d+") || s.matches("heading ?\\d+")) {
            String num = s.replaceAll("[^\\d]", "");
            if (!num.isEmpty()) {
                int lvl = Integer.parseInt(num);
                return (lvl >= 1 && lvl <= 6) ? lvl : null;
            }
        }
        if (s.equals("title")) return 1;
        return null;
    }
}
