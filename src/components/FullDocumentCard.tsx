import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom"; // Importiere useParams
import { ProjectService } from "../utils/ProjectService"; // Importiere den ProjectService
import { NodeContentService } from "../utils/NodeContentService";

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

  return (
    <div className="p-4 shadow-lg rounded-lg bg-gray-100 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Full Document</h2>
        <button
          onClick={() =>
            alert("Here you could export the document as a Word file.")
          }
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Word // TODO Export as word and PDF and LaTeX functions with buttons
        </button>
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
