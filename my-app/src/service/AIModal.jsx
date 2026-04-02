import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const cleanJsonResponse = (text) => {
  if (!text) return "";

  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
};

export const generateTripPlan = async (prompt) => {
  if (!ai) {
    throw new Error("Gemini API key missing. Set VITE_GEMINI_API_KEY in .env.local.");
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const rawText = response?.text;
  const cleaned = cleanJsonResponse(rawText);

  if (!cleaned) {
    throw new Error("AI returned an empty trip response.");
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("AI response was not valid JSON. Please try again.");
  }
};


