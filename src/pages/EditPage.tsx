import { useState, useEffect } from "react";
import Folder from "../components/Folder";
import FileContentCard from "../components/FileContentCard";
import { Bars3Icon } from "@heroicons/react/24/solid";
import BottomNavigationBar from "../components/BottomNavigationBar";
import Header from "../components/Header";
import { Node } from "../utils/types";

const EditPage = () => {
  const [nodes, setNodes] = useState<Node[]>([]); // Kapitelstruktur
  const [selectedNode, setSelectedNode] = useState<Node | null>(null); // Aktuell ausgewählter Knoten
  const [menuOpen, setMenuOpen] = useState(() => {
    const savedMenuState = localStorage.getItem("menuOpen");
    return savedMenuState ? JSON.parse(savedMenuState) : true;
  });
  const [activeView, setActiveView] = useState<string>("ai");

  // Kapitelstruktur laden
  useEffect(() => {
    fetch("/projectStructure.json")
        .then((res) => res.json())
        .then((data: Node[]) => setNodes(data))
        .catch((err) => console.error("Fehler beim Laden der Kapitelstruktur", err));
  }, []);

  // Menüstatus speichern
  useEffect(() => {
    localStorage.setItem("menuOpen", JSON.stringify(menuOpen));
  }, [menuOpen]);

  // Kapitel hinzufügen
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

  return (
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex flex-grow relative">
          {/* Left Sidebar */}
          <div
              className={`${
                  menuOpen ? "w-1/4" : "w-12"
              } bg-gray-200 p-4 transition-all duration-300`}
          >
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
                      onNodeClick={setSelectedNode}
                      onAdd={addChapter}
                      onRemove={deleteChapter}
                  />
              ))}
            </ul>
          </div>

          {/* Content Section */}
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

        {/* Bottom Navigation */}
        <BottomNavigationBar
            activeView={activeView}
            menuOpen={menuOpen}
            onChangeView={setActiveView}
        />
      </div>
  );
};

export default EditPage;