import { describe, it, expect } from "vitest";
import type { IAiProtocolEntry, AIResult } from "./IAITypes";

describe("AI Types Interfaces", () => {
  describe("IAiProtocolEntry", () => {
    it("should have required properties", () => {
      const minimalEntry: IAiProtocolEntry = {
        aiName: "GPT-4",
        usageForm: "Content generation",
        affectedParts: "Introduction section",
        remarks: "Used for initial draft",
        projectId: "project-123",
      };

      expect(minimalEntry.aiName).toBe("GPT-4");
      expect(minimalEntry.usageForm).toBe("Content generation");
      expect(minimalEntry.affectedParts).toBe("Introduction section");
      expect(minimalEntry.remarks).toBe("Used for initial draft");
      expect(minimalEntry.projectId).toBe("project-123");
    });

    it("should allow optional _id property", () => {
      const entryWithId: IAiProtocolEntry = {
        _id: "ai-protocol-123",
        aiName: "Claude",
        usageForm: "Editing",
        affectedParts: "Conclusion",
        remarks: "Improved clarity",
        projectId: "project-456",
      };

      expect(entryWithId._id).toBe("ai-protocol-123");
      expect(entryWithId.aiName).toBe("Claude");
    });

    it("should allow optional createdAt and updatedAt properties", () => {
      const timestamp = "2023-01-01T00:00:00Z";
      const entryWithTimestamps: IAiProtocolEntry = {
        aiName: "Gemini",
        usageForm: "Research assistance",
        affectedParts: "Methodology",
        remarks: "Provided research insights",
        projectId: "project-789",
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      expect(entryWithTimestamps.createdAt).toBe(timestamp);
      expect(entryWithTimestamps.updatedAt).toBe(timestamp);
    });

    it("should validate all property types", () => {
      const fullEntry: IAiProtocolEntry = {
        _id: "protocol-1",
        aiName: "Test AI",
        usageForm: "Testing",
        affectedParts: "All sections",
        remarks: "Test entry",
        projectId: "test-project",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-02T00:00:00Z",
      };

      expect(typeof fullEntry.aiName).toBe("string");
      expect(typeof fullEntry.usageForm).toBe("string");
      expect(typeof fullEntry.affectedParts).toBe("string");
      expect(typeof fullEntry.remarks).toBe("string");
      expect(typeof fullEntry.projectId).toBe("string");

      if (fullEntry._id) expect(typeof fullEntry._id).toBe("string");
      if (fullEntry.createdAt)
        expect(typeof fullEntry.createdAt).toBe("string");
      if (fullEntry.updatedAt)
        expect(typeof fullEntry.updatedAt).toBe("string");
    });

    it("should handle empty strings for required properties", () => {
      const emptyEntry: IAiProtocolEntry = {
        aiName: "",
        usageForm: "",
        affectedParts: "",
        remarks: "",
        projectId: "",
      };

      expect(emptyEntry.aiName).toBe("");
      expect(emptyEntry.usageForm).toBe("");
      expect(emptyEntry.affectedParts).toBe("");
      expect(emptyEntry.remarks).toBe("");
      expect(emptyEntry.projectId).toBe("");
    });
  });

  describe("AIResult", () => {
    it("should have required text property", () => {
      const minimalResult: AIResult = {
        text: "Generated content",
      };

      expect(minimalResult.text).toBe("Generated content");
    });

    it("should allow optional originalText property", () => {
      const resultWithOriginal: AIResult = {
        originalText: "Original content",
        text: "Modified content",
      };

      expect(resultWithOriginal.originalText).toBe("Original content");
      expect(resultWithOriginal.text).toBe("Modified content");
    });

    it("should allow optional prompt and modelVersion properties", () => {
      const resultWithMetadata: AIResult = {
        text: "Generated response",
        prompt: "Write a summary",
        modelVersion: "gpt-4-0613",
      };

      expect(resultWithMetadata.text).toBe("Generated response");
      expect(resultWithMetadata.prompt).toBe("Write a summary");
      expect(resultWithMetadata.modelVersion).toBe("gpt-4-0613");
    });

    it("should allow optional usageMetadata property", () => {
      const resultWithUsage: AIResult = {
        text: "Generated content",
        usageMetadata: {
          promptTokenCount: 100,
          candidatesTokenCount: 50,
          totalTokenCount: 150,
        },
      };

      expect(resultWithUsage.text).toBe("Generated content");
      expect(resultWithUsage.usageMetadata).toBeDefined();
      expect(resultWithUsage.usageMetadata!.promptTokenCount).toBe(100);
      expect(resultWithUsage.usageMetadata!.candidatesTokenCount).toBe(50);
      expect(resultWithUsage.usageMetadata!.totalTokenCount).toBe(150);
    });

    it("should validate all property types", () => {
      const fullResult: AIResult = {
        originalText: "Original text",
        text: "Generated text",
        prompt: "Test prompt",
        modelVersion: "model-v1",
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 20,
          totalTokenCount: 30,
        },
      };

      expect(typeof fullResult.text).toBe("string");
      expect(typeof fullResult.originalText).toBe("string");
      expect(typeof fullResult.prompt).toBe("string");
      expect(typeof fullResult.modelVersion).toBe("string");

      if (fullResult.usageMetadata) {
        expect(typeof fullResult.usageMetadata.promptTokenCount).toBe("number");
        expect(typeof fullResult.usageMetadata.candidatesTokenCount).toBe(
          "number",
        );
        expect(typeof fullResult.usageMetadata.totalTokenCount).toBe("number");
      }
    });

    it("should handle empty text", () => {
      const emptyResult: AIResult = {
        text: "",
      };

      expect(emptyResult.text).toBe("");
    });

    it("should validate usageMetadata calculations", () => {
      const result: AIResult = {
        text: "Test",
        usageMetadata: {
          promptTokenCount: 100,
          candidatesTokenCount: 200,
          totalTokenCount: 300,
        },
      };

      const usage = result.usageMetadata!;
      expect(usage.totalTokenCount).toBe(
        usage.promptTokenCount + usage.candidatesTokenCount,
      );
    });
  });

  describe("Interface Integration", () => {
    it("should work together in a complete AI workflow scenario", () => {
      // Simulate a complete AI workflow
      const aiResult: AIResult = {
        originalText: "Draft content",
        text: "Improved content with AI assistance",
        prompt: "Improve the clarity and conciseness",
        modelVersion: "claude-2",
        usageMetadata: {
          promptTokenCount: 50,
          candidatesTokenCount: 150,
          totalTokenCount: 200,
        },
      };

      const protocolEntry: IAiProtocolEntry = {
        aiName: "Claude 2",
        usageForm: "Content improvement",
        affectedParts: "Main body text",
        remarks: "Enhanced clarity and fixed grammar",
        projectId: "project-abc",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(aiResult.text).toContain("Improved content");
      expect(protocolEntry.aiName).toBe("Claude 2");
      expect(protocolEntry.affectedParts).toBe("Main body text");
    });

    it("should handle multiple AI protocol entries for same project", () => {
      const projectId = "multi-ai-project";

      const entries: IAiProtocolEntry[] = [
        {
          aiName: "GPT-4",
          usageForm: "Research",
          affectedParts: "Background",
          remarks: "Provided research material",
          projectId,
        },
        {
          aiName: "Claude",
          usageForm: "Writing",
          affectedParts: "Main content",
          remarks: "Drafted sections",
          projectId,
        },
      ];

      expect(entries).toHaveLength(2);
      expect(entries[0].projectId).toBe(projectId);
      expect(entries[1].projectId).toBe(projectId);
      expect(entries[0].aiName).not.toBe(entries[1].aiName);
    });

    it("should handle AI results with different levels of metadata", () => {
      const results: AIResult[] = [
        { text: "Simple response" },
        {
          text: "Detailed response",
          prompt: "Explain in detail",
          modelVersion: "gpt-4",
        },
        {
          originalText: "Original",
          text: "Enhanced",
          usageMetadata: {
            promptTokenCount: 100,
            candidatesTokenCount: 200,
            totalTokenCount: 300,
          },
        },
      ];

      expect(results[0].text).toBe("Simple response");
      expect(results[1].modelVersion).toBe("gpt-4");
      expect(results[2].usageMetadata!.totalTokenCount).toBe(300);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long strings in IAiProtocolEntry", () => {
      const longString = "a".repeat(1000);
      const entry: IAiProtocolEntry = {
        aiName: longString,
        usageForm: longString,
        affectedParts: longString,
        remarks: longString,
        projectId: "test",
      };

      expect(entry.aiName).toHaveLength(1000);
      expect(entry.remarks).toHaveLength(1000);
    });

    it("should handle very long text in AIResult", () => {
      const longText = "x".repeat(5000);
      const result: AIResult = {
        text: longText,
      };

      expect(result.text).toHaveLength(5000);
    });

    it("should handle large token counts in usageMetadata", () => {
      const result: AIResult = {
        text: "Content",
        usageMetadata: {
          promptTokenCount: 1000000,
          candidatesTokenCount: 2000000,
          totalTokenCount: 3000000,
        },
      };

      expect(result.usageMetadata!.totalTokenCount).toBe(3000000);
    });

    it("should handle special characters in all string fields", () => {
      const specialString = "Special!@#$%^&*() chars\n\t\r";

      const entry: IAiProtocolEntry = {
        aiName: specialString,
        usageForm: specialString,
        affectedParts: specialString,
        remarks: specialString,
        projectId: "special-project",
      };

      const result: AIResult = {
        originalText: specialString,
        text: specialString,
        prompt: specialString,
        modelVersion: specialString,
      };

      expect(entry.aiName).toBe(specialString);
      expect(result.text).toBe(specialString);
    });
  });
});
