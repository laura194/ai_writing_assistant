/*
* chat gpt
*
import "../App.css";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { Node } from "../utils/types";  // Importieren Sie den Typ hier

const EditPage = () => {
    const location = useLocation();
    const [structure, setStructure] = useState<Node[]>(location.state?.structure || []);

    const addChapter = () => {
        const newChapter: Node = { id: Date.now().toString(), title: "New Chapter", content: "" };
        setStructure([...structure, newChapter]);
    };

    const deleteChapter = (id: string) => {
        setStructure(structure.filter((chapter: Node) => chapter.id !== id));
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Edit Page</h1>
            <ul>
                {structure.map((chapter: Node) => (
                    <li key={chapter.id} className="mb-2">
                        <input
                            type="text"
                            value={chapter.title}
                            onChange={(e) =>
                                setStructure(
                                    structure.map((ch) =>
                                        ch.id === chapter.id
                                            ? { ...ch, title: e.target.value }
                                            : ch
                                    )
                                )
                            }
                            className="border border-gray-300 rounded px-2 py-1"
                        />
                        <button
                            onClick={() => deleteChapter(chapter.id)}
                            className="ml-2 text-red-600"
                        >
                            Löschen
                        </button>
                    </li>
                ))}
            </ul>
            <button
                onClick={addChapter}
                className="bg-blue-500 text-white py-2 px-4 mt-4 rounded"
            >
                Kapitel hinzufügen
            </button>
        </div>
    );
};

export default EditPage;
 */
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../App.css";
import Folder from "../components/Folder";
import FileContentCard from "../components/FileContentCard";
import { Bars3Icon } from "@heroicons/react/24/solid";
import { Node } from "../utils/types";
import HelloMessage from "../components/HelloMessage";
import HelloApp from "../components/HelloApp";

