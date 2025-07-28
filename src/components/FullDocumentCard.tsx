import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ProjectService } from "../utils/ProjectService";
import { NodeContentService } from "../utils/NodeContentService";
import word from "/src/assets/images/full-document-page/word.jpg";
import pdf from "/src/assets/images/full-document-page/pdf.jpg";
import latex from "/src/assets/images/full-document-page/latex.png";
import {
  handleExportWord,
  handleExportPDF,
  handleExportLATEX,
} from "../utils/DocumentExporters";

/**
 * Generates the whole project content in one single page and exports it as Word, PDF, or LaTeX format.
 *
 * @component
 * @returns {JSX.Element} The rendered full document export UI.
 *
 * @description
 * - Fetches a hierarchical project structure and content from backend services.
 * - Renders the document structure dynamically in HTML format.
 * - Allows exporting the full document in multiple formats via buttons:
 *   - Word (.docx) using `docx`
 *   - PDF (.pdf) using `jsPDF`
 *   - LaTeX (.tex) with support for figures, tables, math equations, and citations
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

  return (
    <div className="p-4 shadow-lg rounded-lg bg-gray-100 relative">
      <div className="flex items-center gap-150 mb-4">
        <h2 className="text-2xl font-bold mr-6">Full Document</h2>
        <div className="flex space-x-1">
          {/* Word Export Button */}
          <button
            onClick={() => handleExportWord(structure, nodeContents)}
            className="group p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
            title="Download it as a Word document"
          >
            <img
              src={word}
              className="h-14 w-14 transform transition-transform duration-200 group-hover:scale-105"
            />
          </button>
          {/* PDF Export Button */}
          <button
            onClick={() => handleExportPDF(structure, nodeContents)}
            className="group p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
            title="Download it as a PDF file"
          >
            <img
              src={pdf}
              className="h-14 w-14 transform transition-transform duration-200 group-hover:scale-105"
            />
          </button>
          {/* LaTeX Export Button */}
          <button
            onClick={() => handleExportLATEX(structure, nodeContents)}
            className="group p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
            title="Download it as a LaTeX document"
          >
            <img
              src={latex}
              className="h-14 w-14 transform transition-transform duration-200 group-hover:scale-105"
            />
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
