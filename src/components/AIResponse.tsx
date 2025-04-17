import ReactMarkdown from "react-markdown";

/**
 * Properties für AIResponse
 */
interface AIResponseProps {
  response: string;
  onReplace: (oldText: string, newText: string, prompt: string) => void;
}

/**
 * AIResponse Component:
 * Zeigt die AI-Antwort als Markdown gerendert an.
 */
const AIResponse = ({ response, onReplace }: AIResponseProps) => {
  const oldText = "Alter Text"; // Hier den alten Text dynamisch einfügen (abhängig von deinem Code)
  const prompt = "Zusätzlicher Prompt"; // Der zusätzliche Prompt, der verwendet wurde

  const handleReplace = () => {
    // Aufruf der onReplace Funktion mit den nötigen Parametern
    onReplace(oldText, response, prompt);

    // Optional: Protokoll in der Konsole anzeigen
    console.log("KI-Protokoll:");
    console.log("Alter Text:", oldText);
    console.log("Neuer Text:", response);
    console.log("Prompt:", prompt);
  };

  return (
    <div className="mt-4 p-4 border border-gray-300 rounded bg-white shadow">
      <h3 className="font-bold text-lg">AI Response:</h3>
      <ReactMarkdown>{response}</ReactMarkdown>
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
