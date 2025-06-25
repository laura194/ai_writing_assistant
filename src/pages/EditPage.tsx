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
import ScratchStructure from "../assets/projectStructure.json"; // Leere Struktur als Basis

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
      <DndProvider backend={HTML5Backend}>
        <div className="h-screen flex flex-col">
          <Header />
          <div className="flex flex-grow relative">
            <div
                className={`relative ${
                    menuOpen ? "w-1/4" : "w-12"
                } bg-gray-200 h-full transition-all duration-300 z-10 flex-shrink-0`}
            >
              <button
                  className="absolute top-5 left-4 bg-blue-500 text-white p-2 rounded z-20"
                  onClick={() => setMenuOpen(!menuOpen)}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <ul
                  className={`transition-all duration-300 mt-14 pl-4 ${
                      menuOpen ? "opacity-100 max-h-screen" : "opacity-0 max-h-0"
                  } overflow-hidden`}
              >
                {nodes.map((node) => (
                    <Folder
                        key={node.id}
                        node={node}
                        onMove={handleMoveNode}
                        onNodeClick={updateChapter} // Direkter Aufruf der Funktion
                        onAdd={addChapter}
                        onRemove={deleteChapter}
                        isVisible={menuOpen}
                    />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </DndProvider>
  );
};

export default EditPage;