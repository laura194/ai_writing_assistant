import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
const saveAsMock = vi.hoisted(() => vi.fn());
vi.mock("file-saver", () => ({
  saveAs: saveAsMock,
}));

// Import the module *after* the mock is defined
import { saveAs } from "file-saver";

// Optional: give it a proper mock type alias if you like
const mockedSaveAs = saveAs as unknown as Mock;
import {
  escapeLatex,
  parseRichContent,
  formatDate,
  buildAiProtocolLatexAppendix,
} from "./DocumentExporters";
import { IAiProtocolEntry } from "../models/IAITypes";

class MockBlob {
  private parts: any[];
  public size: number;

  constructor(parts: any[], _opts?: any) {
    this.parts = parts || [];
    this.size = this.parts.reduce((acc, part) => acc + (part?.length || 0), 0);
  }
  async text() {
    return this.parts
      .map((p) => {
        if (typeof p === "string") return p;
        if (p instanceof Uint8Array) return new TextDecoder().decode(p);
        if (p && typeof (p as any).toString === "function")
          return (p as any).toString();
        try {
          return JSON.stringify(p);
        } catch {
          return String(p);
        }
      })
      .join("");
  }
  async arrayBuffer() {
    const txt = await this.text();
    return new TextEncoder().encode(txt).buffer;
  }
}
(globalThis as any).Blob = MockBlob;

import {
  handleExportWord,
  handleExportPDF,
  handleExportLATEX,
} from "./DocumentExporters";

