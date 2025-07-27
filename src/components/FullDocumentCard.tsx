import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom"; 
import { ProjectService } from "../utils/ProjectService"; 
import { NodeContentService } from "../utils/NodeContentService";
import { Document, Packer, Paragraph, HeadingLevel } from "docx"; 
import { saveAs } from "file-saver"; 
import jsPDF from "jspdf";
import word from "/src/assets/images/full-document-page/word.jpg";
import pdf from "/src/assets/images/full-document-page/pdf.jpg";
import latex from "/src/assets/images/full-document-page/latex.png";

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

const FullDocumentCard = () => {
  const { projectId } = useParams<{ projectId: string }>(); // Get the projectId from the URL
  const containerRef = useRef<HTMLDivElement>(null);
  const [structure, setStructure] = useState<StructureNode[]>([]);
  const [nodeContents, setNodeContents] = useState<NodeContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setError("Projekt-ID not found.");
      setLoading(false);
      return;
    }

    const fetchStructure = async () => {
      try {
        const data = await ProjectService.getProjectById(projectId); // Use the projectId from URL
        if (data && data.projectStructure) {
          setStructure(data.projectStructure);
        } else {
          setError("Project structure is empty or unavailable.”");
        }
      } catch {
        setError("Error loading the project structure.");
      } finally {
        setLoading(false);
      }
    };

    fetchStructure();
  }, [projectId]); // Add dependency so the request runs again when projectId changes

  useEffect(() => {
    const fetchNodeContents = async () => {
      try {
        if (!projectId) {
          setError("Projekt-ID not found.");
          return;
        }

        const data = await NodeContentService.getNodeContents(
          undefined,
          projectId,
        );
        const mappedData = data.map((node) => ({
          nodeId: node.nodeId || "",
          name: node.name,
          content: node.content || "",
        }));
        setNodeContents(mappedData);
      } catch {
        setError("Error loading the contents.");
      } finally {
        setLoading(false);
      }
    };

    fetchNodeContents();
  }, [projectId]);

  useEffect(() => {
    if (
      !containerRef.current ||
      structure.length === 0 ||
      nodeContents.length === 0
    )
      return;

    const buildHtml = (nodes: StructureNode[], depth = 1): string => {
      return nodes
        .map((node) => {
          const contentEntry = nodeContents.find((n) => n.nodeId === node.id);
          const headingTag = `h${Math.min(depth + 1, 6)}`;
          const headingClass =
            depth === 1
              ? "text-2xl font-bold mt-6"
              : depth === 2
                ? "text-xl font-semibold mt-4"
                : "text-lg font-medium mt-3";

          const heading = `<${headingTag} class="${headingClass}">${node.name}</${headingTag}>`;
          const content = contentEntry?.content
            ? `<p class="whitespace-pre-line mt-2 mb-4">${escapeHtml(contentEntry.content)}</p>`
            : "";

          const children = node.nodes ? buildHtml(node.nodes, depth + 1) : "";

          return heading + content + children;
        })
        .join("");
    };

    const finalHtml = buildHtml(structure);
    containerRef.current.innerHTML = finalHtml;
  }, [structure, nodeContents]);

  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

    const buildDocxDocument = (structure: StructureNode[], nodeContents: NodeContent[]) => {
    const children: Paragraph[] = [];

    structure.forEach((node) => {
      children.push(
        new Paragraph({
          text: node.name,
          heading: HeadingLevel.HEADING_1,
        })
      );

      const content = nodeContents.find((n) => n.nodeId === node.id)?.content;
      if (content) {
        children.push(new Paragraph(content));
      }

      if (node.nodes) {
        node.nodes.forEach((childNode) => {
          children.push(
            new Paragraph({
              text: childNode.name,
              heading: HeadingLevel.HEADING_2,
            })
          );
          const childContent = nodeContents.find((n) => n.nodeId === childNode.id)?.content;
          if (childContent) {
            children.push(new Paragraph(childContent));
          }
        });
      }
    });

    return new Document({
      sections: [
        {
          children,
        },
      ],
    });
  };

  // Function to handle Word export
  const handleExportWord = async () => {
    const doc = buildDocxDocument(structure, nodeContents);
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "full_document.docx");
  };

  // Function to handle PDF export
  const handleExportPDF = () => {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height; // Get page height
  let y = 10; // Initial vertical position

  // Add content
  structure.forEach((node) => {
    // Check if there is enough space for the chapter title
    if (y + 10 > pageHeight) {
      doc.addPage(); // Add a new page if content exceeds page height
      y = 10; // Reset vertical position
    }

    // Add chapter title
    doc.setFontSize(14);
    doc.text(node.name, 10, y);
    y += 10;

    // Add chapter content
    const content = nodeContents.find((n) => n.nodeId === node.id)?.content;
    if (content) {
      const splitContent = doc.splitTextToSize(content, 180); // Split long text into multiple lines
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

    // Handle child nodes
    if (node.nodes) {
      node.nodes.forEach((childNode) => {
        // Check if there iss enough space for the child node title
        if (y + 10 > pageHeight) {
          doc.addPage();
          y = 10;
        }

        // Add child node title
        doc.setFontSize(12);
        doc.text(`- ${childNode.name}`, 15, y);
        y += 10;

        // Add child node content
        const childContent = nodeContents.find(
          (n) => n.nodeId === childNode.id
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

  // Function to handle LaTeX export
  const handleExportLATEX = () => {
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
          const childContent = nodeContents.find((n) => n.nodeId === childNode.id)?.content;
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

  const blob = new Blob([latexContent], { type: "text/plain;charset=utf-8" });
  saveAs(blob, "full_document.tex");
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

  // Handle figures: [FIGURE:caption:img_url]
  processed = processed.replace(
    /\[FIGURE:([^:]+):([^\]]+)\]/g,
    (_, caption, url) =>
      `\\begin{figure}[h]\n\\centering\n\\includegraphics[width=0.8\\textwidth]{${url}}\n\\caption{${escapeLatex(caption)}}\n\\end{figure}`
  );

  // Handle tables: [TABLE:caption:<table>...</table>]
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
            .filter(Boolean)
        )
        .filter((row: string | unknown[]) => row.length > 0);

      const tableBody = tableRows
        .map((row: unknown[]) => row.join(" & ") + " \\\\ \\hline")
        .join("\n");

      return `\\begin{table}[h]\n\\centering\n\\caption{${escapeLatex(caption)}}\n\\begin{tabular}{|${"c|".repeat(tableRows[0]?.length || 1)}}\n\\hline\n${tableBody}\n\\end{tabular}\n\\end{table}`;
    }
  );

  // Restore inline math $...$ and display math $$...$$ (already valid LaTeX)
  processed = processed.replace(/\\textbackslash\{\}\$/g, "$"); // recover $ if escaped

  // Handle bibliography citations: [CITE:key]
  processed = processed.replace(/\[CITE:([^\]]+)\]/g, (_, key) => `\\cite{${key}}`);

  return processed;
};

  return (
    <div className="p-4 shadow-lg rounded-lg bg-gray-100 relative">
      <div className="flex items-center gap-150 mb-4">
        <h2 className="text-2xl font-bold mr-6">Full Document</h2>
          <div className="flex space-x-4">
          {/* Word Export Button */}
          <button
            onClick={handleExportWord}
            title="Download it as a Word document"
          >
            <img src={word} className="h-14 w-14" />
          </button>
          {/* PDF Export Button */}
          <button
            onClick={handleExportPDF}
            title="Download it as a PDF file"
            //className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md flex items-center justify-center"
          >
            <img src={pdf} className="h-14 w-14" />
          </button>
          {/* LaTeX Export Button */}
          <button
            onClick={handleExportLATEX}
            title="Download it as a LaTeX document"
            //className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md flex items-center justify-center"
          >
            <img src={latex} className="h-14 w-14" />
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div
          ref={containerRef}
          className="relative max-h-150 overflow-y-auto"
        ></div>
      )}
    </div>
  );
};

export default FullDocumentCard;