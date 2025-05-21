import { Node } from "../utils/types";
import { getIcon } from "../utils/icons";
import MarkdownContent from "./MarkdownContent";

export interface FileContentCardProps {
  node: Node;
}

/**
 * Component for displaying a file with a title, icon, and content.
 */
function FileContentCard({ node }: FileContentCardProps) {
  return (
    <div className="relative p-4 shadow-lg rounded-lg bg-gray-200">
      <div className="absolute top-3 right-3">{getIcon(node, "size-8")}</div>
      <h2 className="text-lg font-bold mb-4">{node.name}</h2>
      <MarkdownContent content={node.content || ""} />
    </div>
  );
}

export default FileContentCard;
