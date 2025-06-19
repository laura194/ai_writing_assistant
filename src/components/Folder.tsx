import { useState, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Node } from "../utils/types";

interface FolderProps {
    node: Node;
    onMove: (draggedNodeId: string, targetNodeId: string) => void;
    onNodeClick: (node: Node) => void;
    onAdd: (parentId: string | null, newNode: Node) => void;
    onRemove: (nodeId: string) => void;
    isVisible?: boolean;
}

function Folder({ node, onMove, onNodeClick, onAdd, onRemove, isVisible = true }: FolderProps) {
    const ref = useRef<HTMLLIElement>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Lokale Zustände
    const [isEditing, setIsEditing] = useState(false);
    const [editableName, setEditableName] = useState(node.name);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false); // Popup-Zustand
    const [nodeToDelete, setNodeToDelete] = useState<string | null>(null); // Speichert den zu löschenden Node

    const handleSaveEdit = () => {
        onNodeClick({ ...node, name: editableName });
        setIsEditing(false);
    };

    const selectInputText = () => {
        if (inputRef.current) {
            inputRef.current.select();
        }
    };

    // Drag-and-Drop-Logik
    const [{ isDragging }, dragRef] = useDrag({
        type: "node",
        item: { id: node.id },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, dropRef] = useDrop({
        accept: "node",
        hover: (draggedItem: { id: string }) => {
            if (draggedItem.id !== node.id) {
                onMove(draggedItem.id, node.id); // Bewege den Knoten
            }
        },
    });

    dragRef(dropRef(ref));

    const hasChildren = Array.isArray(node.nodes) && node.nodes.length > 0;

    // Bestätigung zum Löschen anzeigen
    const handleDeleteClick = (nodeId: string) => {
        setNodeToDelete(nodeId); // Speichert den Node, dessen Löschung bestätigt werden soll
        setShowConfirmPopup(true); // Zeigt das Popup an
    };

    // Löschung bestätigen
    const confirmDelete = () => {
        if (nodeToDelete) {
            onRemove(nodeToDelete); // Führt die tatsächliche Löschung aus
            setNodeToDelete(null);
        }
        setShowConfirmPopup(false); // Schließt das Popup
    };

    // Löschung abbrechen
    const cancelDelete = () => {
        setNodeToDelete(null); // Löscht den gespeicherten Node
        setShowConfirmPopup(false); // Schließt das Popup
    };

    return (
        <li
            className={`my-2 transition-opacity duration-300 ${
                isVisible ? "opacity-100" : "opacity-0"
            } ${isVisible ? "max-h-screen" : "max-h-0 overflow-hidden"} `}
            ref={ref}
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            <div className="flex items-center gap-2">
                {/* Knotenname bearbeiten */}
                {isEditing ? (
                    <input
                        ref={inputRef}
                        className="border px-2 py-1"
                        value={editableName}
                        onChange={(e) => setEditableName(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSaveEdit();
                            }
                        }}
                        autoFocus
                    />
                ) : (
                    <span
                        className="cursor-pointer"
                        onDoubleClick={() => {
                            setIsEditing(true);
                            setTimeout(() => selectInputText(), 0);
                        }}
                        onClick={() => onNodeClick(node)}
                    >
            {node.name}
          </span>
                )}

                {/* Kapitel hinzufügen */}
                <button
                    className="text-green-500 hover:text-green-700"
                    onClick={() =>
                        onAdd(node.id, {
                            id: Date.now().toString(),
                            name: "New chapter",
                            nodes: [],
                        })
                    }
                >
                    +
                </button>

                {/* Kapitel löschen */}
                {node.name !== "Projektübersicht" && (
                    <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteClick(node.id)} // Popup öffnen
                    >
                        x
                    </button>
                )}
            </div>

            {hasChildren && (
                <ul className="pl-4">
                    {node.nodes!.map((childNode) => (
                        <Folder
                            key={childNode.id}
                            node={childNode}
                            onMove={onMove}
                            onNodeClick={onNodeClick}
                            onAdd={onAdd}
                            onRemove={onRemove}
                            isVisible={isVisible}
                        />
                    ))}
                </ul>
            )}

            {/* Bestätigungs-Popup */}
            {showConfirmPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">                    <div className="bg-white rounded-lg shadow-xl p-6 space-y-4">
                        <p className="text-center text-lg font-bold">
                            Are you sure you want to delete this chapter?
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                onClick={confirmDelete}
                            >
                                Yes, delete
                            </button>
                            <button
                                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                                onClick={cancelDelete}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </li>
    );
}

export default Folder;