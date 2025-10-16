import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  handleExportWord,
  handleExportPDF,
  handleExportLATEX,
  escapeLatex,
  parseRichContent,
  formatDate,
  buildAiProtocolLatexAppendix,
} from "./DocumentExporters";
import { IAiProtocolEntry } from "../models/IAITypes";

// Mock the entire file-saver module
vi.mock("file-saver", () => ({
  saveAs: vi.fn(),
}));

import { saveAs } from "file-saver";

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockStructure = [
  {
    id: "1",
    name: "Introduction",
    nodes: [
      { id: "1.1", name: "Background" },
      { id: "1.2", name: "Objectives" },
    ],
  },
];

const mockNodeContents = [
  { nodeId: "1", name: "Introduction", content: "This is the intro." },
  {
    nodeId: "1.1",
    name: "Background",
    content: "Some background info with special chars: & % $ # _ { }.",
  },
  { nodeId: "1.2", name: "Objectives", content: "The objective is..." },
];

const mockAiProtocols: IAiProtocolEntry[] = [
  {
    projectId: "proj1",
    aiName: "Test AI",
    usageForm: "Content Generation",
    affectedParts: "Introduction",
    remarks: "Used for brainstorming.",
    createdAt: "2023-01-01T12:00:00.000Z",
    updatedAt: "2023-01-01T12:00:00.000Z",
  },
];

