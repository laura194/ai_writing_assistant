import { useEffect, useState, useRef } from "react";
import { Node } from "../utils/types";
import { getIcon } from "../utils/icons";
import { Atom } from "lucide-react";
import AIBubble from "./ai/AIBubble";
import AIComponent from "./ai/AIComponent";

export interface FileContentCardProps {
  node: Node;
}

function FileContentCard({ node }: FileContentCardProps) {
  const [isAIBubbleOpen, setIsAIBubbleOpen] = useState(false);
  const [fileContent, setFileContent] = useState<string>(node.content || "...");
  const [selectedText, setSelectedText] = useState("");
  const [isAIComponentShown, setIsAIComponentShown] = useState(false);
  const [aiNodeName, setAiNodeName] = useState(node.name || "");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setFileContent(node.content || "...");
  }, [node]);

  const handleReplace = (newContent: string) => {
    if (!selectedText) return;

    setFileContent((prev) => {
      if (!prev.includes(selectedText)) return prev;
      return prev.replace(selectedText, newContent);
    });
  };

  const handleAppend = (additionalContent: string) => {
    setFileContent((prev) => `${prev}\n${additionalContent}`);
  };

  const handleTextSelect = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const selection = textarea.value
      .substring(textarea.selectionStart, textarea.selectionEnd)
      .trim();
    if (!selection) return;

    setSelectedText(selection);
    setIsAIBubbleOpen(true);
  };

  const handleAIBubbleClick = () => {
    setIsAIBubbleOpen(false);
    setAiNodeName(`${node.name} (Selection)`);
    setIsAIComponentShown(true);
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      const textarea = textareaRef.current;
      const activeElement = document.activeElement;

      if (!textarea || activeElement !== textarea) return;

      const selection = textarea.value
        .substring(textarea.selectionStart, textarea.selectionEnd)
        .trim();

      if (!selection) {
        setSelectedText("");
        setIsAIBubbleOpen(false);
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  return (
    <div className="relative p-4 shadow-lg rounded-lg bg-gray-200">
      <h2 className="text-lg font-bold mb-4 flex items-center justify-between">
        {node.name}
        {isAIBubbleOpen && selectedText && (
          <AIBubble
            position={{ x: 200, y: 40 }}
            onClick={handleAIBubbleClick}
          />
        )}
      </h2>

      <div className="absolute top-3 right-3 flex items-center space-x-2">
        <button
          className="text-blue-800 hover:text-blue-800 hover:bg-gray-300 p-1 rounded"
          onClick={() => {
            setSelectedText(fileContent);
            setAiNodeName(node.name || "");
            setIsAIComponentShown(true);
          }}
          title="Ask AI about this content"
        >
          <Atom className="w-6 h-6" />
        </button>
        {getIcon(node, "size-8")}
      </div>

      {isAIComponentShown && (
        <AIComponent
          selectedText={selectedText}
          nodeName={aiNodeName || ""}
          isOpen={isAIComponentShown}
          onClose={() => setIsAIComponentShown(false)}
          onReplace={handleReplace}
          onAppend={handleAppend}
        />
      )}

      <textarea
        ref={textareaRef}
        value={fileContent}
        onChange={(e) => setFileContent(e.target.value)}
        onMouseUp={handleTextSelect}
        className="w-full h-80 p-3 rounded bg-white text-sm resize-none focus:outline-none focus:ring focus:ring-blue-300"
        placeholder="Write your content here..."
        spellCheck={false}
      />
    </div>
  );
}

export default FileContentCard;
