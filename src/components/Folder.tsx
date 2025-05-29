import { Node } from "../utils/types";

interface FolderProps {
  node: Node;
  onNodeClick: (node: Node) => void;
  onDeleteNode: (nodeId: string) => void;
  onEditNode: (updatedNode: Node) => void;
}

const Folder = ({ node, onNodeClick, onDeleteNode, onEditNode }: FolderProps) => {
  return (
      <li>
        {/* Kapitelname */}
        <div className="flex items-center py-2">
        <span
            onClick={() => onNodeClick(node)}
            className="cursor-pointer text-blue-700 hover:underline"
        >
          {node.name}
        </span>
          {/* Buttons für Aktionen an diesem Kapitel */}
          <button
              onClick={() => onDeleteNode(node.id)}
              className="ml-4 bg-red-200 text-red-700 px-2 py-1 rounded hover:bg-red-300"
          >
            Delete
          </button>
          <button
              onClick={() => {
                const newName = prompt("Enter new chapter name:", node.name);
                if (newName) onEditNode({ ...node, name: newName });
              }}
              className="ml-2 bg-green-200 text-green-700 px-2 py-1 rounded hover:bg-green-300"
          >
            Edit
          </button>
        </div>

        {/* Unterkapitel anzeigen (rekursiver Aufruf) */}
        {node.nodes && node.nodes.length > 0 && (
            <ul className="ml-4 pl-4 border-l-2 border-gray-300">
              {node.nodes.map((childNode) => (
                  <Folder
                      key={childNode.id}
                      node={childNode}
                      onNodeClick={onNodeClick}
                      onDeleteNode={onDeleteNode}
                      onEditNode={onEditNode}
                  />
              ))}
            </ul>
        )}
      </li>
  );
};

export default Folder;