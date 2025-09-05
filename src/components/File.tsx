import { Node } from "../utils/types";
import { getIcon } from "../utils/icons";
/**
 * Properties for the File component.
 * @interface FileProps
 * @property {Node} node - The file node object.
 * @property {(node: Node) => void} [onClick] - Optional callback function to handle click events.
 */
interface FileProps {
  node: Node;
  onClick?: (node: Node) => void;
}

/**
 * File component that renders an icon and the name of a file based on its category.
 * @component
 * @param {FileProps} props - The properties passed to the component.
 * @returns The rendered component.
 */
function File({ node, onClick }: FileProps) {
  return (
    <div
      className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-200 p-1 rounded"
      onClick={() => {
        if (onClick) {
          onClick(node);
        }
      }}
    >
      <span className="flex items-center gap-1.5">
        {getIcon(node, "size-6")}
        {node.name}
      </span>
    </div>
  );
}

export default File;
