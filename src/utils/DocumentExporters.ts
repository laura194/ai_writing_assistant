import jsPDF from "jspdf";
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
 * - Word export using backend conversion of LaTeX
 * - PDF export using `jsPDF`
 * - LaTeX export with support for equations, figures, tables, and citations
 *
 * Use `handleExportWord`, `handleExportPDF`, or `handleExportLATEX` to trigger the export.
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
  const latexDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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

  // Append AI Protocol appendix before bibliography
  latexContent += `\n\\newpage\n` + buildAiProtocolLatexAppendix(aiProtocols, forWord);

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
    const latexContent = generateLaTeXContent(structure, nodeContents, aiProtocols, true);
    console.log('Generated LaTeX content:', latexContent.substring(0, 100));

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
    console.log('API Base URL:', apiBaseUrl);

    const response = await fetch(`${apiBaseUrl}/api/export/word`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ latexContent })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(`Server returned ${response.status}: ${errorText}`);
    }

    const blob = await response.blob();
    if (blob.size === 0) {
      throw new Error('Received empty file from server');
    }

    console.log('Conversion successful, saving Word document...');
    saveAs(blob, 'full_document.docx');
  } catch (error) {
    console.error('Error exporting to Word:', error);
    throw error;
  }
};

export const handleExportPDF = (
  structure: StructureNode[],
  nodeContents: NodeContent[],
  aiProtocols: IAiProtocolEntry[] = [],
) => {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  let y = 10;

  structure.forEach((node) => {
    if (y + 10 > pageHeight) {
      doc.addPage();
      y = 10;
    }

    doc.setFontSize(14);
    doc.text(node.name, 10, y);
    y += 10;

    const content = nodeContents.find((n) => n.nodeId === node.id)?.content;
    if (content) {
      const splitContent = doc.splitTextToSize(content, 180);
      splitContent.forEach((line: string | string[]) => {
        if (y + 10 > pageHeight) {
          doc.addPage();
          y = 10;
        }
        doc.setFontSize(12);
        doc.text(line, 10, y);
        y += 10;
      });
    }

    if (node.nodes) {
      node.nodes.forEach((childNode) => {
        if (y + 10 > pageHeight) {
          doc.addPage();
          y = 10;
        }

        doc.setFontSize(12);
        doc.text(`- ${childNode.name}`, 15, y);
        y += 10;

        const childContent = nodeContents.find(
          (n) => n.nodeId === childNode.id,
        )?.content;
        if (childContent) {
          const splitChildContent = doc.splitTextToSize(childContent, 180);
          splitChildContent.forEach((line: string | string[]) => {
            if (y + 10 > pageHeight) {
              doc.addPage();
              y = 10;
            }
            doc.setFontSize(10);
            doc.text(line, 20, y);
            y += 10;
          });
        }
      });
    }
  });

  // Appendix: AI Protocol
  doc.addPage();
  y = 10;
  doc.setFontSize(14);
  doc.text("Appendix: AI Protocol", 10, y);
  y += 10;

  if (!aiProtocols || aiProtocols.length === 0) {
    doc.setFontSize(12);
    doc.text("No entries have been created in the AI protocol yet.", 10, y);
  } else {
    const colWidths = [25, 35, 35, 55, 15, 15];
    const colXs = [10];
    for (let i = 1; i < colWidths.length; i++) {
      colXs[i] = colXs[i - 1] + colWidths[i - 1];
    }

    doc.setFontSize(10);
    const headers = [
      "Name",
      "Usage",
      "Affected sections",
      "Notes",
      "Created at",
      "Updated at",
    ];
    headers.forEach((h, i) => {
      doc.text(h, colXs[i] + 1, y);
    });
    y += 6;

    aiProtocols.forEach((p) => {
      const cells = [
        p.aiName || "",
        p.usageForm || "",
        p.affectedParts || "",
        p.remarks || "",
        formatDate(p.createdAt || ""),
        formatDate(p.updatedAt || ""),
      ];

      const linesArray = cells.map((cell, i) =>
        doc.splitTextToSize(cell, colWidths[i] - 2),
      );
      const maxLines = Math.max(...linesArray.map((arr) => arr.length));

      for (let lineIdx = 0; lineIdx < maxLines; lineIdx++) {
        if (y + 6 > pageHeight) {
          doc.addPage();
          y = 10;
          doc.setFontSize(10);
        }
        linesArray.forEach((arr, i) => {
          const lineText = arr[lineIdx] || "";
          doc.text(lineText, colXs[i] + 1, y);
        });
        y += 6;
      }

      y += 2; // spacing between rows
    });
  }

  doc.save("full_document.pdf");
};

