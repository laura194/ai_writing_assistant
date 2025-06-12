import { useState } from "react";
import { Node } from "../utils/types";
// import File from "./File";

interface FolderProps {
    node: Node;
    onNodeClick: (node: Node) => void;
    onAdd: (parentId: string | null, newNode: Node) => void;
    onRemove: (nodeId: string) => void;
    isVisible?: boolean; // Neuer Prop, um Sichtbarkeit der Nodes zu steuern
}

function Folder({ node, onNodeClick, onAdd, onRemove, isVisible = true }: FolderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editableName, setEditableName] = useState(node.name);

    const handleSaveEdit = () => {
        onNodeClick({ ...node, name: editableName });
        setIsEditing(false);
    };

    // Prüfen, ob der Node Kinder hat
    const hasChildren = Array.isArray(node.nodes) && node.nodes.length > 0;

    return (
        <li
            className={`my-2 transition-opacity duration-300 ${
                isVisible ? "opacity-100" : "opacity-0"
            } ${isVisible ? "max-h-screen" : "max-h-0 overflow-hidden"} `}
        >
            <div className="flex items-center gap-2">
                {/* Knotenname bearbeiten */}
                {isEditing ? (
                    <input
                        className="border px-2 py-1"
                        value={editableName}
                        onChange={(e) => setEditableName(e.target.value)}
                        onBlur={handleSaveEdit}
                        autoFocus
                    />
                ) : (
                    <span
                        className="cursor-pointer"
                        onDoubleClick={() => setIsEditing(true)}
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
                            name: "Neues Kapitel",
                            nodes: [],
                        })
                    }
                >
                    +
                </button>

                {/* Kapitel löschen */}
                <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => onRemove(node.id)}
                >
                    x
                </button>
            </div>

            {hasChildren && (
                <ul className="pl-4">
                    {node.nodes!.map((childNode) => (
                        <Folder
                            key={childNode.id}
                            node={childNode}
                            onNodeClick={onNodeClick}
                            onAdd={onAdd}
                            onRemove={onRemove}
                            isVisible={isVisible} // Kindknoten erhalten Sichtbarkeit vom Elternknoten
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}

export default Folder;