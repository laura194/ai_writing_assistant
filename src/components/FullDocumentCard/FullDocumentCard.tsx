import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ProjectService } from "../../utils/ProjectService";
import { NodeContentService } from "../../utils/NodeContentService";
import {
  handleExportWord,
  handleExportPDF,
  handleExportLATEX,
} from "../../utils/DocumentExporters";
import word from "/src/assets/images/full-document-page/word.jpg";
import pdf from "/src/assets/images/full-document-page/pdf.jpg";
import latex from "/src/assets/images/full-document-page/latex.png";
import { motion } from "framer-motion";
import { useTheme } from "../../providers/ThemeProvider";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
          projectId
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
              ? "text-2xl font-bold mt-6 text-[#261e3b] dark:text-white"
              : depth === 2
                ? "text-xl font-semibold mt-4 text-[#261e3b] dark:text-white"
                : "text-lg mt-3 text-[#261e3b] dark:text-white";

          const heading = `<${headingTag} class="${headingClass}">${node.name}</${headingTag}>`;
          const content = contentEntry?.content
            ? `<p class="whitespace-pre-line mt-2 mb-4 text-gray-600 dark:text-gray-200">${escapeHtml(contentEntry.content)}</p>`
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
    <div className="relative flex flex-col h-full p-6 rounded-3xl bg-[#e9e5f8] dark:bg-[#1e1538]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold inline-block tracking-wide">
          {/* Gradient-Text */}
          <span className="text-[#261e3b] dark:text-[#ffffff]">
            Full Document Overview
          </span>
          <span className="block h-1 w-full mt-1.5 bg-gradient-to-r from-purple-500 via-pink-400 to-yellow-300 rounded-full" />
        </h2>
        <div className="flex space-x-5">
          {/** Gradient-Border um die Buttons wie im FileContentCard **/}
          {[
            {
              onClick: () => handleExportWord(structure, nodeContents),
              src: word,
              alt: "Word",
            },
            {
              onClick: () => handleExportPDF(structure, nodeContents),
              src: pdf,
              alt: "PDF",
            },
            {
              onClick: () => handleExportLATEX(structure, nodeContents),
              src: latex,
              alt: "LaTeX",
            },
          ].map((btn, i) => (
            <motion.div
              whileHover={{
                scale: 1.075,
                boxShadow: isDark
                  ? "0 0 20px rgba(120,69,239,0.4)"
                  : "0 0 14px rgba(120,69,239,0.6)",
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.95 }}
              key={i}
              className="p-[3px] rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-yellow-300 transition-shadow duration-20"
            >
              <button
                onClick={btn.onClick}
                className="bg-[#e1dcf8] dark:bg-[#2f214d] p-2 rounded-lg shadow-inner shadow-purple-600/50 dark:shadow-purple-700/70 hover:shadow-purple-600/60 dark:hover:shadow-purple-500/75 transition cursor-pointer"
                title={`Export as ${btn.alt}`}
              >
                <img src={btn.src} alt={btn.alt} className="w-12 h-12" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-700 dark:text-gray-400">
          Loading…
        </div>
      ) : error ? (
        <div className="text-red-500 dark:text-red-400">{error}</div>
      ) : (
        <div
          ref={containerRef}
          className="overflow-y-auto border-t-2 border-[#beb5e4] dark:border-[#3e316e]"
        />
      )}
    </div>
  );
};

export default FullDocumentCard;
