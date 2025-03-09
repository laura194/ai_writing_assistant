import ReactMarkdown from "react-markdown";
import { Node } from "../utils/types";
import { getIcon } from "../utils/icons";
import AIResponseComponent from "./AIResponseComponent";

/**
 * Properties for the FileContentCard component.
 * @interface FileContentCardProps
 * @property {Node} node - The node representing the file to display.
 */
export interface FileContentCardProps {
  node: Node;
}

/**
 * FileContentCard component that renders a card displaying file content with an icon, title, and markdown content.
 * @component
 * @param {FileContentCardProps} props - The properties passed to the component.
 * @returns- The rendered file content card component.
 */
function FileContentCard({ node }: FileContentCardProps) {
  return (
    <div className="relative p-4 shadow-lg rounded-lg bg-gray-200">
      {/* Icon oben rechts */}
      <div className="absolute top-3 right-3 ">{getIcon(node, "size-8")}</div>
      <h2 className="text-lg font-bold mb-4">{node.name}</h2>
      {/* Markdown ohne className, stattdessen über `components` gestylt */}
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mt-2">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-bold">{children}</strong>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mt-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mt-2">{children}</ol>
          ),
          li: ({ children }) => <li className="mt-1">{children}</li>,
        }}
      >
        {node.content}
      </ReactMarkdown>
      <br></br>
      <AIResponseComponent />
    </div>
  );
}

export default FileContentCard;
