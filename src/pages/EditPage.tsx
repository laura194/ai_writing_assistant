import { useEffect, useState } from "react";
import Folder from "../components/Folder";
import { Node } from "../utils/types";

const EditPage = () => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [currentNode, setCurrentNode] = useState<Node | null>(null);

    // Funktion: Laden der Baumstruktur
    useEffect(() => {
        const selectedStructure = localStorage.getItem("selectedStructure");

        let structurePath = "/data/custom.json";
        if (selectedStructure === "imrad") structurePath = "/data/imrad.json";
        if (selectedStructure === "design") structurePath = "/data/design.json";

        fetch(structurePath)
            .then((response) => response.json())
            .then((data: Node[]) =>
                setNodes(
                    data.map((node) => ({
                        ...node,
                        nodes: node.nodes || [],
                    }))
                )
            )
            .catch((error) => console.error("Error loading structure JSON:", error));
    }, []);

    // Funktion: Kapitel auswählen
    const handleNodeClick = (node: Node) => {
        setCurrentNode(node);
    };

    // Funktion: Kapitel bearbeiten
    const handleEditNode = (updatedNode: Node) => {
        const updateNodes = (nodes: Node[]): Node[] =>
            nodes.map((node) =>
                node.id === updatedNode.id
                    ? { ...node, name: updatedNode.name }
                    : { ...node, nodes: node.nodes ? updateNodes(node.nodes) : [] }
            );

        setNodes(updateNodes(nodes));
    };

    // Funktion: Kapitel löschen
    const handleDeleteNode = (nodeId: string) => {
        const deleteNode = (nodes: Node[]): Node[] =>
            nodes
                .filter((node) => node.id !== nodeId)
                .map((node) => ({
                    ...node,
                    nodes: node.nodes ? deleteNode(node.nodes) : [],
                }));

        setNodes(deleteNode(nodes));
        if (currentNode?.id === nodeId) {
            setCurrentNode(null);
        }
    };

    // Funktion: Neues Kapitel hinzufügen
    const handleAddNode = (parentNodeId: string | null) => {
        const addNode = (nodes: Node[]): Node[] => {
            if (parentNodeId === null) {
                // Neues Kapitel auf der obersten Ebene hinzufügen
                return [
                    ...nodes,
                    {
                        id: Date.now().toString(), // Eindeutige ID generieren
                        name: "New Chapter",
                        nodes: [],
                    },
                ];
            }

            // Kapitel an das richtige übergeordnete Kapitel anhängen
            return nodes.map((node) =>
                node.id === parentNodeId
                    ? {
                        ...node,
                        nodes: [
                            ...(node.nodes || []), // Absicherung für undefined
                            {
                                id: Date.now().toString(),
                                name: "New Subchapter",
                                nodes: [],
                            },
                        ],
                    }
                    : { ...node, nodes: addNode(node.nodes || []) } // Absicherung für undefined
            );
        };

        setNodes((prevNodes) => addNode(prevNodes));
    };

    return (
        <div className="flex">
            {/* Sidebar: Kapitelstruktur */}
            <aside className="w-1/4 bg-gray-200 p-4 overflow-y-auto">
                <h2 className="text-lg font-bold mb-4">Chapter Structure</h2>
                <button
                    onClick={() => handleAddNode(null)}
                    className="mb-4 bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500"
                >
                    Add New Chapter
                </button>
                <ul>
                    {nodes.map((node) => (
                        <Folder
                            key={node.id}
                            node={node}
                            onNodeClick={handleNodeClick}
                            onDeleteNode={handleDeleteNode}
                            onEditNode={handleEditNode}
                        />
                    ))}
                </ul>
            </aside>

            {/* Hauptbereich: Aktuelles Kapitel */}
            <main className="flex-1 p-4">
                {currentNode ? (
                    <>
                        <h1 className="text-2xl font-bold mb-4">{currentNode.name}</h1>
                        <button
                            onClick={() => handleAddNode(currentNode.id)}
                            className="mb-4 bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500"
                        >
                            Add Subchapter to "{currentNode.name}"
                        </button>
                        <p>You can add content or edit this chapter!</p>
                    </>
                ) : (
                    <p>Select a chapter to view or edit its details.</p>
                )}
            </main>
        </div>
    );
};

export default EditPage;