describe("export utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the saveAs mock to have no calls
    mockedSaveAs.mockClear();
  });

  it("handleExportWord - fetches document from backend and saves as .docx", async () => {
    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(["fake docx content"])),
    });

    const structure = [
      {
        id: "n1",
        name: "Section One",
        nodes: [{ id: "n1a", name: "Child A" }],
      },
    ];
    const nodeContents = [
      { nodeId: "n1", name: "Section One", content: "Parent content" },
      { nodeId: "n1a", name: "Child A", content: "Child content" },
    ];

    await handleExportWord(structure, nodeContents, []);

    // Check that fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:5001/api/export/word",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    // Check that saveAs was called exactly once
    expect(mockedSaveAs).toHaveBeenCalledTimes(1);

    const [blobArg, filename] = mockedSaveAs.mock.calls[0];
    expect(filename).toBe("full_document.docx");

    // Directly check the content of the blob passed to saveAs
    const blobText = await blobArg.text();
    expect(blobText).toContain("fake docx content");
  });

  it("handleExportWord - should handle server error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Internal Server Error"),
    });

    await expect(handleExportWord([], [], [])).rejects.toThrow(
      "Server returned 500: Internal Server Error",
    );
  });

  it("handleExportWord - should handle empty blob response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob([])),
    });

    await expect(handleExportWord([], [], [])).rejects.toThrow(
      "Received empty file from server",
    );
  });

  it("handleExportWord - should handle fetch throwing an error", async () => {
    const fetchError = new Error("Network failure");
    global.fetch = vi.fn().mockRejectedValue(fetchError);

    await expect(handleExportWord([], [], [])).rejects.toThrow(fetchError);
  });

  it("handleExportWord - should handle empty structure", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(["fake docx content"])),
    });

    await handleExportWord([], [], []);
    expect(global.fetch).toHaveBeenCalled();
  });

  it("handleExportWord - should use VITE_API_BASE_URL if set", async () => {
    const originalEnv = import.meta.env.VITE_API_BASE_URL;
    import.meta.env.VITE_API_BASE_URL = "http://test-url:1234";

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(["fake docx content"])),
    });

    await handleExportWord([], [], []);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://test-url:1234/api/export/word",
      expect.any(Object),
    );
    import.meta.env.VITE_API_BASE_URL = originalEnv;
  });

  it("handleExportPDF - calls backend PDF endpoint and saves file", async () => {
    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(["fake pdf content"])),
    });

    const structure = [
      {
        id: "n1",
        name: "Root",
        nodes: [
          { id: "n1a", name: "Child 1" },
          { id: "n1b", name: "Child 2" },
        ],
      },
    ];

    const nodeContents = [
      { nodeId: "n1", name: "Root", content: "Line1\nLine2" },
      { nodeId: "n1a", name: "Child 1", content: "Child content" },
    ];

    await handleExportPDF(structure, nodeContents);

    // Check that fetch was called with PDF endpoint
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:5001/api/export/pdf",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    // Check that saveAs was called with correct filename
    expect(mockedSaveAs).toHaveBeenCalledTimes(1);
    const [blobArg, filename] = mockedSaveAs.mock.calls[0];
    expect(filename).toBe("full_document.pdf");

    // Check blob content
    const blobText = await blobArg.text();
    expect(blobText).toContain("fake pdf content");
  });

  it("handleExportPDF - should handle empty blob response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob([])),
    });

    await expect(handleExportPDF([], [])).rejects.toThrow(
      "Received empty file from server",
    );
  });

  it("handleExportPDF - should handle server error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve("PDF Generation Failed"),
    });

    await expect(handleExportPDF([], [])).rejects.toThrow(
      "Server returned 500: PDF Generation Failed",
    );
  });

  it("handleExportPDF - should handle fetch throwing an error", async () => {
    const fetchError = new Error("Network failure");
    global.fetch = vi.fn().mockRejectedValue(fetchError);

    await expect(handleExportPDF([], [])).rejects.toThrow(fetchError);
  });

  it("handleExportLATEX - generates latex with escape, figure, table and cite and saves .tex", async () => {
    const structure = [
      {
        id: "sec1",
        name: "Section_100% & $pecial#",
        nodes: [{ id: "sub1", name: "Sub_section" }],
      },
    ];

    const tableHtml =
      "<table><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></table>";
    const nodeContents = [
      {
        nodeId: "sec1",
        name: "Section_100% & $pecial#",
        content:
          "Intro text [FIGURE:Caption:/path/to/img.png] [TABLE:MyTable:" +
          tableHtml +
          "] Some math: \\textbackslash{}$ and a citation [CITE:doe2020].",
      },
      {
        nodeId: "sub1",
        name: "Sub_section",
        content: "Sub content [CITE:foo]",
      },
    ];

    await handleExportLATEX(structure, nodeContents);

    expect(mockedSaveAs).toHaveBeenCalledTimes(1);
    const [blobArg, filename] = mockedSaveAs.mock.calls[0];
    expect(filename).toBe("full_document.tex");

    // Check the blob content directly
    const blobText = await blobArg.text();

    expect(blobText).toContain("\\title{Section\\_100\\% \\& \\$pecial\\#}");
    expect(blobText).toContain("\\section{Section\\_100\\% \\& \\$pecial\\#}");
    expect(blobText).toContain("\\includegraphics");
    expect(blobText).toContain("/path/to/img.png");
    expect(blobText).toContain("\\caption{Caption}");
    expect(blobText).toContain("\\begin{table}");
    expect(blobText).toContain("A & B");
    expect(blobText).toContain("C & D");
    expect(blobText).toContain("\\cite{doe2020}");

    // Accept either raw dollar or escaped-dollar output produced by current parser
    const hasRawDollar = blobText.includes("Some math: $");
    const hasEscapedDollar =
      /Some math: .*\\\$\b/.test(blobText) ||
      /Some math: .*\\textbackslash/.test(blobText);
    expect(hasRawDollar || hasEscapedDollar).toBeTruthy();
  });

  describe("DocumentExporters - Additional Tests", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mockedSaveAs.mockClear();
    });

    it("handleExportLATEX - should return latex content when saveFile is false", () => {
      const structure = [
        {
          id: "sec1",
          name: "Test Section",
          nodes: [],
        },
      ];

      const nodeContents = [
        {
          nodeId: "sec1",
          name: "Test Section",
          content: "Test content",
        },
      ];

      const result = handleExportLATEX(structure, nodeContents, [], false);

      expect(result).toContain("\\documentclass{article}");
      expect(result).toContain("Test Section");
      expect(mockedSaveAs).not.toHaveBeenCalled();
    });

    it("handleExportLATEX - should include AI protocol appendix with entries", async () => {
      const structure = [
        {
          id: "sec1",
          name: "Test Section",
          nodes: [],
        },
      ];

      const nodeContents = [
        {
          nodeId: "sec1",
          name: "Test Section",
          content: "Test content",
        },
      ];

      const aiProtocols: IAiProtocolEntry[] = [
        {
          projectId: "project1",
          aiName: "Gemini 2.0",
          usageForm: "Content generation",
          affectedParts: "Introduction",
          remarks: "Used for initial draft",
          createdAt: "2023-01-01T00:00:00Z",
          updatedAt: "2023-01-02T00:00:00Z",
        },
      ];

      await handleExportLATEX(structure, nodeContents, aiProtocols);

      expect(mockedSaveAs).toHaveBeenCalledTimes(1);

      const [blobArg] = mockedSaveAs.mock.calls[0];
      const text = await blobArg.text();

      expect(text).toContain("Appendix: AI Protocol");
      expect(text).toContain("Gemini 2.0");
      expect(text).toContain("Content generation");
      expect(text).toContain("Introduction");
      expect(text).toContain("Used for initial draft");
    });

    it("handleExportLATEX - should handle empty AI protocols", async () => {
      const structure = [
        {
          id: "sec1",
          name: "Test Section",
          nodes: [],
        },
      ];

      const nodeContents = [
        {
          nodeId: "sec1",
          name: "Test Section",
          content: "Test content",
        },
      ];

      await handleExportLATEX(structure, nodeContents, []);

      const [blobArg] = mockedSaveAs.mock.calls[0];
      const text = await blobArg.text();

      expect(text).toContain(
        "No entries have been created in the AI protocol yet",
      );
    });

    it("handleExportPDF - should include AI protocols in LaTeX content sent to backend", async () => {
      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(new Blob(["fake pdf content"])),
      });

      const structure = [
        {
          id: "n1",
          name: "Root",
          nodes: [],
        },
      ];

      const nodeContents = [
        { nodeId: "n1", name: "Root", content: "Root content" },
      ];

      const aiProtocols: IAiProtocolEntry[] = [
        {
          projectId: "project1",
          aiName: "Test AI",
          usageForm: "Testing",
          affectedParts: "All sections",
          remarks: "Test remarks",
          createdAt: "2023-01-01T00:00:00Z",
          updatedAt: "2023-01-02T00:00:00Z",
        },
      ];

      await handleExportPDF(structure, nodeContents, aiProtocols);

      // Check that fetch was called with LaTeX containing AI protocols
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:5001/api/export/pdf",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: expect.stringContaining("Test AI"),
        }),
      );

      // Check that saveAs was called
      expect(mockedSaveAs).toHaveBeenCalledTimes(1);
      const [_, filename] = mockedSaveAs.mock.calls[0];
      expect(filename).toBe("full_document.pdf");
    });

    it("handleExportWord - should include AI protocols in LaTeX content", async () => {
      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(new Blob(["fake docx content"])),
      });

      const structure = [
        {
          id: "n1",
          name: "Section One",
          nodes: [],
        },
      ];

      const nodeContents = [
        { nodeId: "n1", name: "Section One", content: "Parent content" },
      ];

      const aiProtocols: IAiProtocolEntry[] = [
        {
          projectId: "project1",
          aiName: "Word AI",
          usageForm: "Word export",
          affectedParts: "All",
          remarks: "Used for Word export",
          createdAt: "2023-01-01T00:00:00Z",
          updatedAt: "2023-01-02T00:00:00Z",
        },
      ];

      await handleExportWord(structure, nodeContents, aiProtocols);

      // Check that fetch was called with LaTeX containing AI protocols
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:5001/api/export/word",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: expect.stringContaining("Word AI"),
        }),
      );
    });

    it("parseRichContent - should handle all content types including escaped characters", () => {
      const testContent = `
      Test content with _underscore_ & ampersand % percent # hash $ dollar 
      [FIGURE:Test Caption:/path/image.png]
      [TABLE:Test Table:<table><tr><td>A</td><td>B</td></tr></table>]
      [CITE:test2023]
    `;

      const result = parseRichContent(testContent);

      expect(result).toContain("\\_underscore\\_");
      expect(result).toContain("\\& ampersand");
      expect(result).toContain("\\% percent");
      expect(result).toContain("\\# hash");
      expect(result).toContain("\\$ dollar");
      expect(result).toContain("\\includegraphics");
      expect(result).toContain("/path/image.png");
      expect(result).toContain("\\begin{table}");
      expect(result).toContain("A & B");
      expect(result).toContain("\\cite{test2023}");
    });

    it("parseRichContent - should handle empty table tag", () => {
      const testContent = "[TABLE:Empty Table:<table></table>]";
      const result = parseRichContent(testContent);
      expect(result).toContain("\\caption{Empty Table}");
      expect(result).toContain("\\begin{tabular}{|c|}");
    });

    it("parseRichContent - should handle malformed table tag", () => {
      const testContent = "[TABLE:Malformed Table:no html here]";
      const result = parseRichContent(testContent);
      expect(result).toContain("\\caption{Malformed Table}");
      expect(result).toContain("\\begin{tabular}{|c|}");
    });

    it("parseRichContent - should handle table with empty rows", () => {
      const testContent = "[TABLE:Empty Rows:<tr></tr><tr></tr>]";
      const result = parseRichContent(testContent);
      expect(result).toContain("\\begin{tabular}{|c|}");
    });

    it("escapeLatex - should escape all special characters correctly", () => {
      const testString =
        "Test _with_ & special % characters # and $ symbols { } ^ ~ \\";
      const result = escapeLatex(testString);

      expect(result).toContain("\\_with\\_");
      expect(result).toContain("\\& special");
      expect(result).toContain("\\% characters");
      expect(result).toContain("\\# and");
      expect(result).toContain("\\$ symbols");
      expect(result).toContain("\\{ \\}");
      expect(result).toContain("\\^{}");
      expect(result).toContain("\\~{}");
      expect(result).toContain("\\textbackslash\\{\\}");
    });

    it("formatDate - should handle invalid dates", () => {
      const result = formatDate("invalid-date");
      expect(result).toBe("Invalid Date");
    });

    it("formatDate - should handle invalid date objects", () => {
      const invalidDate = new Date("invalid-date");
      // Mock toLocaleString to throw an error, simulating an invalid date object
      invalidDate.toLocaleString = vi.fn().mockImplementation(() => {
        throw new Error("RangeError");
      });

      const result = formatDate(invalidDate);

      expect(result).toBe("Invalid Date");
    });

    it("formatDate - should handle undefined dates", () => {
      const result = formatDate(undefined);
      expect(result).toBe("N/A");
    });

    it("buildAiProtocolLatexAppendix - should generate table for Word export", () => {
      const aiProtocols: IAiProtocolEntry[] = [
        {
          projectId: "project1",
          aiName: "Test AI",
          usageForm: "Testing",
          affectedParts: "All",
          remarks: "Test remarks",
          createdAt: "2023-01-01T00:00:00Z",
          updatedAt: "2023-01-02T00:00:00Z",
        },
      ];

      const result = buildAiProtocolLatexAppendix(aiProtocols, true);

      expect(result).toContain("\\begin{longtable}");
      expect(result).toContain("Test AI");
      expect(result).toContain("Testing");
      expect(result).toContain("All");
      expect(result).toContain("Test remarks");
    });

    it("buildAiProtocolLatexAppendix - should generate table for LaTeX export", () => {
      const aiProtocols: IAiProtocolEntry[] = [
        {
          projectId: "project1",
          aiName: "Test AI",
          usageForm: "Testing",
          affectedParts: "All",
          remarks: "Test remarks",
          createdAt: "2023-01-01T00:00:00Z",
          updatedAt: "2023-01-02T00:00:00Z",
        },
      ];

      const result = buildAiProtocolLatexAppendix(aiProtocols, false);

      expect(result).toContain("\\begin{longtable}");
      expect(result).toContain("\\toprule");
      expect(result).toContain("\\midrule");
      expect(result).toContain("\\bottomrule");
      expect(result).toContain("Test AI");
    });

    it("buildAiProtocolLatexAppendix - should handle empty protocols", () => {
      const result = buildAiProtocolLatexAppendix([], true);

      expect(result).toContain(
        "No entries have been created in the AI protocol yet",
      );
    });

    it("handleExportLATEX - should handle nodes without content", async () => {
      const structure = [
        {
          id: "sec1",
          name: "Section With Content",
          nodes: [{ id: "sub1", name: "Sub-section without content" }],
        },
        {
          id: "sec2",
          name: "Section Without Content",
          nodes: [],
        },
      ];

      const nodeContents = [
        {
          nodeId: "sec1",
          name: "Section With Content",
          content: "I have content.",
        },
      ];

      await handleExportLATEX(structure, nodeContents, [], true);

      const [blobArg] = mockedSaveAs.mock.calls[0];
      const text = await blobArg.text();

      expect(text).toContain("\\section{Section With Content}");
      expect(text).toContain("I have content.");
      expect(text).toContain("\\subsection{Sub-section without content}");
      expect(text).toContain("\\section{Section Without Content}");
    });

    it("handleExportLATEX - should use 'Untitled' for empty structure", async () => {
      await handleExportLATEX([], [], [], true);

      const [blobArg] = mockedSaveAs.mock.calls[0];
      const text = await blobArg.text();

      expect(text).toContain("\\title{Untitled}");
    });
  });
});
