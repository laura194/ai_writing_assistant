import { useEffect, useState } from "react";
import { Node } from "../utils/types";
import { getIcon } from "../utils/icons";
import MarkdownContent from "./MarkdownContent";
import { Atom } from "lucide-react";
import AIBubble from "./ai/AIBubble";
import AIComponent from "./ai/AIComponent";

export interface FileContentCardProps {
  node: Node;
}

/**
 * Component for displaying a file with a title, icon, and content.
 */
function FileContentCard({ node }: FileContentCardProps) {
  const [isAIBubbleOpen, setIsAIBubbleOpen] = useState(false);
  const [fileContent, setFileContent] = useState<string>(node.content || "...");
  const [selectedText, setSelectedText] = useState("");
  const [isAIComponentShown, setIsAIComponentShown] = useState(false);
  const [bubblePosition, setBubblePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    setFileContent(node.content || "...");
  }, [node]);

  const handleReplace = (newContent: string) => {
    setFileContent(newContent);
  };

  const handleAppend = (additionalContent: string) => {
    setFileContent((prev) => `${prev}\n${additionalContent}`);
  };

  const handleTextSelect = (text: string, coords: { x: number; y: number }) => {
    setSelectedText(text);
    setBubblePosition(coords);
    setIsAIBubbleOpen(true);
  };

  const handleAIBubbleClick = () => {
    setIsAIBubbleOpen(false);
    setIsAIComponentShown(true);
  };

  return (
    <div className="relative p-4 shadow-lg rounded-lg bg-gray-200">
      <h2 className="text-lg font-bold mb-4">{node.name}</h2>
      <div className="absolute top-3 right-3 flex items-center space-x-2">
        <button
          className="text-blue-800 hover:text-blue-800 hover:bg-gray-300 p-1 rounded"
          onClick={() => setIsAIComponentShown(true)}
          title="Ask AI about this content"
        >
          <Atom className="w-6 h-6" />
        </button>
        {getIcon(node, "size-8")}
      </div>

      {isAIBubbleOpen && bubblePosition && (
        <AIBubble position={bubblePosition} onClick={handleAIBubbleClick} />
      )}

      {isAIComponentShown && (
        <AIComponent
          selectedText={fileContent}
          nodeName={node.name || ""}
          isOpen={isAIComponentShown}
          onClose={() => setIsAIComponentShown(false)}
          onReplace={handleReplace}
          onAppend={handleAppend}
        />
      )}

      <MarkdownContent content={fileContent} onTextSelect={handleTextSelect} />
    </div>
  );
}

export default FileContentCard;
