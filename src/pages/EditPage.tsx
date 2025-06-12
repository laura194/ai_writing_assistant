import { useState, useEffect } from "react";

// Importieren von Komponenten
import Folder from "../components/Folder"; // Baumstruktur im Sidebar
import FileContentCard from "../components/FileContentCard"; // Hauptinhalt bei Auswahl
import { Bars3Icon } from "@heroicons/react/24/solid"; // Icon für das Menü
import Header from "../components/Header"; // Kopfzeile oben

import { Node } from "../utils/types"; // Datentyp für Knotenstruktur

const EditPage = () => {
  // State für die Kapitelstruktur
  const [nodes, setNodes] = useState<Node[]>([]);

  // State für das aktuell ausgewählte Kapitel
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Sidebar Menüstatus (offen/zu)
  const [menuOpen, setMenuOpen] = useState(() => {
    const savedMenuState = localStorage.getItem("menuOpen");
    return savedMenuState ? JSON.parse(savedMenuState) : true;
  });

  // Lade die Kapitelstruktur bei Erstaufruf
  useEffect(() => {
    fetch("/projectStructure.json")
        .then((res) => res.json())
        .then((data: Node[]) => setNodes(data))
        .catch((err) =>
            console.error("Fehler beim Laden der Kapitelstruktur", err)
        );
  }, []);

  // Speichere den Menüstatus bei Änderungen
  useEffect(() => {
    localStorage.setItem("menuOpen", JSON.stringify(menuOpen));
  }, [menuOpen]);

  // Funktion zum Hinzufügen eines Kapitels
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

  const handleNodeClick = (updatedNode: Node) => {
    setSelectedNode(updatedNode); // Aktualisiert den ausgewählten Node
    updateChapter(updatedNode); // Speichert Änderungen in nodes
  };

  // Kapitel aktualisieren
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

  // Kapitel löschen
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

  // JSX-Struktur der Seite
  return (
      <div className="h-screen flex flex-col">
        {/* Header-Komponente oben */}
        <Header />

        {/* Hauptbereich */}
        <div className="flex flex-grow relative">
          {/* Sidebar mit Folder-Komponente */}
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
            {/* Füge hier Abstand nach unten hinzu, damit die Kapitelstruktur nicht höher als der Button ist */}
            <ul
                className={`transition-all duration-300 mt-14 pl-4 ${
                    menuOpen ? "opacity-100 max-h-screen" : "opacity-0 max-h-0"
                } overflow-hidden`}
            >
              {nodes.map((node) => (
                  <Folder
                      key={node.id}
                      node={node}
                      onNodeClick={handleNodeClick}
                      onAdd={addChapter}
                      onRemove={deleteChapter}
                      isVisible={menuOpen} // Sichtbarkeit hängt vom Status der Sidebar ab
                  />
              ))}
            </ul>
          </div>

          {/* Hauptinhalt mit FileContentCard */}
          <div className="flex-grow relative z-0 transition-all duration-300 ml-2">
            {selectedNode ? (
                <FileContentCard
                    node={selectedNode}
                    onUpdate={(updatedNode) => updateChapter(updatedNode)}
                />
            ) : (
                <p className="text-center mt-4">Wählen Sie ein Kapitel aus</p>
            )}
          </div>
        </div>
      </div>
  );
};

export default EditPage;