package com.migration.tool.service;

import com.migration.tool.model.ParsedDocument;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class DocumentParserService {

    private final DocxParserService docxParser;
    private final PdfParserService pdfParser;

    public ParsedDocument parse(MultipartFile file) throws IOException {
        String name = file.getOriginalFilename();
        if (name == null) throw new IllegalArgumentException("File name is required");
        String lower = name.toLowerCase();

        if (lower.endsWith(".docx")) return docxParser.parse(file);
        if (lower.endsWith(".pdf"))  return pdfParser.parse(file);

        throw new IllegalArgumentException("Unsupported file type. Only .docx and .pdf are allowed.");
    }
}
