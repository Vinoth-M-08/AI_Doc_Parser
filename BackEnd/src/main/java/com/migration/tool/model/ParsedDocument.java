package com.migration.tool.model;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ParsedDocument {
    private String fileName;
    private String fileType;
    private long fileSizeBytes;
    private String fullText;
    private List<String> paragraphs;
    private List<HeadingNode> headings;
    private int pageCount;
    private int imageCount;
    private int tableCount;
    private int hyperlinkCount;
    private int listCount;
}
