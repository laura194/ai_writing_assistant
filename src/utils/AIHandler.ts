import { AIResult, IAiProtocolEntry } from "../models/IAITypes";

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
 * Sends a request to the AI API and returns the response.
 * @param {string} prompt - The input text for the AI.
 * @returns {Promise<string>} - The AI's response as a string.
 */

export const fetchAIResponse = async (prompt: string): Promise<AIResult> => {
  if (!API_KEY) {
    console.error(
      "No API key found! Make sure the .env file exists and the variable is set correctly.",
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
      throw new Error(`API-Error: ${response.status} ${response.statusText}`);
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
    console.error("An error occurred while making the request.:", error);
    return {
      text: "An error occurred while making the request..",
    };
  }
};

export const createAIProtocolEntry = async (
  entry: IAiProtocolEntry,
): Promise<void> => {
  try {
    const response = await fetch("/api/ai/aiProtocol", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create AI protocol entry.");
    }

    await response.json();
  } catch (error) {
    console.error("Error creating AI protocol entry:", error);
  }
};
