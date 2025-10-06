import { useRef } from "react";
import { Node } from "../../utils/types";
import { getIcon } from "../../utils/icons";
import { motion } from "framer-motion";

interface FolderProps {
  node: Node;
  onNodeClick: (node: Node) => void;
  isVisible?: boolean;
  selectedNodeId?: string;
}

function FolderRead({
  node,
  onNodeClick,
  isVisible = true,
  selectedNodeId = "",
}: FolderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isSelected = selectedNodeId === node.id;

  const hasChildren = Array.isArray(node.nodes) && node.nodes.length > 0;

  return (
    <li
      className={`my-1 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      } ${isVisible ? "max-h-screen" : "max-h-0 overflow-hidden"} `}
    >
      <div className="flex items-center gap-2">
        {/* Icon */}
        <motion.div ref={wrapperRef}>
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full bg-[#e9e5f8] dark:bg-[#1e1538]`}
          >
            {getIcon(node, "w-5 h-5", node.icon)}
          </div>
        </motion.div>

        {/* Name */}
        <motion.span
          whileHover={{ scale: 1.025, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.95 }}
          className={`flex-1 min-w-0 whitespace-normal break-words cursor-pointer px-3 py-2 rounded-lg
            ${
              isSelected
                ? `text-[#362466] dark:text-white bg-transparent border border-transparent transition-colors duration-0`
                : `hover:bg-[#eae5fa] dark:hover:bg-[#312350] hover:shadow-[0_2_8px_rgba(120,69,239,0.3)] dark:hover:shadow-[0_2_8px_rgba(120,69,239,0.2)] border border-transparent transition-colors duration-200`
            }`}
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
      </div>

      {/* Children */}
      {hasChildren && (
        <div
          className={`${
            node.id !== "1"
              ? "max-h-[700px] overflow-y-auto pr-2 max-w-full overflow-x-auto"
              : ""
          }`}
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
                <FolderRead
                  key={childNode.id}
                  node={childNode}
                  onNodeClick={onNodeClick}
                  isVisible={isVisible}
                  selectedNodeId={selectedNodeId}
                />
              ))}
            </div>
          </ul>
        </div>
      )}
    </li>
  );
}

export default FolderRead;
