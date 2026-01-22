
import { GoogleGenAI, Type } from "@google/genai";

// Initialize with direct process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateIslandLore(islandName: string, treasureType: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, mystical lore snippet for a treasure found in the game 'Echo Isles'. 
      Island Name: ${islandName}. Treasure Type: ${treasureType}. 
      Keep it poetic, focused on lost rhythms and music.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING }
          },
          required: ["title", "content"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI");
    }

    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      title: "Unknown Echo",
      content: "The whispers of this island are too faint to translate..."
    };
  }
}