export const handleExportLATEX = (
  structure: StructureNode[],
  nodeContents: NodeContent[],
  aiProtocols: IAiProtocolEntry[] = [],
  saveFile: boolean = true,
) => {
  const latexContent = generateLaTeXContent(structure, nodeContents, aiProtocols);
  
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
  // Use an unnumbered section to avoid appendix numeration in Word conversions
  let appendix = `\\section*{Appendix: AI Protocol}\n`;
  if (!aiProtocols || aiProtocols.length === 0) {
    appendix += `No entries have been created in the AI protocol yet.\n\n`;
    return appendix;
  }

  if (forWord) {
    // Word path: longtable with header defined for first and subsequent pages
    appendix +=
      `\\begin{longtable}{|l|l|l|l|l|l|}\n` +
      `\\hline\n` +
      `Name & Usage & Affected sections & Notes & Created at & Updated at \\\\ \\hline\n` +
      `\\endfirsthead\n` +
      `\\hline\n` +
      `Name & Usage & Affected sections & Notes & Created at & Updated at \\\\ \\hline\n` +
      `\\endhead\n`;

    aiProtocols.forEach((p) => {
      appendix += `${escapeLatex(p.aiName || "")} & ${escapeLatex(p.usageForm || "")} & ${escapeLatex(p.affectedParts || "")} & ${escapeLatex(p.remarks || "")} & ${escapeLatex(formatDate(p.createdAt || ""))} & ${escapeLatex(formatDate(p.updatedAt || ""))} \\\\ \\hline\n`;
    });

    appendix += `\\end{longtable}\n`;
  } else {
    // Longtable with booktabs for LaTeX/PDF quality
    appendix += `\n` +
      `\\setlength{\\LTpre}{0pt}\n` +
      `\\setlength{\\LTpost}{0pt}\n` +
      `\\begin{longtable}{p{2.5cm} p{3.2cm} p{3.2cm} p{5cm} p{2.2cm} p{2.2cm}}\n` +
      `\\toprule\n` +
      `Name & Usage & Affected sections & Notes & Created at & Updated at \\\\ \n` +
      `\\midrule\n` +
      `\\endfirsthead\n` +
      `\\toprule\n` +
      `Name & Usage & Affected sections & Notes & Created at & Updated at \\\\ \n` +
      `\\midrule\n` +
      `\\endhead\n`;

    aiProtocols.forEach((p) => {
      appendix += `${escapeLatex(p.aiName || "")} & ${escapeLatex(p.usageForm || "")} & ${escapeLatex(p.affectedParts || "")} & ${escapeLatex(p.remarks || "")} & ${escapeLatex(formatDate(p.createdAt || ""))} & ${escapeLatex(formatDate(p.updatedAt || ""))} \\\\ \\hline\n`;
    });

    appendix += `\\bottomrule\n\\end{longtable}\n`;
  }

  return appendix;
}

function formatDate(date?: string | Date): string {
  if (!date) return "N/A";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return String(date);
  }
}

// TODO PDF Export Improvements:
// 1. PDF export use latex export function first then convert to PDF to have a better structured look.
// 2. It should include Works Cited chapter, and ai protocol as a table in appendix even if not present in the structure.