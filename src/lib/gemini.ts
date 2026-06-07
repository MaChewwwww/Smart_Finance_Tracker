import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generates content using the Gemini API, with automatic fallback to a secondary key on failure.
 * @param prompt The prompt to send to the model.
 * @param systemInstruction Optional system-level instructions to guide the model's behavior.
 * @returns The text response from the model.
 */
export async function generateContent(prompt: string, systemInstruction?: string): Promise<string> {
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  const primaryKey = process.env.GEMINI_API_KEY;
  const fallbackKey = process.env.GEMINI_FALLBACK_API_KEY;

  if (!primaryKey) {
    throw new Error("Primary GEMINI_API_KEY is not configured in .env.local.");
  }

  // 1. Attempt using primary API key
  try {
    const genAI = new GoogleGenerativeAI(primaryKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      ...(systemInstruction ? { systemInstruction } : {}),
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    if (!text) {
      throw new Error("Empty response received from primary Gemini client.");
    }
    return text;
  } catch (primaryError: any) {
    console.warn("⚠️ Primary Gemini API key failed. Error details:", primaryError.message || primaryError);

    // 2. Fall back if a secondary key is configured
    if (fallbackKey && fallbackKey !== primaryKey) {
      console.info("🔄 Attempting to generate content using GEMINI_FALLBACK_API_KEY...");
      try {
        const genAIFallback = new GoogleGenerativeAI(fallbackKey);
        const modelFallback = genAIFallback.getGenerativeModel({
          model: modelName,
          ...(systemInstruction ? { systemInstruction } : {}),
        });

        const resultFallback = await modelFallback.generateContent(prompt);
        const textFallback = resultFallback.response.text();
        if (!textFallback) {
          throw new Error("Empty response received from fallback Gemini client.");
        }
        return textFallback;
      } catch (fallbackError: any) {
        console.error("❌ Fallback Gemini API key also failed. Error:", fallbackError.message || fallbackError);
        throw new Error(`Gemini API error (primary & fallback failed): ${fallbackError.message || fallbackError}`);
      }
    } else {
      // No fallback key configured, bubble up original error
      throw new Error(`Gemini API error: ${primaryError.message || primaryError}`);
    }
  }
}
