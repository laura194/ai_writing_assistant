import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom"; // Importieren
import "./App.css";
import Folder from "./components/Folder";
import FileContentCard from "./components/FileContentCard";
import { Bars3Icon } from "@heroicons/react/24/solid";
import { Node } from "./utils/types";

function App() {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [nodeContents, setNodeContents] = useState<Node[]>([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [menuOpen, setMenuOpen] = useState<boolean>(true);

    const [searchParams] = useSearchParams();
    const projectType = searchParams.get("type"); // Liest "type" aus der URL

    useEffect(() => {
        let structureFile = "/defaultProjectStructure.json"; // Fallback
        if (projectType === "structure1") structureFile = "/structure1.json";
        if (projectType === "structure2") structureFile = "/structure2.json";
        if (projectType === "empty") structureFile = "/empty.json";

        fetch(structureFile)
            .then((response) => response.json())
            .then((data: Node[]) => setNodes(data))
            .catch((error) => console.error("Error loading JSON:", error));

        fetch("/fileContent.json")
            .then((response) => response.json())
            .then((data: Node[]) => setNodeContents(data))
            .catch((error) =>
                console.error("Error loading node content JSON:", error)
            );
    }, [projectType]);

    const handleNodeClick = (node: Node) => {
        const content = nodeContents.find((item) => item.id === node.id);
        setSelectedNode(content || null);
    };

    return (
        <div className="flex h-screen relative">
            <button
                className="absolute top-1 left-1 bg-gray-600 hover:bg-gray-500 p-2 rounded"
                onClick={() => setMenuOpen(!menuOpen)}
            >
                <Bars3Icon className="h-5 w-5 text-white" />
            </button>

            <div className={`${menuOpen ? "w-1/4" : "w-12"} transition-all bg-gray-200 p-4`}>
                {menuOpen && (
                    <ul>
                        {nodes.map((node) => (
                            <Folder node={node} key={node.id} onNodeClick={handleNodeClick} />
                        ))}
                    </ul>
                )}
            </div>

            <div className={`${menuOpen ? "w-3/4" : "w-full"} transition-all p-4 bg-gray-400`}>
                {selectedNode ? <FileContentCard node={selectedNode} /> : <p>Wähle ein Element aus.</p>}
            </div>
        </div>
    );
}

export default App;
