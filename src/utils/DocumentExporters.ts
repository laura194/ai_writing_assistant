//import { Document, Packer, Paragraph, HeadingLevel } from "docx";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";

/**
 * Generates and exports project content as Word, PDF, or LaTeX format.
 *
 * @param {StructureNode[]} structure - Hierarchical structure of the project (sections and subsections).
 * @param {NodeContent[]} nodeContents - Content mapped to each structure node by ID.
 * @returns {void}
 *
 * Utilities include:
 * - Word export using `docx`
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

export const handleExportWord = async (
  structure: StructureNode[],
  nodeContents: NodeContent[],
) => {
  try {
    // Get LaTeX content using existing function
    const latexContent = handleExportLATEX(structure, nodeContents, false);
    console.log('Generated LaTeX content:', latexContent.substring(0, 100)); // Debug log

    const response = await fetch('http://localhost:5001/api/export/word', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
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
    saveAs(blob, 'document.docx');
  } catch (error) {
    console.error('Error exporting to Word:', error);
    throw error;
  }
};

export const handleExportPDF = (
  structure: StructureNode[],
  nodeContents: NodeContent[],
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

  doc.save("full_document.pdf");
};

export const handleExportLATEX = (
  structure: StructureNode[],
  nodeContents: NodeContent[],
  saveFile: boolean = true,
) => {
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
\\date{\\today}

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

  latexContent += `
\\newpage
\\printbibliography
\\end{document}
`;

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
// TODO Latex Export Improvements: 
// 1. Latex export has already a better structured look. Keep refining it.
// 2. Although it supports bibtex, it does not show the citations even if it is not existing. Hence, there should be Works Cited chapter, and ai protocol as a table in appendix even if not present in the structure.

// TODO Word Export Improvements: 
// 1. Word export use latex export first then convert to docx to have a better structured look.
// 2. It should include Works Cited chapter, and ai protocol as a table in appendix even if not present in the structure.

// TODO PDF Export Improvements:
// 1. PDF export use latex export function first then convert to PDF to have a better structured look.
// 2. It should include Works Cited chapter, and ai protocol as a table in appendix even if not present in the structure.