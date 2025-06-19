import { useState, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Node } from "../utils/types";

interface FolderProps {
    node: Node;
    onMove: (draggedNodeId: string, targetNodeId: string) => void; // Neuer Callback
    onNodeClick: (node: Node) => void;
    onAdd: (parentId: string | null, newNode: Node) => void;
    onRemove: (nodeId: string) => void;
    isVisible?: boolean;
}

function Folder({ node, onMove, onNodeClick, onAdd, onRemove, isVisible = true }: FolderProps) {
    const ref = useRef<HTMLLIElement>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editableName, setEditableName] = useState(node.name);

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

    // Prüfen, ob der Node Kinder hat
    const hasChildren = Array.isArray(node.nodes) && node.nodes.length > 0;

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
                        ref={inputRef} // Verknüpfung des Inputs mit dem Ref
                        className="border px-2 py-1"
                        value={editableName}
                        onChange={(e) => setEditableName(e.target.value)}
                        onBlur={handleSaveEdit} // Speichern beim Verlassen
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
                            setTimeout(() => selectInputText(), 0); // Warten, bis `isEditing` true ist
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
                {node.name !== "Add chapter to project" && ( // Bedingung: Kein Löschen des Root-Knotens
                    <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => onRemove(node.id)}
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
        </li>
    );
}

export default Folder;