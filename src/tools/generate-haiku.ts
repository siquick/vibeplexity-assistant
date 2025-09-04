import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

/**
 * Generates a haiku based on a given prompt using AI
 * @param prompt - The prompt to generate a haiku from
 * @returns Promise<string> - The generated haiku
 */
export async function generateHaiku(prompt: string): Promise<string> {
  try {
    const result = await generateText({
      model: openai("gpt-4.1-nano"),
      prompt: `Generate a traditional haiku (5-7-5 syllable pattern) based on this prompt: ${prompt}
      
      Rules:
      - Follow the 5-7-5 syllable pattern strictly
      - Include nature imagery when possible
      - Capture a moment or emotion
      - Return only the haiku, no explanations
      - Use line breaks between the three lines`,
    });

    return result.text;
  } catch (error) {
    console.error(`Haiku generation failed: ${error instanceof Error ? error.message : String(error)}`);

    // Fallback to a placeholder haiku
    return `AI dreams unfold here\nWords dance like cherry blossoms\nSpring code gently flows`;
  }
}
