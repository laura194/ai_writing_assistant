import { useState, useRef, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Node } from "../../utils/types";
import IconPicker from "../IconPicker/IconPicker";
import { getIcon } from "../../utils/icons";
import { motion } from "framer-motion";
import { PlusCircle, Trash2, CircleX } from "lucide-react";
import { Dialog } from "@headlessui/react";
import { useTheme } from "../../providers/ThemeProvider";

interface FolderProps {
  node: Node;
  onMove: (
    draggedNodeId: string,
    targetNodeId: string,
    asSibling?: boolean
  ) => void;
  onNodeClick: (node: Node) => void;
  onAdd: (parentId: string | null, newNode: Node) => void;
  onRemove: (nodeId: string) => void;
  isVisible?: boolean;
  selectedNodeId?: string;
}

function Folder({
  node,
  onMove,
  onNodeClick,
  onAdd,
  onRemove,
  isVisible = true,
  onRenameOrIconUpdate, // Neuer Callback für Änderungen
  selectedNodeId = "", // ID des aktuell ausgewählten Knotens
}: FolderProps & { onRenameOrIconUpdate: (updatedNode: Node) => void }) {
  const ref = useRef<HTMLLIElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [showIconPicker, setShowIconPicker] = useState(false); // Zustandsvariable für den Icon-Picker

  const isSelected = selectedNodeId === node.id;

  // Lokale Zustände
  const [isEditing, setIsEditing] = useState(false);
  const [editableName, setEditableName] = useState(node.name);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null); // Speichert den zu löschenden Node

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [isOpen, setIsOpen] = useState(false);

  const handleSaveEdit = () => {
    const trimmed = editableName.trim();
    if (trimmed.length === 0) {
      // Wenn nichts (oder nur Leerzeichen) eingegeben wurde,
      // auf den alten Namen zurücksetzen und nicht speichern
      setEditableName(node.name);
    } else {
      // Nur gültige, nicht-leere Namen speichern
      const updatedNode = { ...node, name: trimmed };
      onRenameOrIconUpdate(updatedNode);
    }
    setIsEditing(false);
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
    canDrag: node.id !== "1", // Deaktiviert Dragging, wenn der Name "Kapitel hinzufügen" ist
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, dropRef] = useDrop({
    accept: "node",
    hover: (draggedItem: { id: string }, monitor) => {
      if (draggedItem.id !== node.id && node.id !== "1") {
        if (!ref.current) return;

        // Bestimme die Position des Mauszeigers relativ zum Drop-Target
        const hoverBoundingRect = ref.current.getBoundingClientRect();
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
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
    setIsOpen(true); // Zeigt das Popup an
  };

  // Löschung bestätigen
  const confirmDelete = () => {
    if (nodeToDelete) {
      onRemove(nodeToDelete); // Führt die tatsächliche Löschung aus
      setNodeToDelete(null);
    }
    setIsOpen(false); // Schließt das Popup
  };

  // Löschung abbrechen
  const cancelDelete = () => {
    setNodeToDelete(null); // Löscht den gespeicherten Node
    setIsOpen(false); // Schließt das Popup
  };

  useEffect(() => {
    if (!showIconPicker) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target) &&
        pickerRef.current &&
        !pickerRef.current.contains(target)
      ) {
        setShowIconPicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showIconPicker]);

  return (
    <li
      className={`my-1 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      } ${isVisible ? "max-h-screen" : "max-h-0 overflow-hidden"} `}
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="flex items-center gap-2">
        {/* Icon-Anzeige */}
        <motion.div
          ref={wrapperRef}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-colors duration-200 
            ${showIconPicker ? "bg-gradient-to-tr from-indigo-600 to-purple-400 shadow-[0_0_12px_rgba(120,69,239,0.5)] dark:shadow-[0_0_20px_rgba(120,69,239,0.4)]" : "bg-[#d7c9f5] dark:bg-[#2e214b] hover:bg-[#b098e3] dark:hover:bg-[#443764] shadow-[0_0_10px_rgba(120,69,239,0.25)] dark:shadow-[0_0_10px_rgba(120,69,239,0.15)]"}
            ${node.id !== "1" ? "cursor-pointer" : "cursor-not-allowed"}`}
          onClick={() => {
            if (node.id !== "1") {
              setShowIconPicker(!showIconPicker); // IconPicker nur umschalten, wenn nicht "1"
            }
          }}
          title={
            node.id !== "1"
              ? "Click to change icon"
              : "The icon cannot be changed for this node"
          }
        >
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full bg-[#e9e5f8] dark:bg-[#1e1538] 
              ${
                showIconPicker
                  ? "text-[#5622c9] dark:text-[#faf8ff]"
                  : "text-[#947cc9] dark:text-[#a396c4] group-hover:text-[#362466] dark:group-hover:text-white"
              }`}
          >
            {getIcon(node, "w-5 h-5", node.icon)}
          </div>
        </motion.div>
        {/* IconPicker nur anzeigen, wenn geöffnet und nicht "1" */}
        {showIconPicker && node.id !== "1" && (
          <div className="absolute ml-12 z-15" ref={pickerRef}>
            <IconPicker
              currentIcon={node.icon}
              onSelect={(icon) => {
                handleIconChange(icon);
                setShowIconPicker(false);
              }}
            />
          </div>
        )}
        {/* Knotenname bearbeiten */}
        {isEditing && node.id !== "1" ? ( // Bearbeiten nur ermöglichen, wenn es sich nicht um "1" handelt
          <input
            ref={inputRef}
            className="w-full bg-transparent border border-[#bba8e4] dark:border-[#1f1630] px-3 py-1 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-600 transition"
            value={editableName}
            onChange={(e) => setEditableName(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSaveEdit();
              }
              if (e.key === "Escape") {
                setIsEditing(false);
                setEditableName(node.name);
              }
            }}
            autoFocus
          />
        ) : (
          <motion.span
            whileHover={{ scale: 1.025, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.95 }}
            className={`flex-1 min-w-0 whitespace-normal break-words cursor-pointer px-3 py-2 rounded-lg
              ${
                isSelected
                  ? `text-[#362466] dark:text-white bg-transparent border border-transparent transition-colors duration-0`
                  : `hover:bg-[#eae5fa] dark:hover:bg-[#312350] hover:shadow-[0_2_8px_rgba(120,69,239,0.3)] dark:hover:shadow-[0_2_8px_rgba(120,69,239,0.2)] border border-transparent transition-colors duration-200`
              }`}
            onDoubleClick={() => {
              if (node.id !== "1") {
                // Bearbeiten auf Doppelklick verhindern, falls "1"
                setIsEditing(true);
                setTimeout(() => selectInputText(), 0);
              }
            }}
            onClick={() => onNodeClick(node)}
          >
            {isSelected ? (
              <span
                className="relative z-10 block rounded-lg px-3 py-2 border-[2px] border-transparent"
                style={{
                  borderImage:
                    "linear-gradient(to left, #facc15, #ec4899, #8b5cf6) 1",
                }}
              >
                <span className="relative">
                  {node.name}
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 via-pink-400 to-yellow-300 rounded-full" />
                </span>
              </span>
            ) : (
              node.name
            )}
          </motion.span>
        )}
        {/* Kapitel hinzufügen */}
        <motion.button
          whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.95 }}
          onClick={() =>
            onAdd(node.id, {
              id: Date.now().toString(),
              name: "New chapter",
              nodes: [],
            })
          }
          className="text-green-600 hover:text-green-400 dark:text-green-500 dark:hover:text-green-300 transition-colors duration-300 cursor-pointer"
          title="Add chapter"
        >
          <PlusCircle className="w-4 h-4" />
        </motion.button>

        {/* Kapitel löschen */}
        {node.id !== "1" && (
          <motion.button
            whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDeleteClick(node.id)}
            className="text-red-500 hover:text-red-400 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-300 cursor-pointer"
            title="Delete chapter"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {hasChildren && (
        <div
          className={`${node.id !== "1" ? "max-h-[700px] overflow-y-auto pr-2 max-w-full overflow-x-auto" : ""}`}
        >
          <ul
            className={`pl-4 space-y-1 ${
              node.id !== "1"
                ? "border-l border-[#baaaed]/30 dark:border-[#32265b]/80 ml-0.5"
                : ""
            }`}
          >
            <div className={`${node.id !== "1" ? "min-w-fit" : ""}`}>
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
                  selectedNodeId={selectedNodeId}
                />
              ))}
            </div>
          </ul>
        </div>
      )}

      {/* Bestätigungs-Popup */}
      <Dialog
        open={isOpen}
        onClose={cancelDelete}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          aria-hidden="true"
        />

        <Dialog.Panel className="relative w-full max-w-[630px] mx-4 min-h-[32vh]">
          <motion.div
            initial={{ backgroundPosition: "0% 50%" }}
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ ease: "linear", duration: 4, repeat: Infinity }}
            className="absolute -inset-[3px] rounded-2xl"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #7c3aed, #db2777, #facc15)",
              backgroundSize: "200% 200%",
            }}
          />

          <div
            className="relative bg-[#e9e5f8] dark:bg-[#1e1538] rounded-2xl px-6 py-3
                    shadow-[0_0_40px_rgba(120,69,239,0.6)] dark:shadow-[0_0_40px_rgba(120,69,239,0.4)] min-h-[32vh] flex flex-col items-center"
          >
            <Dialog.Title className="text-4xl font-bold text-center text-[#362466] dark:text-white mb-3 uppercase leading-relaxed tracking-wide mt-2">
              Delete "{node.name}"
            </Dialog.Title>
            <Dialog.Description className="text-center text-[#261e3b] dark:text-[#aaa6c3] mb-10 text-lg">
              Do you really want to delete "{node.name}"? <br /> This action can
              not be undone!
            </Dialog.Description>

            <div className="flex justify-center gap-24 items-center">
              <motion.div
                onClick={confirmDelete}
                whileHover={{
                  scale: 1.05,
                  boxShadow: isDark
                    ? "0 0 25px rgba(255, 100, 100, 0.45)"
                    : "0 0 10px rgba(255, 100, 100, 0.55)",
                }}
                className="group cursor-pointer p-[2px] rounded-xl 
             dark:bg-red-600 bg-red-700
             w-[300px] mx-auto"
              >
                <div className="group flex items-center justify-center bg-[#e9e5f8] dark:bg-[#1e1538] bg-opacity-90 backdrop-blur-md py-4 rounded-xl shadow-inner shadow-red-600/20 dark:shadow-red-500/30 border border-[#ab3939] dark:border-[#471717]">
                  <Trash2 className="w-7 h-7 stroke-[#d58b8b] dark:stroke-[#ffcccc] transition-colors duration-300 group-hover:stroke-[#c74747] dark:group-hover:stroke-[#fff0f0]" />
                  <span className="ml-3 text-2xl text-[#d58b8b] dark:text-[#ffcccc] font-semibold transition-colors duration-300 group-hover:text-[#c74747] dark:group-hover:text-[#fff0f0] relative before:absolute before:-bottom-1 before:left-0 before:w-0 before:h-[2px] before:bg-[#c74747] dark:before:bg-[#ffcccc] group-hover:before:w-full before:transition-all before:duration-300">
                    Delete {node.name}
                  </span>
                </div>
              </motion.div>

              <motion.div
                onClick={cancelDelete}
                whileHover={{
                  scale: 1.05,
                  boxShadow: isDark
                    ? "0 0 20px rgba(120,69,239,0.4)"
                    : "0 0 10px rgba(120,69,239,0.6)",
                }}
                className="group cursor-pointer p-[2px] rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 w-[160px] mx-auto"
              >
                <div className="group flex items-center justify-center bg-[#e9e5f8] dark:bg-[#1e1538] bg-opacity-90 backdrop-blur-md p-4 rounded-xl shadow-inner shadow-cyan-800/30 dark:shadow-cyan-800/40 border border-[#beadee] dark:border-[#32265b]">
                  <CircleX className="w-7 h-7 stroke-[#9c80db] dark:stroke-[#af8efb] transition-colors duration-300 group-hover:stroke-[#6848b2] dark:group-hover:stroke-[#e7dcff]" />
                  <span className="ml-3 text-2xl text-[#9c80db] dark:text-[#af8efb] font-semibold transition-colors duration-300 group-hover:text-[#6848b2] dark:group-hover:text-[#e7dcff] relative before:absolute before:-bottom-1 before:left-0 before:w-0 before:h-[2px] before:bg-[#6848b2] dark:before:bg-[#af8efb] group-hover:before:w-full before:transition-all before:duration-300">
                    Cancel
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </li>
  );
}

export default Folder;
