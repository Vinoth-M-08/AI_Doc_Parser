package com.migration.tool.model;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DocumentStructure {
    private List<HeadingNode> headingHierarchy;
    private boolean hasConsistentHierarchy;
    private List<String> orphanHeadings;
    private int longParagraphs;
    private int emptyHeadings;
}
