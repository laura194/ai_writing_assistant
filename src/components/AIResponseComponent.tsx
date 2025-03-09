import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { fetchAIResponse } from "../utils/AIHandler";
import { CodeBracketIcon, XMarkIcon } from "@heroicons/react/24/solid"; // Heroicons Import

const AIResponseComponent = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false); // Zustand für das Ausklappen

  const handleAIRequest = async () => {
    if (!prompt.trim()) {
      alert("Bitte gib einen Text ein!");
      return;
    }

    setLoading(true);
    setResponse("");

    const result = await fetchAIResponse(prompt);
    setResponse(result);
    setLoading(false);
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      {!expanded ? (
        <button
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={() => setExpanded(true)}
        >
          <CodeBracketIcon className="h-5 w-5 mr-2" /> {/* AI-Icon */}
          AI Anfragen
        </button>
      ) : (
        <div>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">AI Anfragen</h2>
            <button
              className="p-1 text-gray-500 hover:text-gray-700"
              onClick={() => setExpanded(false)}
            >
              <XMarkIcon className="h-5 w-5" /> {/* X-Icon zum Einklappen */}
            </button>
          </div>
          <textarea
            className="w-full p-2 border rounded-md mt-2"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Gib hier deinen Text ein..."
          />
          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
            onClick={handleAIRequest}
            disabled={loading}
          >
            {loading ? "Lädt..." : "Get AI Response"}
          </button>
          {response && ( // Antwortfeld nur anzeigen, wenn eine Antwort vorhanden ist
            <div className="mt-4 p-2 border rounded-md bg-white">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIResponseComponent;
