import { ChevronRightIcon, FolderIcon } from "@heroicons/react/24/solid";
import File from "./File";
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
 *
 * Folder component that represents a folder in a hierarchical file structure.
 * This component renders the folder's name, its contents (if any), and handles the opening and closing of the folder.
 * It manages the state of whether the folder is open or closed, saving this state in localStorage for persistence.
 * It renders nested folders recursively and allows interaction through clicks to toggle folder visibility.
 * @component
 * @param {FolderProps} props - The properties passed to the Folder component.
 * @param {Node} props.node - The folder's data, including its name, ID, and potential child nodes.
 * @param {Function} props.onNodeClick - A callback function to handle the click event for a file or folder.
 * @returns - A list item representing the folder, with possible child folders rendered below.
 */
function Folder({ node, onNodeClick }: FolderProps) {
  if (!node) return null;

  const storageKey = `isOpen-${node.id}`;
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    const savedState = localStorage.getItem(storageKey);
    return savedState ? JSON.parse(savedState) : false;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(isOpen));
  }, [isOpen, storageKey]);

  return (
    <li className="my-1.5">
      <span className="flex items-center gap-1.5">
        {node.nodes && node.nodes.length > 0 ? (
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
          <span className="pl-4" /> // Placeholder for ChevronRightIcon for empty folders
        )}
        {node.nodes ? (
          <>
            <FolderIcon className="size-6 text-gray-700" />
            {node.name}
          </>
        ) : (
          <File node={node} onClick={() => onNodeClick(node)} />
        )}
      </span>
      {isOpen && node.nodes && (
        <ul className="pl-6">
          {node.nodes.map((childNode) => (
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
