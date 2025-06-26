import { Dialog } from "@headlessui/react";
import { useState, useEffect, useRef } from "react";
import { Lightbulb, X, Check, Plus } from "lucide-react";
import { fetchAIResponse, createAIProtocolEntry } from "../../utils/AIHandler";
import { AIResult } from "../../models/IAITypes";
import MarkdownContent from "../MarkdownContent";
import { useParams } from "react-router-dom";

interface AIComponentProps {
  selectedText: string;
  nodeName: string;
  isOpen: boolean;
  onClose: () => void;
  onReplace: (newContent: string) => void;
  onAppend: (additionalContent: string) => void;
}

const suggestions = [
  "Make this passage more concise.",
  "Check this for grammar.",
  "Expand on this idea.",
];

function AIComponent({
  selectedText,
  nodeName,
  isOpen,
  onClose,
  onReplace,
  onAppend,
}: AIComponentProps) {
  const [history, setHistory] = useState<AIResult[]>([]);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const suggestionsMenuRef = useRef<HTMLDivElement>(null);
  const { projectId } = useParams<{ projectId: string }>();

  useEffect(() => {
    if (isOpen) {
      setAdditionalPrompt("");
      setShowSuggestions(false);
      setHistory([]);
      setPrompts([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsMenuRef.current &&
        !suggestionsMenuRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSuggestions]);

  const createProtocolAt = (index: number, action: "Replace" | "Append") => {
    const relevantPrompts = prompts.slice(0, index + 1);
    createAIProtocolEntry({
      aiName: history[index]?.modelVersion || "Unknown AI",
      usageForm: `${action}: ${relevantPrompts.join(" | ") || "Unknown prompt"}`,
      affectedParts: nodeName || "Unknown file",
      remarks: history[index]?.text || "No remarks",
      projectId: projectId || "unknown-project",
    });
  };

  const handleReplaceAt = (index: number) => {
    if (history[index]) {
      createProtocolAt(index, "Replace");
      onReplace(history[index].text);
      onClose();
    }
  };

  const handleAppendAt = (index: number) => {
    if (history[index]) {
      createProtocolAt(index, "Append");
      onAppend(history[index].text);
      onClose();
    }
  };

  const handleFetchResponse = async () => {
    if (!additionalPrompt.trim()) return;
    setLoading(true);
    const fullText = `${selectedText} ${additionalPrompt}`.trim();
    const result = await fetchAIResponse(fullText);
    result.originalText = selectedText;
    result.prompt = additionalPrompt;
    setPrompts((prev) => [...prev, additionalPrompt]);
    setHistory((prev) => [...prev, result]);
    setAdditionalPrompt("");
    setLoading(false);
  };

  const handleFollowUp = async () => {
    const last = history[history.length - 1];
    if (!last || !additionalPrompt.trim()) return;
    setLoading(true);
    const followUpText = `${last.text} ${additionalPrompt}`.trim();
    const result = await fetchAIResponse(followUpText);
    result.originalText = last.text;
    result.prompt = additionalPrompt;
    setPrompts((prev) => [...prev, additionalPrompt]);
    setHistory((prev) => [...prev, result]);
    setAdditionalPrompt("");
    setLoading(false);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="fixed inset-0 bg-transparent" aria-hidden="true" />

      <div
        ref={dialogRef}
        className="absolute top-[63px] bg-white p-6 rounded-lg shadow-xl border border-gray-300 transition-all duration-300 w-[1200px]"
      >
        <div className="flex justify-between items-center mb-4 cursor-move">
          <h2 className="text-lg font-semibold">AI Assistant</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollbarer Bereich für Originaltext + Verlauf */}
        <div className="mt-2 space-y-4 max-h-[50vh] overflow-y-auto pr-2">
          {/* Original Text */}
          <div>
            <h4 className="text-xs text-gray-500 mb-1">Original Text</h4>
            <div className="bg-gray-100 p-2 rounded text-sm max-w-[1100px]">
              <MarkdownContent content={selectedText} />
            </div>
          </div>

          {/* AI Response History */}
          {history.map((item, index) => (
            <div key={index} className="border-t pt-2 flex flex-col gap-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs text-gray-500 mb-1">
                    Prompt: {item.prompt || "–"}
                  </h4>
                  <div className="bg-gray-100 p-2 rounded text-sm max-w-[1100px]">
                    <MarkdownContent content={item.text} />
                  </div>
                </div>
                <div className="flex flex-col gap-1 ml-4">
                  <button
                    title="Replace with this text"
                    onClick={() => handleReplaceAt(index)}
                    className="p-1 rounded hover:bg-gray-200"
                  >
                    <Check className="w-5 h-5 text-green-600" />
                  </button>
                  <button
                    title="Append this text"
                    onClick={() => handleAppendAt(index)}
                    className="p-1 rounded hover:bg-gray-200"
                  >
                    <Plus className="w-5 h-5 text-blue-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Prompt Input & Suggestions */}
        <div className="mt-6 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-1">
            Refine or continue with a new prompt
          </h3>
          <textarea
            className="w-full p-2 border rounded bg-gray-100 text-gray-700 mb-2"
            placeholder="Note: This AI has no memory. Your prompt will only refer to the most recent version of the text."
            value={additionalPrompt}
            onChange={(e) => setAdditionalPrompt(e.target.value)}
            key={history.length}
          />

          <div className="flex justify-between items-center relative">
            <button onClick={() => setShowSuggestions(!showSuggestions)}>
              <Lightbulb className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={
                history.length === 0 ? handleFetchResponse : handleFollowUp
              }
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {loading ? "Loading..." : "Ask AI"}
            </button>

            {showSuggestions && (
              <div
                ref={suggestionsMenuRef}
                className="absolute left-0 ml-4 mt-2 w-64 bg-white border rounded shadow-lg z-10"
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                    onClick={() => {
                      setAdditionalPrompt(suggestion);
                      setShowSuggestions(false);
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default AIComponent;
