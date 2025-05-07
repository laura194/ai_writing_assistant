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
                console.error("Error loading node content JSON:", error)
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
            {/* Button zum Öffnen/Schließen des Menüs */}
            <button
                className="absolute top-1 left-1 bg-gray-600 hover:bg-gray-500 p-2 rounded"
                onClick={() => setMenuOpen(!menuOpen)}
            >
                <Bars3Icon className="h-5 w-5 text-white" />
            </button>

            {/* Menüansicht */}
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