import { useState, useRef, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { Lightbulb, Atom } from "lucide-react";
import { fetchAIResponse } from "../utils/AIHandler";

interface AIPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  onFetchResponse: (response: string) => void;
}

const suggestions = [
  "Make this passage more concise.",
  "Check this for grammar.",
  "Expand on this idea.",
];

const AIPopup = ({
  isOpen,
  onClose,
  selectedText,
  onFetchResponse,
}: AIPopupProps) => {
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const startPosition = useRef({ x: 0, y: 0 });

  // Setzt das Fenster in die Bildschirmmitte, wenn es geöffnet wird
  useEffect(() => {
    if (isOpen) {
      const centerX = window.innerWidth / 2 - 200; // Fensterbreite ~400px
      const centerY = window.innerHeight / 2 - 100; // Fensterhöhe ~200px
      setPosition({ x: centerX, y: centerY });
    }
  }, [isOpen]);

  // AI Anfrage
  const handleConfirm = async () => {
    setLoading(true);
    const fullText = `${selectedText} ${additionalPrompt}`.trim();
    const response = await fetchAIResponse(fullText);
    setLoading(false);
    onFetchResponse(response);
    onClose(); // Schließt das Fenster nach der Antwort
  };

  // Schließen beim Klicken außerhalb
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Drag & Drop Start
  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true);
    startPosition.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    };
  };

  // Dragging Bewegung
  const handleMouseMove = (event: MouseEvent) => {
    if (!dragging) return;
    setPosition({
      x: event.clientX - startPosition.current.x,
      y: event.clientY - startPosition.current.y,
    });
  };

  // Drag & Drop Ende
  const handleMouseUp = () => setDragging(false);

  useEffect(() => {
    if (dragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 flex items-center justify-center p-4"
    >
      <div
        ref={dialogRef}
        className="absolute bg-white p-4 rounded-lg shadow-lg w-96 border border-gray-300 cursor-grab"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      >
        <div
          className="flex justify-between items-center mb-2 cursor-move"
          onMouseDown={handleMouseDown}
        >
          <p className="text-lg font-bold">How can I help?</p>
          <Atom className="w-6 h-6 text-gray-600" />
        </div>

        <textarea
          className="w-full p-2 border rounded bg-gray-100 text-gray-700"
          placeholder="Prompt for AI..."
          value={additionalPrompt}
          onChange={(e) => setAdditionalPrompt(e.target.value)}
        />

        <div
          className="mt-2 flex justify-between items-center relative"
          ref={suggestionsRef}
        >
          <button onClick={() => setShowSuggestions(!showSuggestions)}>
            <Lightbulb className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={handleConfirm}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {loading ? "Loading..." : "Ask AI"}
          </button>

          {showSuggestions && (
            <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow-lg">
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
    </Dialog>
  );
};

export default AIPopup;