const EditPage = () => {
    const location = useLocation();
    const { type } = location.state || { type: null }; // Welcher Typ wurde gewählt: "imrad", "design" oder "scratch"

    const [nodes, setNodes] = useState<Node[]>([]); // Dynamische Kapitelstruktur
    const [nodeContents, setNodeContents] = useState<Node[]>([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [menuOpen, setMenuOpen] = useState<boolean>(() => {
        const savedMenuOpen = localStorage.getItem("menuOpen");
        return savedMenuOpen ? JSON.parse(savedMenuOpen) : true;
    });

    // JSON-Datei basierend auf der Benutzerauswahl laden
    useEffect(() => {
        if (!type) {
            console.error("No structure type provided!"); // Falls keine Auswahl getroffen wurde
            return;
        }

        // Mappe die Typen auf die entsprechenden JSON-Dateien
        const jsonMap: { [key: string]: string } = {
            imrad: "/imrad.json",
            design: "/design.json",
            scratch: "/scratch.json",
        };

        const jsonFile = jsonMap[type];

        fetch(jsonFile)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${jsonFile}`);
                }
                return response.json();
            })
            .then((data: Node[]) => {
                setNodes(data); // Die geladene Struktur in den Zustand setzen
            })
            .catch((error) => console.error("Error loading structure JSON:", error));
    }, [type]);

    // Datei-Inhaltsdaten laden (falls benötigt - optional)
    useEffect(() => {
        fetch("/fileContent.json")
            .then((response) => response.json())
            .then((data: Node[]) => setNodeContents(data))
            .catch((error) =>
                console.error("Error loading file content JSON:", error),
            );
    }, []);

    useEffect(() => {
        localStorage.setItem("menuOpen", JSON.stringify(menuOpen));
    }, [menuOpen]);

    // Funktionen für die Bearbeitung der Struktur
    const addNode = (parentId: string | null = null) => {
        const newNode: Node = {
            id: `${Date.now()}`,
            name: "Neues Kapitel",
            children: [],
        };

        setNodes((prevNodes) => {
            if (!parentId) {
                return [...prevNodes, newNode]; // Neues Kapitel auf oberster Ebene
            }

            const updateNodes = (nodes: Node[]): Node[] => {
                return nodes.map((node) =>
                    node.id === parentId
                        ? { ...node, children: [...(node.children || []), newNode] }
                        : { ...node, children: node.children ? updateNodes(node.children) : [] },
                );
            };

            return updateNodes(prevNodes);
        });
    };

    const deleteNode = (nodeId: string) => {
        const removeNode = (nodes: Node[]): Node[] => {
            return nodes
                .filter((node) => node.id !== nodeId)
                .map((node) => ({
                    ...node,
                    children: node.children ? removeNode(node.children) : [],
                }));
        };

        setNodes((prevNodes) => removeNode(prevNodes));
    };

    const renameNode = (nodeId: string, newName: string) => {
        const updateNodeName = (nodes: Node[]): Node[] => {
            return nodes.map((node) =>
                node.id === nodeId
                    ? { ...node, name: newName }
                    : { ...node, children: node.children ? updateNodeName(node.children) : [] },
            );
        };

        setNodes((prevNodes) => updateNodeName(prevNodes));
    };

    const handleNodeClick = (node: Node) => {
        const content = nodeContents.find((item) => item.id === node.id);
        setSelectedNode(content || null);
        localStorage.setItem("selectedNodeId", node.id);
    };

    return (
        <div className="flex h-screen relative">
            {/* Menü-Button */}
            <button
                className="absolute top-1 left-1 bg-gray-600 hover:bg-gray-500 p-2 rounded"
                onClick={() => setMenuOpen(!menuOpen)}
            >
                <Bars3Icon className="h-5 w-5 text-white" />
            </button>

            {/* Seitenleiste */}
            <div
                className={`${
                    menuOpen ? "w-1/4" : "w-12"
                } transition-all duration-300 overflow-hidden bg-gray-200 text-black p-4`}
            >
                {menuOpen && (
                    <ul>
                        <li className="my-1.5">
                            <ul className="pl-10">
                                {nodes.map((node) => (
                                    <Folder
                                        node={node}
                                        key={node.id}
                                        onNodeClick={handleNodeClick}
                                        onDelete={deleteNode}
                                        onRename={renameNode}
                                        onAddChild={addNode}
                                    />
                                ))}
                            </ul>
                        </li>
                    </ul>
                )}
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => addNode()} // Neues Kapitel auf oberster Ebene hinzufügen
                >
                    Kapitel hinzufügen
                </button>
                <HelloMessage />
                <HelloApp />
            </div>

            {/* Hauptinhalt */}
            <div
                className={`${
                    menuOpen ? "w-3/4" : "w-full"
                } transition-all duration-300 p-4 bg-gray-400`}
            >
                {selectedNode ? (
                    <FileContentCard node={selectedNode} />
                ) : (
                    <p>Wähle ein Element aus.</p>
                )}
            </div>
        </div>
    );
};

export default EditPage;

/*
* funktionierend von laura
*
import { useState, useEffect } from "react";
import "../App.css";
import Folder from "../components/Folder";
import FileContentCard from "../components/FileContentCard";
import { Bars3Icon } from "@heroicons/react/24/solid";
import { Node } from "../utils/types";
import HelloMessage from "../components/HelloMessage";
import HelloApp from "../components/HelloApp";

const EditPage = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [nodeContents, setNodeContents] = useState<Node[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(() => {
    const savedMenuOpen = localStorage.getItem("menuOpen");
    return savedMenuOpen ? JSON.parse(savedMenuOpen) : true;
  });

  useEffect(() => {
    // Lade die Projektstruktur
    fetch("/projectStructure.json")
      .then((response) => response.json())
      .then((data: Node[]) => setNodes(data))
      .catch((error) => console.error("Error loading JSON:", error));

    // Lade den Dateiinhalt
    fetch("/fileContent.json")
      .then((response) => response.json())
      .then((data: Node[]) => {
        setNodeContents(data);

        const savedNodeId = localStorage.getItem("selectedNodeId");
        if (savedNodeId) {
          const savedNode = data.find((item) => item.id === savedNodeId);
          if (savedNode) {
            setSelectedNode(savedNode);
          }
        }
      })
      .catch((error) =>
        console.error("Error loading node content JSON:", error),
      );
  }, []);

  useEffect(() => {
    localStorage.setItem("menuOpen", JSON.stringify(menuOpen));
  }, [menuOpen]);

  const handleNodeClick = (node: Node) => {
    const content = nodeContents.find((item) => item.id === node.id);
    setSelectedNode(content || null);
    localStorage.setItem("selectedNodeId", node.id);
  };

  return (
    <div className="flex h-screen relative">
      {}
      <button
        className="absolute top-1 left-1 bg-gray-600 hover:bg-gray-500 p-2 rounded"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <Bars3Icon className="h-5 w-5 text-white" />
      </button>

      {}
      <div
        className={`${
          menuOpen ? "w-1/4" : "w-12"
        } transition-all duration-300 overflow-hidden bg-gray-200 text-black p-4`}
      >
        {menuOpen && (
          <ul>
            <li className="my-1.5">
              <ul className="pl-10">
                {nodes.map((node) => (
                  <Folder
                    node={node}
                    key={node.id}
                    onNodeClick={handleNodeClick}
                  />
                ))}
              </ul>
            </li>
          </ul>
        )}
        <HelloMessage />
        <HelloApp />
      </div>

      {}
      <div
        className={`${
          menuOpen ? "w-3/4" : "w-full"
        } transition-all duration-300 p-4 bg-gray-400`}
      >
        {selectedNode ? (
          <FileContentCard node={selectedNode} />
        ) : (
          <p>Wähle ein Element aus.</p>
        )}
      </div>
    </div>
  );
};

export default EditPage;
 */