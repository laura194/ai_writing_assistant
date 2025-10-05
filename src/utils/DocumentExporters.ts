import { saveAs } from "file-saver";
import { IAiProtocolEntry } from "../models/IAITypes";

/**
 * Generates and exports project content as Word, PDF, or LaTeX format.
 *
 * @param {StructureNode[]} structure - Hierarchical structure of the project (sections and subsections).
 * @param {NodeContent[]} nodeContents - Content mapped to each structure node by ID.
 * @returns {void}
 *
 * Utilities include:
 * - Word and PDF exports using backend conversion of LaTeX
 * - LaTeX export with support for equations, figures, tables, and citations
 *
 * Use `handleExportWord`, `handleExportPDF`, or `handleExportLATEX` to trigger the export fuctions.
 */

interface StructureNode {
  id: string;
  name: string;
  category?: string;
  nodes?: StructureNode[];
}

interface NodeContent {
  nodeId: string;
  name: string;
  content: string;
}

const generateLaTeXContent = (
  structure: StructureNode[],
  nodeContents: NodeContent[],
  aiProtocols: IAiProtocolEntry[] = [],
  forWord: boolean = false,
): string => {
  const latexDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  let latexContent = `
\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{graphicx}
\\usepackage{amsmath}
\\usepackage{booktabs}
\\usepackage{hyperref}
\\usepackage{caption}
\\usepackage{longtable}
\\usepackage{biblatex}
\\addbibresource{references.bib}

\\title{${escapeLatex(structure[0]?.name || "Untitled")}}
\\date{${latexDate}}

\\begin{document}
\\maketitle
`;

  structure.forEach((node) => {
    latexContent += `\\section{${escapeLatex(node.name)}}\n`;

    const content = nodeContents.find((n) => n.nodeId === node.id)?.content;
    if (content) {
      latexContent += `${parseRichContent(content)}\n\n`;
    }

    if (node.nodes) {
      node.nodes.forEach((childNode) => {
        latexContent += `\\subsection{${escapeLatex(childNode.name)}}\n`;
        const childContent = nodeContents.find(
          (n) => n.nodeId === childNode.id,
        )?.content;
        if (childContent) {
          latexContent += `${parseRichContent(childContent)}\n\n`;
        }
      });
    }
  });

  // AI Protocol appendix before bibliography
  latexContent +=
    `\n\\newpage\n` + buildAiProtocolLatexAppendix(aiProtocols, forWord);

  latexContent += `
\\newpage
\\printbibliography
\\end{document}
`;

  return latexContent;
};

export const handleExportWord = async (
  structure: StructureNode[],
  nodeContents: NodeContent[],
  aiProtocols: IAiProtocolEntry[] = [],
) => {
  try {
    const latexContent = generateLaTeXContent(
      structure,
      nodeContents,
      aiProtocols,
      true,
    );
    console.log("Generated LaTeX content:", latexContent.substring(0, 100));

    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
    console.log("API Base URL:", apiBaseUrl);

    const response = await fetch(`${apiBaseUrl}/api/export/word`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ latexContent }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server response:", errorText);
      throw new Error(`Server returned ${response.status}: ${errorText}`);
    }

    const blob = await response.blob();
    if (blob.size === 0) {
      throw new Error("Received empty file from server");
    }

    console.log("Conversion successful, saving Word document...");
    saveAs(blob, "full_document.docx");
  } catch (error) {
    console.error("Error exporting to Word:", error);
    throw error;
  }
};

export const handleExportPDF = async (
  structure: StructureNode[],
  nodeContents: NodeContent[],
  aiProtocols: IAiProtocolEntry[] = [],
) => {
  try {
    const latexContent = generateLaTeXContent(
      structure,
      nodeContents,
      aiProtocols,
      false, // This export is for PDF, not Word
    );
    console.log(
      "Generated LaTeX content for PDF:",
      latexContent.substring(0, 100),
    );

    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
    console.log("API Base URL:", apiBaseUrl);

    const response = await fetch(`${apiBaseUrl}/api/export/pdf`, {
      // New endpoint added in backend
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ latexContent }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server response:", errorText);
      throw new Error(`Server returned ${response.status}: ${errorText}`);
    }

    const blob = await response.blob();
    if (blob.size === 0) {
      throw new Error("Received empty file from server");
    }

    console.log("Conversion successful, saving PDF document...");
    saveAs(blob, "full_document.pdf");
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    throw error;
  }
};

