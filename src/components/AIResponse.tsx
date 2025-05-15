import axios from "axios";
import ReactMarkdown from "react-markdown";
import { AIResult, IAiProtocol } from "../models/IAIProtocol";

/**
 * Properties für AIResponse
 */
interface AIResponseProps {
  response: AIResult;
  onReplace: (oldText: string, newText: string, prompt: string) => void;
  cardName: string;
}

/**
 * AIResponse Component:
 * Zeigt die AI-Antwort als Markdown gerendert an.
 */
const AIResponse = ({ response, onReplace, cardName }: AIResponseProps) => {
  const oldText = "Alter Text"; // Hier den alten Text dynamisch einfügen (abhängig von deinem Code)
  const prompt = "Zusätzlicher Prompt"; // Der zusätzliche Prompt, der verwendet wurde

  const handleReplace = () => {
    // Aufruf der onReplace Funktion mit den nötigen Parametern
    onReplace(oldText, response.text, prompt);
    // Optional: Protokoll in der Konsole anzeigen
    addProtocol({
      aiName: response.modelVersion ?? "",
      usageForm: response.prompt ?? "",
      affectedParts: cardName,
      remarks: response.text,
    });
    console.log("Alter Text:", oldText);
    console.log("Neuer Text:", response);
    console.log("Prompt:", prompt);
  };

  const addProtocol = async (protocolData: IAiProtocol) => {
    try {
      const response = await axios.post<IAiProtocol>(
        "/api/ai/aiProtocol",
        protocolData
      );
      console.log("Protokoll erfolgreich hinzugefügt:", response.data);
      return response.data;
    } catch (error) {
      console.error("Fehler beim Hinzufügen des Protokolls:", error);
      throw error;
    }
  };
  return (
    <div className="mt-4 p-4 border border-gray-300 rounded bg-white shadow">
      <h3 className="font-bold text-lg">AI Response:</h3>
      <ReactMarkdown>{response.text}</ReactMarkdown>
      <button
        onClick={handleReplace}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Replace original text
      </button>
    </div>
  );
};

export default AIResponse;
