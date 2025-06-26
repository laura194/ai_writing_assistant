import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Folder from "../components/Folder";
import Header from "../components/Header";
import { Node } from "../utils/types";
import { Bars3Icon } from "@heroicons/react/24/solid";

import { useLocation } from "react-router-dom"; // Für die Daten von StructureSelectionPage
import ImradStructure from "../assets/imrad.json";
import DesignStructure from "../assets/storyForDesign.json";
import ScratchStructure from "../assets/projectStructure.json";
import FileContentCard from "../components/FileContentCard.tsx"; // Leere Struktur als Basis

const EditPage = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [menuOpen, setMenuOpen] = useState(() => {
    const savedMenuState = localStorage.getItem("menuOpen");
    return savedMenuState ? JSON.parse(savedMenuState) : true;
  });

  const location = useLocation();
  const structureType = location.state?.structureType || "scratch"; // StrukturTyp auslesen oder Standard "scratch"

  useEffect(() => {
    // Lade die richtige Struktur basierend auf structureType
    if (structureType === "explanation") {
      setNodes(ImradStructure); // IMRaD-Struktur laden
    } else if (structureType === "design") {
      setNodes(DesignStructure); // Design-Struktur laden
    } else if (structureType === "scratch") {
      setNodes(ScratchStructure); // Leere Struktur laden
    }
  }, [structureType]);

  useEffect(() => {
    localStorage.setItem("menuOpen", JSON.stringify(menuOpen));
  }, [menuOpen]);

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
  };

  const addChapter = (parentId: string | null, newNode: Node) => {
    const recursiveAdd = (nodes: Node[]): Node[] => {
      return nodes.map((node) => {
        if (node.id === parentId) {
          return {
            ...node,
            nodes: [...(node.nodes || []), newNode],
          };
        }
        if (node.nodes) {
          return { ...node, nodes: recursiveAdd(node.nodes) };
        }
        return node;
      });
    };

    if (parentId) {
      setNodes((prev) => recursiveAdd(prev));
    } else {
      setNodes((prev) => [...prev, newNode]);
    }
  };

  const updateChapter = (updatedNode: Node) => {
    const recursiveUpdate = (nodes: Node[]): Node[] => {
      return nodes.map((node) => {
        if (node.id === updatedNode.id) {
          return updatedNode;
        }
        if (node.nodes) {
          return { ...node, nodes: recursiveUpdate(node.nodes) };
        }
        return node;
      });
    };

    setNodes((prev) => recursiveUpdate(prev));
  };

  const deleteChapter = (nodeId: string) => {
    const recursiveDelete = (nodes: Node[]): Node[] => {
      return nodes
          .filter((node) => node.id !== nodeId)
          .map((node) => ({
            ...node,
            nodes: recursiveDelete(node.nodes || []),
          }));
    };

    setNodes((prev) => recursiveDelete(prev));
  };

  const handleMoveNode = (draggedNodeId: string, targetNodeId: string | null = null) => {
    let draggedNode: Node | null = null;

    const recursiveRemove = (nodes: Node[]): Node[] => {
      return nodes
          .filter((node) => {
            if (node.id === draggedNodeId) {
              draggedNode = node;
              return false;
            }
            return true;
          })
          .map((node) => ({ ...node, nodes: recursiveRemove(node.nodes || []) }));
    };

    const recursiveAdd = (nodes: Node[]): Node[] => {
      return nodes.map((node) => {
        if (node.id === targetNodeId) {
          return {
            ...node,
            nodes: [...(node.nodes || []), draggedNode!],
          };
        }
        return { ...node, nodes: recursiveAdd(node.nodes || []) };
      });
    };

    setNodes((prevNodes) => {
      const withoutDraggedNode = recursiveRemove(prevNodes); // Entfernen

      // Fallback: Wenn kein Ziel gefunden, füge das Kapitel in die Wurzelebene ein
      if (!draggedNode || !targetNodeId) {
        return [...withoutDraggedNode, draggedNode!];
      }

      // Hinzufügen: Konstante updatedStructure kann für Speicherung in DB genutzt werden
      const updatedStructure = recursiveAdd(withoutDraggedNode);
      return updatedStructure;
    });
  };

  return (
      <div className="flex flex-col h-screen">
        {/* Header */}
        <Header />

        {/* Hauptbereich */}
        <div className="flex flex-1 overflow-hidden">
          {/* Seitenleiste */}
          <div
              className={`transition-all duration-300 ${
                  menuOpen ? "w-96" : "w-20"
              } flex-shrink-0 h-full border-r overflow-y-auto`}
          >
            <div className="flex items-center justify-start px-4 py-3 bg-gray-100 border-b">
              <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="focus:outline-none p-2 rounded hover:bg-gray-200"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              <span className={`transition-all ${menuOpen ? "opacity-100" : "opacity-0"} font-semibold`}>
            Kapitelstruktur
          </span>
            </div>
            <DndProvider backend={HTML5Backend}>
              <ul className="p-2">
                {nodes.map((node) => (
                    <Folder
                        key={node.id}
                        node={node}
                        onMove={handleMoveNode}
                        onNodeClick={handleNodeClick} // Hier das Callback für den Klick
                        onAdd={addChapter}
                        onRemove={deleteChapter}
                        isVisible={menuOpen}
                    />
                ))}
              </ul>
            </DndProvider>
          </div>

          {/* Hauptinhalt */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedNode ? (
                <FileContentCard
                    node={selectedNode}
                    onUpdate={updateChapter}
                />
            ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Wähle ein Kapitel aus, um Inhalte zu bearbeiten.</p>
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default EditPage;