export const handleExportLATEX = (
  structure: StructureNode[],
  nodeContents: NodeContent[],
  aiProtocols: IAiProtocolEntry[] = [],
  saveFile: boolean = true,
) => {
  const latexContent = generateLaTeXContent(
    structure,
    nodeContents,
    aiProtocols,
  );

  if (saveFile) {
    const blob = new Blob([latexContent], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "full_document.tex");
  }

  return latexContent;
};

const escapeLatex = (unsafe: string) => {
  return unsafe
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/_/g, "\\_")
    .replace(/%/g, "\\%")
    .replace(/&/g, "\\&")
    .replace(/#/g, "\\#")
    .replace(/\$/g, "\\$")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/\^/g, "\\^{}")
    .replace(/~/g, "\\~{}");
};

const parseRichContent = (content: string): string => {
  let processed = escapeLatex(content);

  processed = processed.replace(
    /\[FIGURE:([^:]+):([^\]]+)\]/g,
    (_, caption, url) =>
      `\\begin{figure}[h]\n\\centering\n\\includegraphics[width=0.8\\textwidth]{${url}}\n\\caption{${escapeLatex(
        caption,
      )}}\n\\end{figure}`,
  );

  processed = processed.replace(
    /\[TABLE:([^:]+):([\s\S]*?)\]/g,
    (_, caption, tableHtml) => {
      const tableRows = tableHtml
        .replace(/<table>|<\/table>/g, "")
        .split(/<\/tr>/)
        .map((row: string) =>
          row
            .replace(/<tr>|<\/tr>/g, "")
            .split(/<\/td>/)
            .map((cell) => cell.replace(/<td>|<\/td>/g, "").trim())
            .filter(Boolean),
        )
        .filter((row: string[]) => row.length > 0);

      const tableBody = tableRows
        .map((row: string[]) => row.join(" & ") + " \\\\ \\hline")
        .join("\n");

      return `\\begin{table}[h]\n\\centering\n\\caption{${escapeLatex(
        caption,
      )}}\n\\begin{tabular}{|${"c|".repeat(tableRows[0]?.length || 1)}}\n\\hline\n${tableBody}\n\\end{tabular}\n\\end{table}`;
    },
  );

  processed = processed.replace(/\\textbackslash\{\}\$/g, "$");

  processed = processed.replace(
    /\[CITE:([^\]]+)\]/g,
    (_, key) => `\\cite{${key}}`,
  );

  return processed;
};

function buildAiProtocolLatexAppendix(
  aiProtocols: IAiProtocolEntry[] = [],
  forWord: boolean = false,
): string {
  let appendix = `\\section*{Appendix: AI Protocol}\n`;
  if (!aiProtocols || aiProtocols.length === 0) {
    appendix += `No entries have been created in the AI protocol yet.\n\n`;
    return appendix;
  }

  const tableHeader = `Name & Usage & Affected sections & Notes & Created at & Updated at \\\\ \\hline\n`;
  const firstHeader = `\\endfirsthead\n\\hline\n${tableHeader}\\endhead\n`;

  if (forWord) {
    // Word path: longtable with header defined for first and subsequent pages
    appendix += `\\begin{longtable}{|l|l|l|l|l|l|}\n\\hline\n${tableHeader}${firstHeader}`;

    appendix += `\\end{longtable}\n`;
  } else {
    // Longtable with booktabs for LaTeX/PDF quality
    appendix +=
      `\n` +
      `\\setlength{\\LTpre}{0pt}\n` +
      `\\setlength{\\LTpost}{0pt}\n` +
      `\\begin{longtable}{p{2.5cm} p{3.2cm} p{3.2cm} p{5cm} p{2.2cm} p{2.2cm}}\n` +
      `\\toprule\n${tableHeader.replace(/\\hline/g, "\\midrule")}${firstHeader.replace(/\\hline/g, "\\midrule")}`;

    appendix += `\\bottomrule\n\\end{longtable}\n`;
  }

  const rows = aiProtocols
    .map(
      (p) =>
        `${escapeLatex(p.aiName || "")} & ${escapeLatex(p.usageForm || "")} & ${escapeLatex(p.affectedParts || "")} & ${escapeLatex(p.remarks || "")} & ${escapeLatex(formatDate(p.createdAt || ""))} & ${escapeLatex(formatDate(p.updatedAt || ""))} \\\\ \\hline\n`,
    )
    .join("");

  appendix = appendix.replace(`\\end{longtable}`, `${rows}\\end{longtable}`);

  return appendix;
}

function formatDate(date?: string | Date): string {
  if (!date) return "N/A";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return String(date);
  }
}

export {
  escapeLatex,
  parseRichContent,
  formatDate,
  buildAiProtocolLatexAppendix,
};
