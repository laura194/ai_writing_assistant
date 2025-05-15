import { useState, useRef, useEffect } from "react";
import { Node } from "../utils/types";
import { getIcon } from "../utils/icons";
import AIResponse from "./AIResponse";
import AIBubble from "./AIBubble";
import AIPopup from "./AIPopup";
import { AIResult } from "../models/IAIProtocol";

export interface FileContentCardProps {
  node: Node;
}

function FileContentCard({ node }: FileContentCardProps) {
  const [content, setContent] = useState<string>(node.content || "");
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const selectedTextRef = useRef<string | null>(null); // NEU: useRef für Text-Speicherung
  const [showBubble, setShowBubble] = useState(false);
  const [aiResponse, setAIResponse] = useState<AIResult | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [bubblePosition, setBubblePosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  // useEffect to update content whenever the `node` prop changes
  useEffect(() => {
    setContent(node.content || "");
  }, [node]); // Abhängig von `node`, wird ausgeführt, wenn sich die `node`-Props ändern

  const handleTextSelect = () => {
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        console.log("❌ Keine Auswahl erkannt.");
        return;
      }

      const selected = selection.toString().trim();
      console.log("🟡 Ausgewählter Text:", selected);

      if (selected.length > 0) {
        const range = selection.getRangeAt(0);
        let rect = range.getBoundingClientRect();

        if (rect.width === 0 || rect.height === 0) {
          const parentElement = selection.anchorNode?.parentElement;
          if (parentElement) {
            rect = parentElement.getBoundingClientRect();
          }
        }

        console.log("📌 Text wurde markiert:", selected);
        setSelectedText(selected);
        selectedTextRef.current = selected; // Speichert den Text dauerhaft
        setShowBubble(true);
        setBubblePosition({
          top: rect.top + window.scrollY - 35,
          left: rect.left + window.scrollX + rect.width / 2,
        });
      } else {
        console.log("⚠️ Kein Text wurde markiert.");
        setShowBubble(false);
      }
    }, 200);
  };

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  const handleReplaceText = () => {
    console.log("🚀 handleReplaceText gestartet...");
    console.log("🔍 Aktueller State:");
    console.log("  - selectedText:", selectedTextRef.current);
    console.log("  - aiResponse:", aiResponse);

    if (selectedTextRef.current && aiResponse) {
      console.log("✅ Ersetze Text...");

      const escapedText = escapeRegExp(selectedTextRef.current);
      const newContent = content.replace(
        new RegExp(escapedText, "g"),
        aiResponse.text
      );

      console.log("🔹 Alter Inhalt:", content);
      console.log("🔹 Neuer Inhalt:", newContent);

      setContent(newContent);
      setAIResponse(null);
      setSelectedText(null);
      selectedTextRef.current = null; // Jetzt erst zurücksetzen
    } else {
      console.log("⚠️ Kein Text ausgewählt oder AI-Antwort fehlt.");
    }
  };

  return (
    <div className="relative p-4 shadow-lg rounded-lg bg-gray-200">
      <div className="absolute top-3 right-3">{getIcon(node, "size-8")}</div>
      <h2 className="text-lg font-bold mb-4">{node.name}</h2>
      <textarea
        ref={textareaRef}
        className="w-full h-[500px] p-2 border border-gray-300 rounded-md bg-white resize-none"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onMouseUp={handleTextSelect}
        spellCheck={false}
      />

      {showBubble && bubblePosition && selectedText && (
        <AIBubble
          position={bubblePosition}
          onClick={() => setShowBubble(false)}
        />
      )}

      {selectedText && !showBubble && (
        <AIPopup
          isOpen={!showBubble && !!selectedText}
          selectedText={selectedText}
          onClose={() => setSelectedText(null)}
          onFetchResponse={(response) => setAIResponse(response)}
        />
      )}

      {aiResponse && (
        <AIResponse
          response={aiResponse}
          onReplace={handleReplaceText}
          cardName={node.name}
        />
      )}
    </div>
  );
}

export default FileContentCard;
