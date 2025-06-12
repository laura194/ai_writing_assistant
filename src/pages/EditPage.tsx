import { useState, useEffect } from "react";

// Importieren von Komponenten
import Folder from "../components/Folder"; // Baumstruktur im Sidebar
import FileContentCard from "../components/FileContentCard"; // Hauptinhalt bei Auswahl
import { Bars3Icon } from "@heroicons/react/24/solid"; // Icon für das Menü
import BottomNavigationBar from "../components/BottomNavigationBar"; // Navigationsleiste unten
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

  // Aktuelle Ansicht unten
  const [activeView, setActiveView] = useState<string>("ai");

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
          <div className={`${menuOpen ? "w-1/4" : "w-12"} bg-gray-200 p-4 transition-all duration-300`}>
            <button
                className="bg-blue-500 text-white p-2 rounded mb-4"
                onClick={() => setMenuOpen(!menuOpen)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <ul>
              {nodes.map((node) => (
                  <Folder
                      key={node.id}
                      node={node}
                      onNodeClick={handleNodeClick}
                      onAdd={addChapter}
                      onRemove={deleteChapter}
                  />
              ))}
            </ul>
          </div>

          {/* Inhalt (rechte Seite) */}
          <div className="flex-1 p-4 bg-white shadow-inner">
            {selectedNode ? (
                <FileContentCard
                    node={selectedNode}
                    onUpdate={(updatedNode) => {
                      updateChapter(updatedNode);
                      setSelectedNode(updatedNode);
                    }}
                />
            ) : (
                <p>Wähle ein Kapitel zum Bearbeiten aus.</p>
            )}
          </div>
        </div>

        {/* Untere Navigationsleiste */}
        <BottomNavigationBar
            activeView={activeView}
            menuOpen={menuOpen}
            onChangeView={setActiveView}
        />
      </div>
  );
};

export default EditPage;
