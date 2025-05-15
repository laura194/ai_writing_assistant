import { ChevronRightIcon, FolderIcon } from "@heroicons/react/24/solid";
// import File from "./File";
import { useState, useEffect } from "react";
import { Node } from "../utils/types";

/**
 * FolderProps interface that defines the expected properties for the Folder component.
 * @interface FolderProps
 * @property {Node} node - The folder node data, which includes information such as the folder's name, ID, and any nested child nodes.
 * @property {Function} onNodeClick - A callback function that is triggered when a file or folder is clicked. This function accepts a Node object as an argument.
 */
interface FolderProps {
  node: Node;
  onNodeClick: (node: Node) => void;
}

/**
 * Folder component that represents a folder in a hierarchical file structure.
 * This component handles the display of folder names, their children (subfolders/files), and manages the open/close state.
 * @component
 */
function Folder({ node, onNodeClick }: FolderProps) {
  const storageKey = `isOpen-${node.id}`;
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    const savedState = localStorage.getItem(storageKey);
    return savedState ? JSON.parse(savedState) : false;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(isOpen));
  }, [isOpen, storageKey]);

  // Render fallback, falls ein ungültiger Knoten übergeben wird
  if (!node) {
    return <li className="my-1.5">Invalid node</li>;
  }

  return (
      <li className="my-1.5">
      <span className="flex items-center gap-1.5">
        {node.children && node.children.length > 0 ? (
            <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(!isOpen);
                }}
            >
              <ChevronRightIcon
                  className={`size-4 text-gray-500 ${isOpen ? "rotate-90" : ""}`}
              />
            </button>
        ) : (
            <span className="pl-4" /> // Platzhalter für leere Elemente (keine Kinder)
        )}
        <FolderIcon className="size-6 text-gray-700" />
        <span onClick={() => onNodeClick(node)}>{node.name}</span>
      </span>
        {isOpen && node.children && (
            <ul className="pl-6">
              {node.children.map((childNode) => (
                  <Folder
                      node={childNode}
                      key={childNode.id}
                      onNodeClick={onNodeClick}
                  />
              ))}
            </ul>
        )}
      </li>
  );
}

export default Folder;