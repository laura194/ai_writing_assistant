import { useEffect, useState } from "react";
import { Node } from "../utils/types";
import { getIcon } from "../utils/icons";
import MarkdownContent from "./MarkdownContent";
import AIPopup from "../components/ai/AIPopup";
import { AIResult } from "../models/IAITypes";
import { Atom } from "lucide-react";
import AIResponseDialog from "./ai/AIResponseDialog";
import { createAIProtocolEntry } from "../utils/AIHandler";

export interface FileContentCardProps {
  node: Node;
}

/**
 * Component for displaying a file with a title, icon, and content.
 */
function FileContentCard({ node }: FileContentCardProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isResponseOpen, setIsResponseOpen] = useState(false);
  const [aiResult, setAIResult] = useState<AIResult | null>(null);
  const [fileContent, setFileContent] = useState<string>(node.content || "...");

  useEffect(() => {
    setFileContent(node.content || "...");
  }, [node]);

  const handleReplaceContent = (newContent: string) => {
    setFileContent(newContent);

    // Create AI protocol entry
    createAIProtocolEntry({
      aiName: aiResult?.modelVersion || "Unknown AI",
      usageForm: aiResult?.prompt || "Unknown prompt",
      affectedParts: node.name || "Unknown file",
      remarks: aiResult?.text || "No remarks",
    });
  };

  const handleFetchResponse = (result: AIResult) => {
    setAIResult(result);
    setIsPopupOpen(false);
    setIsResponseOpen(true);
  };

  return (
    <div className="relative p-4 shadow-lg rounded-lg bg-gray-200">
      <h2 className="text-lg font-bold mb-4">{node.name}</h2>
      <div className="absolute top-3 right-3 flex items-center space-x-2">
        <button
          className="text-blue-800 hover:text-blue-800 hover:bg-gray-300 p-1 rounded"
          onClick={() => setIsPopupOpen(true)}
          title="Ask AI about this content"
        >
          <Atom className="w-6 h-6" />
        </button>
        {getIcon(node, "size-8")}
      </div>

      <AIPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        selectedText={fileContent || ""}
        onFetchResponse={handleFetchResponse}
      />

      {aiResult && (
        <AIResponseDialog
          isOpen={isResponseOpen}
          onClose={() => setIsResponseOpen(false)}
          result={aiResult}
          onReplaceContent={handleReplaceContent}
        />
      )}

      <MarkdownContent content={fileContent} />
    </div>
  );
}

export default FileContentCard;
