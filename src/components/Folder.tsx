import { useState, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Node } from "../utils/types";

import IconPicker from "../components/IconPicker";
import { getIcon } from "../utils/icons";

interface FolderProps {
  node: Node;
  onMove: (draggedNodeId: string, targetNodeId: string, asSibling?: boolean) => void;
  onNodeClick: (node: Node) => void;
  onAdd: (parentId: string | null, newNode: Node) => void;
  onRemove: (nodeId: string) => void;
  isVisible?: boolean;
}

function Folder({
                  node,
                  onMove,
                  onNodeClick,
                  onAdd,
                  onRemove,
                  isVisible = true,
                  onRenameOrIconUpdate, // Neuer Callback für Änderungen
                }: FolderProps & { onRenameOrIconUpdate: (updatedNode: Node) => void }) {

  const ref = useRef<HTMLLIElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [showIconPicker, setShowIconPicker] = useState(false); // Zustandsvariable für den Icon-Picker

  // Lokale Zustände
  const [isEditing, setIsEditing] = useState(false);
  const [editableName, setEditableName] = useState(node.name);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false); // Popup-Zustand
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null); // Speichert den zu löschenden Node

  // Speichert den neuen Namen und übergibt den geänderten Node an `onRenameOrIconUpdate`
  const handleSaveEdit = () => {
    const updatedNode = { ...node, name: editableName }; // Aktuellen Node mit geändertem Namen erstellen
    onRenameOrIconUpdate(updatedNode); // Callback mit aktualisiertem Node aufrufen
    setIsEditing(false); // Bearbeitungsmodus beenden
  };


  const handleIconChange = (newIcon: string) => {
    const updatedNode = { ...node, icon: newIcon };
    onRenameOrIconUpdate(updatedNode); // Aktualisierte Node zurückgeben
    setShowIconPicker(false);
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
    canDrag: node.name !== "Chapter structure", // Deaktiviert Dragging, wenn der Name "Kapitel hinzufügen" ist
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, dropRef] = useDrop({
    accept: "node",
    hover: (draggedItem: { id: string }, monitor) => {
      if (draggedItem.id !== node.id && node.name !== "Chapter structure") {
        if (!ref.current) return;

        // Bestimme die Position des Mauszeigers relativ zum Drop-Target
        const hoverBoundingRect = ref.current.getBoundingClientRect();
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset();

        if (!clientOffset) return;

        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        // Wenn der Mauszeiger in der oberen Hälfte ist, als Sibling behandeln
        // Wenn in der unteren Hälfte, als Kind behandeln
        const isSibling = hoverClientY < hoverMiddleY;

        // Rufe onMove mit zusätzlichem Parameter auf
        onMove(draggedItem.id, node.id, isSibling);
      }
    },
  });

  // Kombinierte Ref-Logik
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

        {/* Icon-Anzeige */}
        <div
            className={`${
                node.name !== "Chapter structure" ? "cursor-pointer" : "cursor-default"
            }`}
            onClick={() => {
              if (node.name !== "Chapter structure") {
                setShowIconPicker(!showIconPicker); // IconPicker nur umschalten, wenn nicht "Chapter structure"
              }
            }}
            title={
              node.name !== "Chapter structure"
                  ? "Klicke, um ein Icon auszuwählen"
                  : "Das Icon dieses Kapitels kann nicht geändert werden"
            }
        >
          {getIcon(node, "size-6", node.icon)}
        </div>

        {/* IconPicker nur anzeigen, wenn geöffnet und nicht "Chapter structure" */}
        {showIconPicker && node.name !== "Chapter structure" && (
            <IconPicker
                currentIcon={node.icon} // Das aktuell ausgewählte Icon des Nodes
                onSelect={(handleIconChange)}
            />
        )}

        {/* Knotenname bearbeiten */}
        {isEditing && node.name !== "Chapter structure" ? ( // Bearbeiten nur ermöglichen, wenn es sich nicht um "Chapter structure" handelt
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
                className={`${
                    node.name !== "Chapter structure"
                        ? "cursor-pointer"
                        : "cursor-default" // Kein Cursor für nicht bearbeitbare Knoten
                }`}
                onDoubleClick={() => {
                  if (node.name !== "Chapter structure") { // Bearbeiten auf Doppelklick verhindern, falls "Chapter structure"
                    setIsEditing(true);
                    setTimeout(() => selectInputText(), 0);
                  }
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
        {node.name !== "Chapter structure" && (
          <button
            className="text-red-500 hover:text-red-700"
            onClick={() => handleDeleteClick(node.id)} // Popup öffnen
          >
            x
          </button>
        )}
      </div>

      {hasChildren && (
          <ul className={`pl-4 ${
              node.name === "Chapter structure"
                  ? "max-h-[500px] overflow-y-auto pr-2 max-w-full overflow-x-auto"
                  : ""
          }`}>
            <div className={`${
                node.name === "Chapter structure"
                    ? "min-w-fit"
                    : ""
            }`}>
              {node.nodes!.map((childNode) => (
                  <Folder
                      key={childNode.id}
                      node={childNode}
                      onMove={onMove}
                      onNodeClick={onNodeClick}
                      onAdd={onAdd}
                      onRemove={onRemove}
                      isVisible={isVisible}
                      onRenameOrIconUpdate={onRenameOrIconUpdate} // Hier die korrekte Weitergabe
                  />
              ))}
            </div>
          </ul>
      )}


      {/* Bestätigungs-Popup */}
      {showConfirmPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
          {" "}
          <div className="bg-white rounded-lg shadow-xl p-6 space-y-4">
            <p className="text-center text-lg font-bold">
              Do you really want to delete this chapter?
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
