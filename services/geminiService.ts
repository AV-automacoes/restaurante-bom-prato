
import { GoogleGenAI, Type } from "@google/genai";
import { AiRecommendation, MenuCategory } from "../types";

// Assume process.env.API_KEY is configured in the build environment
const API_KEY = process.env.API_KEY;

export const getAiRecommendation = async (
  userPrompt: string,
  menu: MenuCategory[]
): Promise<AiRecommendation[]> => {
  if (!API_KEY) {
    // This will be caught by the component and show an error message.
    console.error("API_KEY is not set. AI features will not work.");
    throw new Error("API Key not configured. AI features are disabled.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const simplifiedMenu = menu.map(category => ({
    category: category.name,
    items: category.items.map(item => ({
      name: item.name,
      description: item.description,
      // Include customization options in the prompt for better recommendations
      options: item.customizationGroups?.map(g => `${g.name}: ${g.options.map(o => o.name).join(', ')}`).join(' | ')
    }))
  }));

  const prompt = `
    You are a helpful and friendly restaurant assistant for "Restaurante Bom Prato", a delivery service for customizable lunch boxes.
    A customer has a request: "${userPrompt}".

    Based on their request, analyze the following menu and recommend up to 2 items. The main item is the "Marmitex a sua escolha". If relevant, suggest some specific combinations of options for the Marmitex.
    For each recommendation, provide the exact 'name' of the item from the menu and a short, friendly, and persuasive reason why you are recommending it.

    Menu:
    ${JSON.stringify(simplifiedMenu)}
  `;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: {
                            type: Type.STRING,
                            description: "The exact name of the recommended menu item."
                        },
                        reason: {
                            type: Type.STRING,
                            description: "A short, friendly reason for the recommendation, possibly suggesting customizations."
                        }
                    },
                    required: ["name", "reason"]
                }
            }
        }
    });

    const jsonText = response.text.trim();
    const recommendations = JSON.parse(jsonText);
    
    // Basic validation
    if (!Array.isArray(recommendations)) {
        throw new Error("Invalid response format from AI.");
    }

    return recommendations as AiRecommendation[];

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get recommendation from AI.");
  }
};
