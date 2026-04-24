package com.migration.tool.service;

import com.migration.tool.model.HeadingNode;
import com.migration.tool.model.ParsedDocument;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageTree;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDAnnotation;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDAnnotationLink;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class PdfParserService {

    public ParsedDocument parse(MultipartFile file) throws IOException {
        try (PDDocument doc = Loader.loadPDF(file.getBytes())) {

            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String fullText = stripper.getText(doc);

            List<String> paragraphs = new ArrayList<>();
            for (String block : fullText.split("\\n\\s*\\n")) {
                String trimmed = block.trim().replaceAll("\\s+", " ");
                if (!trimmed.isEmpty()) paragraphs.add(trimmed);
            }

            List<HeadingNode> headings = detectHeadings(fullText);

            int hyperlinkCount = 0;
            int imageCount = 0;
            PDPageTree pages = doc.getPages();
            for (PDPage page : pages) {
                for (PDAnnotation annotation : page.getAnnotations()) {
                    if (annotation instanceof PDAnnotationLink) hyperlinkCount++;
                }
                if (page.getResources() != null) {
                    for (var name : page.getResources().getXObjectNames()) {
                        try {
                            if (page.getResources().getXObject(name) instanceof org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject) {
                                imageCount++;
                            }
                        } catch (IOException ignored) { }
                    }
                }
            }

            int listCount = 0;
            Pattern listPattern = Pattern.compile("^\\s*([•\\-\\*]|\\d+[.)])\\s+.+", Pattern.MULTILINE);
            var matcher = listPattern.matcher(fullText);
            while (matcher.find()) listCount++;

            return ParsedDocument.builder()
                    .fileName(file.getOriginalFilename())
                    .fileType("PDF")
                    .fileSizeBytes(file.getSize())
                    .fullText(fullText)
                    .paragraphs(paragraphs)
                    .headings(headings)
                    .pageCount(doc.getNumberOfPages())
                    .imageCount(imageCount)
                    .tableCount(0)
                    .hyperlinkCount(hyperlinkCount)
                    .listCount(listCount)
                    .build();
        }
    }

    private List<HeadingNode> detectHeadings(String text) {
        List<HeadingNode> headings = new ArrayList<>();
        String[] lines = text.split("\\n");

        for (String raw : lines) {
            String line = raw.trim();
            if (line.isEmpty()) continue;
            int words = line.split("\\s+").length;
            if (words > 12) continue;

            if (line.equals(line.toUpperCase()) && line.matches(".*[A-Z].*") && words <= 8) {
                headings.add(HeadingNode.builder().level(1).text(line).build());
                continue;
            }

            if (line.matches("^\\d+(\\.\\d+)*\\.?\\s+.+") && words <= 10) {
                String prefix = line.split("\\s+")[0];
                int dots = (int) prefix.chars().filter(c -> c == '.').count();
                int level = Math.min(6, Math.max(1, dots));
                headings.add(HeadingNode.builder().level(level).text(line).build());
            }
        }
        return headings;
    }
}
