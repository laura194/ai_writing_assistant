import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Node } from "../utils/types";
import { getIcon } from "../utils/icons";

/**
 * Properties for the FileContentCard component.
 * @interface FileContentCardProps
 * @property {Node} node - The node representing the file to display.
 * @property {(updatedNode: Node) => void} onContentChange - Callback to handle content changes.
 */
export interface FileContentCardProps {
    node: Node;
    onContentChange: (updatedNode: Node) => void;
}

/**
 * FileContentCard component that renders a card displaying file content with an icon, title, and markdown content.
 * Allows editing of the content.
 * @component
 */
function FileContentCard({ node, onContentChange }: FileContentCardProps) {
    const [isEditing, setIsEditing] = useState(false); // Bearbeitungsmodus
    const [localContent, setLocalContent] = useState(node.content); // Lokaler Inhalt-State

    // Speichern der Änderungen
    const handleSave = () => {
        setIsEditing(false); // Bearbeiten beenden
        onContentChange({ ...node, content: localContent }); // Änderungen übergeben
    };

    return (
        <div className="relative p-4 shadow-lg rounded-lg bg-gray-200">
            {/* Icon oben rechts */}
            <div className="absolute top-3 right-3">{getIcon(node, "size-8")}</div>
            <h2 className="text-lg font-bold mb-4">{node.name}</h2>

            {/* Inhalt: Bearbeitungsmodus oder Markdown-Anzeige */}
            {isEditing ? (
                <textarea
                    className="w-full h-32 p-2 border border-gray-300 rounded-md"
                    value={localContent}
                    onChange={(e) => setLocalContent(e.target.value)}
                />
            ) : (
                <ReactMarkdown
                    components={{
                        p: ({ children }) => <p className="mt-2">{children}</p>,
                        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                        ul: ({ children }) => <ul className="list-disc pl-5 mt-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-5 mt-2">{children}</ol>,
                        li: ({ children }) => <li className="mt-1">{children}</li>,
                    }}
                >
                    {node.content || "Kein Inhalt verfügbar."}
                </ReactMarkdown>
            )}

            {/* Aktionen: Bearbeiten/Abbrechen und Speichern */}
            <div className="mt-4 flex space-x-4">
                {isEditing ? (
                    <>
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            onClick={handleSave}
                        >
                            Speichern
                        </button>
                        <button
                            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                            onClick={() => {
                                setIsEditing(false); // Bearbeiten abbrechen
                                setLocalContent(node.content); // Änderungen zurücksetzen
                            }}
                        >
                            Abbrechen
                        </button>
                    </>
                ) : (
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        onClick={() => setIsEditing(true)}
                    >
                        Bearbeiten
                    </button>
                )}
            </div>
        </div>
    );
}

export default FileContentCard;