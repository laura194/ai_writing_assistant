import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../App.css";
import Folder from "../components/Folder";
import FileContentCard from "../components/FileContentCard";
import { Bars3Icon } from "@heroicons/react/24/solid";
import { Node } from "../utils/types";
import HelloMessage from "../components/HelloMessage";
import HelloApp from "../components/HelloApp";

const EditPage = () => {
    const [childrenNodes, setChildrenNodes] = useState<Node[]>([]); // Ordner und Dateien aus der JSON-Struktur
    const [nodeContents, setNodeContents] = useState<Node[]>([]); // Inhalte der Dateien
    const [selectedNode, setSelectedNode] = useState<Node | null>(null); // Aktueller ausgewählter Knoten
    const [menuOpen, setMenuOpen] = useState<boolean>(() => {
        const savedMenuOpen = localStorage.getItem("menuOpen");
        return savedMenuOpen ? JSON.parse(savedMenuOpen) : true;
    });

    const [searchParams] = useSearchParams();
    const projectType = searchParams.get("type");

    // JSON struktur laden und verarbeiten
    useEffect(() => {
        let structureFile = "/projectStructure.json";
        if (projectType === "structure1") structureFile = "/structure1.json";
        else if (projectType === "structure2") structureFile = "/structure2.json";
        else if (projectType === "custom") structureFile = "/empty.json";

        fetch(structureFile)
            .then((response) => response.json())
            .then((data: Node | null) => {
                if (data) {
                    if (data.children) {
                        setChildrenNodes(data.children); // Verwende die `children` des Root-Knotens
                    } else {
                        setChildrenNodes([data]); // Falls keine `children`, füge den Root-Knoten selbst ein
                    }
                } else {
                    console.error("Fehler: Die Struktur ist leer."); // Debug-Fallback
                    setChildrenNodes([]);
                }
            })
            .catch((error) => console.error("Error loading structure JSON:", error));
    }, [projectType]);

    // Laden der vorherigen Auswahl (falls vorhanden)
    useEffect(() => {
        const savedNodeId = localStorage.getItem("selectedNodeId");
        if (savedNodeId) {
            const savedNode = nodeContents.find((item) => item.id === savedNodeId);
            if (savedNode) {
                setSelectedNode(savedNode);
            }
        }
    }, [nodeContents]);

    // Menüstatus in localStorage speichern
    useEffect(() => {
        localStorage.setItem("menuOpen", JSON.stringify(menuOpen));
    }, [menuOpen]);

    // Klick auf Datei oder Ordner
    const handleNodeClick = (node: Node) => {
        const content = nodeContents.find((item) => item.id === node.id) || node;
        if (content) {
            setSelectedNode(content);
            localStorage.setItem("selectedNodeId", node.id);
        }
    };

    // Inhalt von Dateien ändern
    const handleContentChange = (updatedNode: Node) => {
        const updatedContents = nodeContents.map((node) =>
            node.id === updatedNode.id ? updatedNode : node
        );
        setNodeContents(updatedContents);
        localStorage.setItem("nodeContents", JSON.stringify(updatedContents));
        if (selectedNode?.id === updatedNode.id) {
            setSelectedNode(updatedNode);
        }
    };

    return (
        <div className="flex h-screen relative">
            {/* Menüöffnungs-/Schließ-Button */}
            <button
                className="absolute top-1 left-1 bg-gray-600 hover:bg-gray-500 p-2 rounded"
                onClick={() => setMenuOpen(!menuOpen)}
            >
                <Bars3Icon className="h-5 w-5 text-white" />
            </button>

            {/* Seitenmenü */}
            <div
                className={`${menuOpen ? "w-1/4" : "w-12"} transition-all duration-300 overflow-hidden bg-gray-200 text-black p-4`}
            >
                {menuOpen && (
                    <ul>
                        <li className="my-1.5">
                            <ul className="pl-10">
                                {childrenNodes.map((node) => (
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

            {/* Hauptinhalt */}
            <div
                className={`${menuOpen ? "w-3/4" : "w-full"} transition-all duration-300 p-4 bg-gray-400`}
            >
                {selectedNode ? (
                    <FileContentCard
                        node={selectedNode}
                        onContentChange={handleContentChange}
                    />
                ) : (
                    <p>Wähle ein Element aus.</p>
                )}
            </div>
        </div>
    );
};

export default EditPage;