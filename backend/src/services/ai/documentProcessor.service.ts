import fs from "fs";
import path from "path";

export interface DocumentChunk {
  chunkIndex: number;
  documentTitle: string;
  content: string;
  wordCount: number;
}

export class DocumentProcessor {
  /**
   * Splits plain text into overlapping chunks for semantic retrieval.
   * @param text Raw text content
   * @param documentTitle Name/Title of the source document
   * @param chunkSize Number of words per chunk (default: 150)
   * @param chunkOverlap Number of overlapping words between consecutive chunks (default: 30)
   */
  public static chunkText(
    text: string,
    documentTitle: string,
    chunkSize: number = 150,
    chunkOverlap: number = 30
  ): DocumentChunk[] {
    const cleanedText = text.replace(/\s+/g, " ").trim();
    if (!cleanedText) return [];

    const words = cleanedText.split(" ");
    if (words.length <= chunkSize) {
      return [
        {
          chunkIndex: 0,
          documentTitle,
          content: cleanedText,
          wordCount: words.length,
        },
      ];
    }

    const chunks: DocumentChunk[] = [];
    let startIdx = 0;
    let chunkIndex = 0;

    while (startIdx < words.length) {
      const endIdx = Math.min(startIdx + chunkSize, words.length);
      const chunkWords = words.slice(startIdx, endIdx);
      chunks.push({
        chunkIndex,
        documentTitle,
        content: chunkWords.join(" "),
        wordCount: chunkWords.length,
      });

      chunkIndex++;
      startIdx += chunkSize - chunkOverlap;
      if (endIdx === words.length) break;
    }

    return chunks;
  }

  /**
   * Safely reads text from disk if available or returns placeholder text for unparsed binaries.
   */
  public static extractTextFromFile(filePath: string, fallbackTitle: string): string {
    try {
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        if (ext === ".txt" || ext === ".md") {
          return fs.readFileSync(filePath, "utf-8");
        }
      }
    } catch (err) {
      console.warn(`Could not read physical file at ${filePath}:`, err);
    }

    // Default academic syllabus outline if physical binary cannot be parsed directly
    return `Course Syllabus and Learning Outcomes for ${fallbackTitle}.
Core Topics Covered:
1. Fundamental Theoretical Concepts and Architecture.
2. Core Algorithms, Data Structures, and Computational Complexity.
3. System Implementation, Design Patterns, and Modular Engineering.
4. Laboratory Practical Guidelines, Testing Strategies, and Evaluation Criteria.
Assessment Policy: Midterm Exam (30%), Practical Laboratory Assignments (30%), Final Comprehensive Project Evaluation (40%).`;
  }
}
