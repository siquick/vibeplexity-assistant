import { z } from "zod";

// Available tools: webSearch, fetchUrl, generateHaiku

const plannerSchema = z.object({
  reasoning: z.string().describe("Brief explanation of your planning approach"),
  tools: z.array(z.enum(["webSearch", "fetchUrl", "generateHaiku"])).describe("The tools you plan to use in order"),
  parameters: z
    .object({
      webSearch: z.array(z.string()).optional().describe("Search queries for web search tool"),
      fetchUrl: z.array(z.string()).optional().describe("URLs to fetch content from"),
      generateHaiku: z.array(z.string()).optional().describe("Prompts for haiku generation"),
    })
    .describe("Parameters organized by tool name"),
  expectedWorkflow: z.string().describe("Brief description of how you'll use the tool results to answer the query"),
});

const plannerPrompt = (userQuery) => {
  const today = new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
  return `
You are an expert agentic planner tasked with breaking down user queries into actionable steps.

## USER QUERY
${userQuery}

## AVAILABLE TOOLS
1. **webSearch**: Search the web for current information using the Exa API
   - Use for: finding latest news, current events, research, general information
   - Parameters: query (string)

2. **fetchUrl**: Fetch and convert URL content to Markdown
   - Use for: extracting content from specific web pages or articles
   - Parameters: url (string)

3. **generateHaiku**: Generate traditional haikus (5-7-5 syllable pattern)
   - Use for: creative writing, poetry, artistic expression
   - Parameters: prompt (string)

## PLANNING RULES
1. **Temporal Queries**: If the query mentions "latest", "recent", "today", "current", etc., include "${today}" in your search terms
2. **URL Handling**: If the query contains URLs, plan to fetch them first, then potentially search for related information
3. **Multi-step Approach**: Break complex queries into logical steps
4. **Search Strategy**: For web searches, create 2-4 targeted queries that capture different aspects of the topic
5. **Information Synthesis**: Plan how you'll combine results from multiple tools to provide a comprehensive answer

## EXAMPLES
- Query: "What's the latest iPhone news?" 
  → tools: ["webSearch"]
  → parameters: { "webSearch": ["iPhone ${today} latest news", "iPhone announcement 2025"] }
  
- Query: "Summarise this article [URL] and find related news"
  → tools: ["fetchUrl", "webSearch"]  
  → parameters: { "fetchUrl": ["https://example.com/article"], "webSearch": ["related news topic"] }

- Query: "Create a haiku about recent AI developments"
  → tools: ["webSearch", "generateHaiku"]
  → parameters: { "webSearch": ["AI developments ${today}"], "generateHaiku": ["AI developments and innovation"] }

## RESPONSE FORMAT
Your response must be a JSON object with this exact structure:
{
  "reasoning": "explanation of your approach",
  "tools": ["toolName1", "toolName2"],
  "parameters": {
    "webSearch": ["query1", "query2"],
    "fetchUrl": ["url1", "url2"], 
    "generateHaiku": ["prompt1", "prompt2"]
  },
  "expectedWorkflow": "how you'll use the results"
}

Only include parameter arrays for tools you're actually using. Each parameter value must be a simple array of strings.

Analyse the user query and create a comprehensive plan.`;
};

export { plannerSchema, plannerPrompt };
