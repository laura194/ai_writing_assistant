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
    const handleAddNode = (parentNodeId: string | null, position: number | null) => {
        const addNode = (nodes: Node[]): Node[] => {
            if (parentNodeId === null) {
                // Neues Kapitel auf der obersten Ebene an einer bestimmten Position einfügen
                const newNode = {
                    id: Date.now().toString(),
                    name: "New Chapter",
                    nodes: [],
                };

                if (position === null || position >= nodes.length) {
                    // An das Ende einfügen
                    return [...nodes, newNode];
                }

                // An der gewünschten Position einfügen
                return [...nodes.slice(0, position), newNode, ...nodes.slice(position)];
            }

            // Unterkapitel an der richtigen Position hinzufügen
            return nodes.map((node) =>
                node.id === parentNodeId
                    ? {
                        ...node,
                        nodes: (() => {
                            const newNode = {
                                id: Date.now().toString(),
                                name: "New Subchapter",
                                nodes: [],
                            };
                            if (position === null || position >= (node.nodes || []).length) {
                                return [...(node.nodes || []), newNode];
                            }
                            return [
                                ...(node.nodes || []).slice(0, position),
                                newNode,
                                ...(node.nodes || []).slice(position),
                            ];
                        })(),
                    }
                    : { ...node, nodes: addNode(node.nodes || []) }
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
                    onClick={() => handleAddNode(null, null)} // Fügt Kapitel am Ende ein
                    className="mb-4 bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500"
                >
                    Add New Chapter
                </button>
                <ul>
                    {nodes.map((node, index) => (
                        <li key={node.id}>
                            {/* Button vor einem Kapitel einfügen */}
                            <button
                                onClick={() => handleAddNode(null, index)} // Fügt Kapitel an der angegebenen Position ein
                                className="bg-green-200 text-green-700 px-2 py-1 rounded hover:bg-green-300 mb-2"
                            >
                                + Add Chapter Here
                            </button>

                            {/* Das Kapitel selbst */}
                            <Folder
                                node={node}
                                onNodeClick={handleNodeClick}
                                onDeleteNode={handleDeleteNode}
                                onEditNode={handleEditNode}
                            />

                            {/* Nach dem letzten Kapitel einfügen */}
                            {index === nodes.length - 1 && (
                                <button
                                    onClick={() => handleAddNode(null, null)} // Fügt Kapitel am Ende ein
                                    className="bg-green-200 text-green-700 px-2 py-1 rounded hover:bg-green-300 mt-2"
                                >
                                    + Add Chapter at End
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </aside>

            {/* Hauptbereich: Aktuelles Kapitel */}
            <main className="flex-1 p-4">
                {currentNode ? (
                    <>
                        <h1 className="text-2xl font-bold mb-4">{currentNode.name}</h1>
                        <button
                            onClick={() => handleAddNode(currentNode.id, null)} // Fügt ein neues Unterkapitel am Ende ein
                            className="mb-4 bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500"
                        >
                            Add Subchapter
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
