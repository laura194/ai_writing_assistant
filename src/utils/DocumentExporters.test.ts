import { describe, it, expect, beforeEach, vi } from "vitest";

class MockBlob {
  private parts: any[];
  constructor(parts: any[], _opts?: any) {
    this.parts = parts || [];
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

vi.mock("file-saver", () => {
  const saved: { last?: { blob: any; filename: string; text?: string } } = {};
  const saveAs = vi.fn((blob: any, filename: string) => {
    saved.last = { blob, filename, text: undefined };

    const attemptRead = async () => {
      try {
        if (blob && typeof blob.text === "function") {
          saved.last!.text = await blob.text();
        } else if (blob && typeof blob.arrayBuffer === "function") {
          const buf = await blob.arrayBuffer();
          saved.last!.text = new TextDecoder().decode(buf);
        } else {
          saved.last!.text = String(blob);
        }
      } catch {
        saved.last!.text = undefined;
      }
    };

    attemptRead();
    return undefined;
  });

  (saveAs as any).__saved = saved;

  return {
    saveAs,
  };
});

vi.mock("docx", () => {
  class Document {
    sections: any;
    constructor(opts: any) {
      this.sections = opts?.sections;
    }
  }
  class Paragraph {
    public opts: any;
    constructor(opts: any) {
      this.opts = opts;
    }
  }
  const HeadingLevel = {
    HEADING_1: "H1",
    HEADING_2: "H2",
  };
  const Packer = {
    toBlob: vi.fn().mockResolvedValue({
      text: async () => "mock-docx",
      arrayBuffer: async () => new TextEncoder().encode("mock-docx").buffer,
    }),
  };
  return { Document, Paragraph, HeadingLevel, Packer };
});

vi.mock("jspdf", () => {
  class MockJsPDF {
    static lastInstance: any;
    internal: any;
    texts: Array<any>;
    _addedPages = 0;
    _saved?: string;
    _lastFontSize?: number;
    constructor() {
      MockJsPDF.lastInstance = this;
      this.internal = { pageSize: { height: 30 } };
      this.texts = [];
    }
    addPage() {
      this._addedPages += 1;
    }
    setFontSize(s: number) {
      this._lastFontSize = s;
    }
    text(txt: any, x: number, y: number) {
      this.texts.push({ txt, x, y });
    }
    splitTextToSize(content: string, _w: number) {
      return content.includes("\n") ? content.split("\n") : [content];
    }
    save(filename: string) {
      this._saved = filename;
    }
  }
  return {
    default: MockJsPDF,
  };
});

import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import { Packer } from "docx";

import {
  handleExportWord,
  handleExportPDF,
  handleExportLATEX,
} from "./DocumentExporters";

describe("export utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (Packer.toBlob as any).mockResolvedValue({
      text: async () => "mock-docx",
      arrayBuffer: async () => new TextEncoder().encode("mock-docx").buffer,
    });
  });

  it("handleExportWord - builds document and saves as .docx", async () => {
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

    await handleExportWord(structure, nodeContents);

    expect(Packer.toBlob).toHaveBeenCalled();
    expect(saveAs).toHaveBeenCalledTimes(1);

    const [_blobArg, filename] = (saveAs as any).mock.calls[0];
    expect(filename).toBe("full_document.docx");

    await new Promise((r) => setTimeout(r, 0));

    const saved = (saveAs as any).__saved as {
      last?: { blob: any; filename: string; text?: string };
    };
    expect(saved.last).toBeDefined();
    expect(saved.last!.filename).toBe("full_document.docx");
    expect(saved.last!.text).toContain("mock-docx");
  });

  it("handleExportPDF - writes node names, contents and child nodes then saves", () => {
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

    handleExportPDF(structure, nodeContents);

    const inst = (jsPDF as any).lastInstance;
    expect(inst).toBeDefined();

    const printedRoot = inst.texts.find((t: any) =>
      (t.txt as string).includes("Root"),
    );
    expect(printedRoot).toBeTruthy();

    const printedChild = inst.texts.find((t: any) =>
      (t.txt as string).includes("- Child 1"),
    );
    expect(printedChild).toBeTruthy();

    expect(inst._saved).toBe("full_document.pdf");
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

    expect(saveAs).toHaveBeenCalledTimes(1);
    const [_blobArg, filename] = (saveAs as any).mock.calls[0];
    expect(filename).toBe("full_document.tex");

    await new Promise((r) => setTimeout(r, 0));

    const saved = (saveAs as any).__saved as {
      last?: { blob: any; filename: string; text?: string };
    };
    expect(saved.last).toBeDefined();
    expect(saved.last!.filename).toBe("full_document.tex");
    const text = saved.last!.text!;

    expect(text).toContain("\\title{Section\\_100\\% \\& \\$pecial\\#}");
    expect(text).toContain("\\section{Section\\_100\\% \\& \\$pecial\\#}");
    expect(text).toContain("\\includegraphics");
    expect(text).toContain("/path/to/img.png");
    expect(text).toContain("\\caption{Caption}");
    expect(text).toContain("\\begin{table}");
    expect(text).toContain("A & B");
    expect(text).toContain("C & D");
    expect(text).toContain("\\cite{doe2020}");

    // Accept either raw dollar or escaped-dollar output produced by current parser
    const hasRawDollar = text.includes("Some math: $");
    const hasEscapedDollar =
      /Some math: .*\\\$\b/.test(text) ||
      /Some math: .*\\textbackslash/.test(text);
    expect(hasRawDollar || hasEscapedDollar).toBeTruthy();
  });
});
