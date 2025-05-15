import { AIResult } from "../models/IAIProtocol";

interface APIRequest {
  contents: { parts: { text: string }[] }[];
}

interface APIResponse {
  candidates?: { content?: { parts?: { text: string }[] } }[];
}

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/**
 * Sendet eine Anfrage an die AI-API und gibt die Antwort zurück.
 * @param {string} prompt - Der Eingabetext für die AI.
 * @returns {Promise<string>} - Die AI-Antwort als String.
 */
export const fetchAIResponse = async (prompt: string): Promise<AIResult> => {
  if (!API_KEY) {
    console.error(
      "Kein API-Key gefunden! Stelle sicher, dass die .env-Datei existiert und die Variable korrekt gesetzt ist.",
    );
  }

  const requestData: APIRequest = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`API-Fehler: ${response.status} ${response.statusText}`);
    }

    const data: APIResponse & {
      modelVersion?: string;
      usageMetadata?: {
        promptTokenCount: number;
        candidatesTokenCount: number;
        totalTokenCount: number;
      };
    } = await response.json();

    return {
      text:
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Keine Antwort erhalten.",
      modelVersion: data.modelVersion,
      usageMetadata: data.usageMetadata,
    };
  } catch (error) {
    console.error("Fehler bei der Anfrage:", error);
    return {
      text: "Fehler bei der AI-Anfrage.",
    };
  }
};