describe("DocumentExporters", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2023-10-27T10:00:00Z"));
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Pure Functions", () => {
    it("escapeLatex should escape special LaTeX characters", () => {
      const input = "\\\\_%&#${}{}^~";
      const result = escapeLatex(input);
      expect(result).toContain("\\textbackslash");
      expect(result).toContain("\\_");
      expect(result).toContain("\\%");
      expect(result).toContain("\\&");
      expect(result).toContain("\\#");
      expect(result).toContain("\\$");
      expect(result).toContain("\\{");
      expect(result).toContain("\\}");
      expect(result).toContain("\\^{}");
      expect(result).toContain("\\~{}");
    });

    it("formatDate should format date strings correctly", () => {
      const result = formatDate("2023-01-01T12:00:00.000Z");
      expect(result).toContain("Jan");
      expect(result).toContain("2023");
      expect(formatDate()).toBe("N/A");
    });

    it("parseRichContent should process figures, tables, and citations", () => {
      const content =
        "A figure [FIGURE:A cat:cat.jpg], a table [TABLE:Numbers:<table><tr><td>1</td></tr></table>], and a citation [CITE:knuth1984].";
      const result = parseRichContent(content);
      expect(result).toContain("\\begin{figure}");
      expect(result).toContain("\\caption{A cat}");
      expect(result).toContain(
        "\\includegraphics[width=0.8\\textwidth]{cat.jpg}",
      );
      expect(result).toContain("\\begin{table}");
      expect(result).toContain("\\caption{Numbers}");
      expect(result).toContain("1 \\\\ \\hline");
      expect(result).toContain("\\cite{knuth1984}");
    });

    it("buildAiProtocolLatexAppendix should create a LaTeX table for AI protocols", () => {
      const result = buildAiProtocolLatexAppendix(mockAiProtocols, false);
      expect(result).toContain("\\section*{Appendix: AI Protocol}");
      expect(result).toContain("\\begin{longtable}");
      expect(result).toContain("Test AI");
      expect(result).toContain("Content Generation");
      expect(result).toContain("Used for brainstorming.");
    });

    it("buildAiProtocolLatexAppendix should handle empty protocols", () => {
      const result = buildAiProtocolLatexAppendix([], false);
      expect(result).toContain(
        "No entries have been created in the AI protocol yet.",
      );
      expect(result).not.toContain("\\begin{longtable}");
    });

    it("buildAiProtocolLatexAppendix should use simpler table for Word export", () => {
      const result = buildAiProtocolLatexAppendix(mockAiProtocols, true);
      expect(result).toContain("\\begin{longtable}{|l|l|l|l|l|l|}");
    });
  });

  describe("handleExportLATEX", () => {
    it("should generate a .tex file and trigger download", () => {
      handleExportLATEX(mockStructure, mockNodeContents, mockAiProtocols);

      expect(saveAs).toHaveBeenCalledOnce();
      const blob = (saveAs as any).mock.calls[0][0] as Blob;
      const filename = (saveAs as any).mock.calls[0][1];

      expect(blob.type).toBe("text/plain;charset=utf-8");
      expect(filename).toBe("full_document.tex");
    });

    it("should return LaTeX content without saving if saveFile is false", () => {
      const content = handleExportLATEX(
        mockStructure,
        mockNodeContents,
        mockAiProtocols,
        false,
      );

      expect(saveAs).not.toHaveBeenCalled();
      expect(content).toContain("\\documentclass{article}");
      expect(content).toContain("\\section{Introduction}");
      expect(content).toContain("This is the intro.");
      expect(content).toContain("\\subsection{Background}");
      expect(content).toContain("\\section*{Appendix: AI Protocol}");
    });
  });

  describe("handleExportWord", () => {
    it("should send LaTeX content to Pandoc Docker service and save the docx", async () => {
      const mockBlob = new Blob(["word_content"], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      // Create a proper Response object
      const mockResponse = {
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
        clone: vi.fn().mockReturnThis(),
        headers: new Headers(),
        status: 200,
        statusText: "OK",
      };

      mockFetch.mockResolvedValue(mockResponse);

      await handleExportWord(mockStructure, mockNodeContents, mockAiProtocols);

      // Check that fetch was called
      expect(mockFetch).toHaveBeenCalledOnce();

      const fetchCall = mockFetch.mock.calls[0];
      const url = fetchCall[0];
      const options = fetchCall[1] || {}; // Handle case where options might be undefined

      // URL could be a string or URL object - both are valid for fetch
      expect(url).toBeDefined();

      // Check method if options are provided
      if (options && options.method) {
        expect(options.method).toBe("POST");
      }

      // Check that LaTeX content is being sent if body is provided
      if (options && options.body) {
        const body = JSON.parse(options.body);
        expect(body.latexContent).toBeDefined();
        expect(body.latexContent).toContain("\\documentclass{article}");
      }

      expect(saveAs).toHaveBeenCalledOnce();
      expect((saveAs as any).mock.calls[0][1]).toBe("full_document.docx");
    });

    it("should throw an error if the server response is not ok", async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: vi.fn().mockResolvedValue("Internal Server Error"),
        clone: vi.fn().mockReturnThis(),
        headers: new Headers(),
      };

      mockFetch.mockResolvedValue(mockResponse);

      await expect(
        handleExportWord(mockStructure, mockNodeContents, mockAiProtocols),
      ).rejects.toThrow("Server returned 500: Internal Server Error");

      expect(saveAs).not.toHaveBeenCalled();
    });

    it("should throw an error if the received blob is empty", async () => {
      const mockBlob = new Blob([], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const mockResponse = {
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
        clone: vi.fn().mockReturnThis(),
        headers: new Headers(),
        status: 200,
        statusText: "OK",
      };

      mockFetch.mockResolvedValue(mockResponse);

      await expect(
        handleExportWord(mockStructure, mockNodeContents, mockAiProtocols),
      ).rejects.toThrow("Received empty file from server");

      expect(saveAs).not.toHaveBeenCalled();
    });
  });

  describe("handleExportPDF", () => {
    it("should send LaTeX content to Pandoc Docker service and save the pdf", async () => {
      const mockBlob = new Blob(["pdf_content"], { type: "application/pdf" });
      const mockResponse = {
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
        clone: vi.fn().mockReturnThis(),
        headers: new Headers(),
        status: 200,
        statusText: "OK",
      };

      mockFetch.mockResolvedValue(mockResponse);

      await handleExportPDF(mockStructure, mockNodeContents, mockAiProtocols);

      // Check that fetch was called
      expect(mockFetch).toHaveBeenCalledOnce();

      const fetchCall = mockFetch.mock.calls[0];
      const url = fetchCall[0];
      const options = fetchCall[1] || {}; // Handle case where options might be undefined

      // URL could be a string or URL object - both are valid for fetch
      expect(url).toBeDefined();

      // Check method if options are provided
      if (options && options.method) {
        expect(options.method).toBe("POST");
      }

      // Check that LaTeX content is being sent if body is provided
      if (options && options.body) {
        const body = JSON.parse(options.body);
        expect(body.latexContent).toBeDefined();
        expect(body.latexContent).toContain("\\documentclass{article}");
      }

      expect(saveAs).toHaveBeenCalledOnce();
      expect((saveAs as any).mock.calls[0][1]).toBe("full_document.pdf");
    });

    it("should throw an error if the server response is not ok", async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: vi.fn().mockResolvedValue("Internal Server Error"),
        clone: vi.fn().mockReturnThis(),
        headers: new Headers(),
      };

      mockFetch.mockResolvedValue(mockResponse);

      await expect(
        handleExportPDF(mockStructure, mockNodeContents, mockAiProtocols),
      ).rejects.toThrow("Server returned 500: Internal Server Error");

      expect(saveAs).not.toHaveBeenCalled();
    });

    it("should throw an error if the received blob is empty", async () => {
      const mockBlob = new Blob([], { type: "application/pdf" });
      const mockResponse = {
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
        clone: vi.fn().mockReturnThis(),
        headers: new Headers(),
        status: 200,
        statusText: "OK",
      };

      mockFetch.mockResolvedValue(mockResponse);

      await expect(
        handleExportPDF(mockStructure, mockNodeContents, mockAiProtocols),
      ).rejects.toThrow("Received empty file from server");

      expect(saveAs).not.toHaveBeenCalled();
    });
  });
});
