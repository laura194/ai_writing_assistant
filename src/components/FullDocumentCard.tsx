import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom"; // Importiere useParams
import { ProjectService } from "../utils/ProjectService"; // Importiere den ProjectService
import { NodeContentService } from "../utils/NodeContentService";
import { Document, Packer, Paragraph, HeadingLevel } from "docx"; // Importiere docx für Word-Dokumente
import { saveAs } from "file-saver"; // Importiere file-saver für das Herunterladen von Dateien
import word from "/src/assets/images/full-document-page/word.jpg";
import pdf from "/src/assets/images/full-document-page/pdf.jpg";
import jsPDF from "jspdf";

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
  const { projectId } = useParams<{ projectId: string }>(); // Hole die projectId aus der URL
  const containerRef = useRef<HTMLDivElement>(null);
  const [structure, setStructure] = useState<StructureNode[]>([]);
  const [nodeContents, setNodeContents] = useState<NodeContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setError("Projekt-ID nicht gefunden.");
      setLoading(false);
      return;
    }

    const fetchStructure = async () => {
      try {
        const data = await ProjectService.getProjectById(projectId); // Verwende die projectId aus der URL
        if (data && data.projectStructure) {
          setStructure(data.projectStructure);
        } else {
          setError("Projektstruktur ist leer oder nicht verfügbar.");
        }
      } catch {
        setError("Fehler beim Laden der Projektstruktur.");
      } finally {
        setLoading(false);
      }
    };

    fetchStructure();
  }, [projectId]); // Abhängigkeit hinzufügen, damit die Anfrage bei Änderung der projectId neu ausgeführt wird

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
        setError("Fehler beim Laden der Inhalte.");
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

  const handleExportWord = async () => {
    const doc = buildDocxDocument(structure, nodeContents);
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "full_document.docx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text("Full Document", 10, 10);

    // Add content
    let y = 20; // Vertical position
    structure.forEach((node) => {
      doc.setFontSize(14);
      doc.text(node.name, 10, y); // Add node name as a heading
      y += 10;

      const content = nodeContents.find((n) => n.nodeId === node.id)?.content;
      if (content) {
        doc.setFontSize(12);
        doc.text(content, 10, y); // Add node content
        y += 10;
      }

      // Handle child nodes
      if (node.nodes) {
        node.nodes.forEach((childNode) => {
          doc.setFontSize(12);
          doc.text(`- ${childNode.name}`, 15, y); // Indent child nodes
          y += 10;

          const childContent = nodeContents.find(
            (n) => n.nodeId === childNode.id
          )?.content;
          if (childContent) {
            doc.setFontSize(10);
            doc.text(childContent, 20, y); // Add child content
            y += 10;
          }
        });
      }
    });

    doc.save("full_document.pdf");
  };

  return (
    <div className="p-4 shadow-lg rounded-lg bg-gray-100 relative">
      <div className="flex items-center gap-170 mb-4">
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
//TODO: Add buttons for exporting as LaTeX and PDF